import { useState, useCallback, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { useNetworkStatus } from './useServiceWorker';
import { ErrorToast, useErrorToast } from '@/components/ui/ErrorToast';
import { supabase } from '@/integrations/supabase/client';

interface ContentState {
  isLoading: boolean;
  loadingPack: string | null;
  error: string | null;
  downloadProgress: number;
}

interface PackInfo {
  id: string;
  hash: string;
  size: number;
  downloadedAt?: string;
}

export function useContentLoader() {
  const db = useIndexedDB();
  const { isOnline } = useNetworkStatus();
  const { showPackError } = useErrorToast();
  
  const [state, setState] = useState<ContentState>({
    isLoading: false,
    loadingPack: null,
    error: null,
    downloadProgress: 0,
  });

  const checkPackAvailability = useCallback(async (packId: string): Promise<boolean> => {
    if (!db.isInitialized) return false;
    
    try {
      const pack = await db.getPack(packId);
      return !!pack;
    } catch (error) {
      console.error('Error checking pack availability:', error);
      return false;
    }
  }, [db]);

  const downloadPack = useCallback(async (packId: string): Promise<boolean> => {
    if (!db.isInitialized) {
      ErrorToast.show({
        type: 'storage',
        message: 'Local storage not ready',
        recoverable: false,
      });
      return false;
    }

    if (!isOnline) {
      ErrorToast.show({
        type: 'network',
        message: 'No internet connection',
        details: 'Pack download requires internet connection',
        recoverable: true,
      });
      return false;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingPack: packId,
      error: null,
      downloadProgress: 0,
    }));

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Check if pack is already cached
      const cachedPack = await db.getPack(packId);
      if (cachedPack) {
        console.log(`Pack ${packId} already cached`);
        setState(prev => ({
          ...prev,
          isLoading: false,
          loadingPack: null,
          downloadProgress: 100,
        }));
        return true;
      }

      setState(prev => ({ ...prev, downloadProgress: 10 }));

      // Fetch pack metadata and content from content edge function
      console.log(`Downloading pack: ${packId}`);
      
      // Add ETag header for caching if we have the pack cached
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
      
      // Add If-None-Match header if we have cached ETag
      if (cachedPack?.hash) {
        headers['If-None-Match'] = `"${cachedPack.hash}"`;
      }
      
      const response = await fetch(`/functions/v1/content?id=${packId}`, { headers });

      setState(prev => ({ ...prev, downloadProgress: 30 }));

      // Handle 304 Not Modified - use cached content
      if (response.status === 304 && cachedPack) {
        console.log(`Pack ${packId} not modified, using cached version`);
        setState(prev => ({
          ...prev,
          isLoading: false,
          loadingPack: null,
          downloadProgress: 100,
        }));
        return true;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (response.status === 403) {
          ErrorToast.entitlementFailed();
          throw new Error(`Access denied: ${errorData.error}`);
        } else if (response.status === 404) {
          throw new Error(`Pack not found: ${packId}`);
        } else if (response.status === 429) {
          ErrorToast.show({
            type: 'quota',
            message: 'Rate limited',
            details: 'Too many download requests',
            recoverable: true,
          });
          throw new Error('Rate limited');
        } else {
          throw new Error(`Download failed: ${errorData.error || response.statusText}`);
        }
      }

      setState(prev => ({ ...prev, downloadProgress: 50 }));

      const packData = await response.json();
      
      if (!packData.content || !packData.hash) {
        throw new Error('Invalid pack data received');
      }

      setState(prev => ({ ...prev, downloadProgress: 70 }));

      // Store pack in IndexedDB
      const packInfo: PackInfo = {
        id: packId,
        hash: packData.hash,
        size: JSON.stringify(packData.content).length,
        downloadedAt: new Date().toISOString(),
      };

      await db.storePack(packId, {
        ...packInfo,
        data: packData.content,
      });

      setState(prev => ({ ...prev, downloadProgress: 90 }));

      // Store individual questions for easy access
      if (packData.content.questions && Array.isArray(packData.content.questions)) {
        const questions = packData.content.questions.map((q: any) => ({
          ...q,
          packId,
        }));
        
        await db.storeQuestions(questions);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        loadingPack: null,
        downloadProgress: 100,
      }));

      console.log(`Pack ${packId} downloaded successfully`);
      return true;

    } catch (error) {
      console.error('Pack download failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        loadingPack: null,
        error: errorMessage,
        downloadProgress: 0,
      }));

      // Show appropriate error toast
      if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
        // Already handled above
        return false;
      } else if (errorMessage.includes('Rate limited')) {
        // Already handled above
        return false;
      } else if (errorMessage.includes('Network') || !isOnline) {
        ErrorToast.show({
          type: 'network',
          message: 'Download failed',
          details: 'Check your internet connection',
          recoverable: true,
        });
      } else {
        showPackError(packId, error, () => downloadPack(packId));
      }

      return false;
    }
  }, [db, isOnline, showPackError]);

  const getPackInfo = useCallback(async (packId: string): Promise<PackInfo | null> => {
    if (!db.isInitialized) return null;
    
    try {
      const pack = await db.getPack(packId);
      if (!pack) return null;
      
      return {
        id: pack.id,
        hash: pack.hash,
        size: pack.size,
        downloadedAt: pack.downloadedAt,
      };
    } catch (error) {
      console.error('Error getting pack info:', error);
      return null;
    }
  }, [db]);

  const deletePack = useCallback(async (packId: string): Promise<boolean> => {
    if (!db.isInitialized) return false;
    
    try {
      await db.deletePack(packId);
      console.log(`Pack ${packId} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting pack:', error);
      ErrorToast.show({
        type: 'storage',
        message: 'Failed to delete pack',
        details: error instanceof Error ? error.message : 'Unknown error',
        recoverable: false,
      });
      return false;
    }
  }, [db]);

  const clearAllPacks = useCallback(async (): Promise<boolean> => {
    if (!db.isInitialized) return false;
    
    try {
      await db.clearPacks();
      console.log('All packs cleared');
      return true;
    } catch (error) {
      console.error('Error clearing packs:', error);
      ErrorToast.show({
        type: 'storage',
        message: 'Failed to clear packs',
        details: error instanceof Error ? error.message : 'Unknown error',
        recoverable: false,
      });
      return false;
    }
  }, [db]);

  const getStorageUsage = useCallback(async () => {
    if (!db.isInitialized) return { used: 0, available: 0, percentage: 0 };
    
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? Math.round((used / available) * 100) : 0;
        
        return { used, available, percentage };
      }
      
      return { used: 0, available: 0, percentage: 0 };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }, [db]);

  // Monitor storage quota
  useEffect(() => {
    const checkStorageQuota = async () => {
      const usage = await getStorageUsage();
      
      if (usage.percentage > 90) {
        ErrorToast.storageFull();
      } else if (usage.percentage > 80) {
        ErrorToast.show({
          type: 'storage',
          message: 'Storage almost full',
          details: `${usage.percentage}% of device storage used`,
          recoverable: true,
        });
      }
    };

    const interval = setInterval(checkStorageQuota, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [getStorageUsage]);

  return {
    ...state,
    downloadPack,
    checkPackAvailability,
    getPackInfo,
    deletePack,
    clearAllPacks,
    getStorageUsage,
  };
}