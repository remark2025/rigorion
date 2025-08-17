import { useState, useCallback, useEffect, useRef } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { useNetworkStatus } from './useServiceWorker';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ErrorToast } from '@/components/ui/ErrorToast';

interface SyncState {
  isSyncing: boolean;
  queueCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
  isRetrying: boolean;
  retryCount: number;
}

interface SyncOptions {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  autoSync?: boolean;
}

const DEFAULT_OPTIONS: Required<SyncOptions> = {
  batchSize: 50,
  maxRetries: 3,
  retryDelay: 1000, // Start with 1 second
  autoSync: true,
};

export function useSyncManager(options: SyncOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const db = useIndexedDB();
  const { isOnline } = useNetworkStatus();
  
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    queueCount: 0,
    lastSyncAt: null,
    lastError: null,
    isRetrying: false,
    retryCount: 0,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const syncInProgressRef = useRef(false);

  // Load initial state
  useEffect(() => {
    if (db.isInitialized) {
      loadSyncState();
    }
  }, [db.isInitialized]);

  // Auto-sync when online and queue has items
  useEffect(() => {
    if (opts.autoSync && isOnline && syncState.queueCount > 0 && !syncState.isSyncing) {
      const delay = syncState.retryCount > 0 ? 
        Math.min(opts.retryDelay * Math.pow(2, syncState.retryCount), 30000) : 
        1000;
      
      const timer = setTimeout(() => {
        syncAttempts();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOnline, syncState.queueCount, syncState.isSyncing, opts.autoSync]);

  const loadSyncState = useCallback(async () => {
    try {
      const state = await db.getSyncState();
      const queueCount = await db.getQueuedAttemptsCount();
      
      setSyncState(prev => ({
        ...prev,
        queueCount,
        lastSyncAt: state.last_sync_at,
        lastError: state.last_error,
      }));
    } catch (error) {
      console.error('Failed to load sync state:', error);
    }
  }, [db.getSyncState, db.getQueuedAttemptsCount]);

  const syncAttempts = useCallback(async (force = false): Promise<boolean> => {
    if (!db.isInitialized) {
      console.log('DB not initialized, skipping sync');
      return false;
    }

    if (!isOnline && !force) {
      console.log('Offline, skipping sync');
      return false;
    }

    if (syncInProgressRef.current) {
      console.log('Sync already in progress');
      return false;
    }

    try {
      syncInProgressRef.current = true;
      setSyncState(prev => ({ ...prev, isSyncing: true, lastError: null }));

      // Get queued attempts
      const queuedAttempts = await db.getQueuedAttempts(opts.batchSize);
      
      if (queuedAttempts.length === 0) {
        console.log('No attempts to sync');
        await updateSyncSuccess();
        return true;
      }

      console.log(`Syncing ${queuedAttempts.length} attempts...`);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session for sync');
      }

      // Send to server
      const response = await fetch('/functions/v1/attempts-batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: queuedAttempts.map(attempt => ({
            question_public_id: attempt.question_id,
            attempt_number: attempt.attempt_number,
            duration_seconds: attempt.duration_seconds,
            is_correct: attempt.is_correct,
            confidence_level: attempt.confidence_level,
            hint_checked: attempt.hint_checked,
            solution_checked: attempt.solution_checked,
            objective_progress: attempt.objective_progress,
            attempted_at: attempt.attempted_at,
            idempotency_key: attempt.idempotency_key,
            bookmarked: attempt.bookmarked,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error types
        if (response.status === 413) {
          // Batch too large - reduce batch size and retry
          const newBatchSize = Math.floor(opts.batchSize / 2);
          console.log(`Batch too large, reducing to ${newBatchSize}`);
          
          ErrorToast.show({
            type: 'quota',
            message: `Batch size too large (${queuedAttempts.length} items)`,
            details: errorData.suggestion,
            recoverable: true,
          });
          
          if (newBatchSize >= 1) {
            // Retry with smaller batch
            const smallerBatch = queuedAttempts.slice(0, newBatchSize);
            // Would need to implement recursive retry here
          }
          
          throw new Error(errorData.suggestion || 'Batch size too large');
        }
        
        throw new Error(`Sync failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('Sync result:', result);

      // Mark as synced
      const syncedKeys = queuedAttempts.map(attempt => attempt.idempotency_key);
      await db.markAttemptsSynced(syncedKeys);

      await updateSyncSuccess();
      
      toast({
        title: 'Sync Complete',
        description: `${queuedAttempts.length} attempts synced successfully`,
        duration: 3000,
      });

      // Continue syncing if there are more items
      const remainingCount = await db.getQueuedAttemptsCount();
      if (remainingCount > 0) {
        // Recursively sync remaining items
        setTimeout(() => syncAttempts(), 100);
      }

      return true;

    } catch (error) {
      console.error('Sync failed:', error);
      await updateSyncError(error instanceof Error ? error.message : 'Unknown error');
      
      // Implement exponential backoff for retries
      if (syncState.retryCount < opts.maxRetries) {
        setSyncState(prev => ({
          ...prev,
          isRetrying: true,
          retryCount: prev.retryCount + 1,
        }));
        
        const retryDelay = Math.min(
          opts.retryDelay * Math.pow(2, syncState.retryCount),
          30000 // Max 30 seconds
        );
        
        retryTimeoutRef.current = setTimeout(() => {
          setSyncState(prev => ({ ...prev, isRetrying: false }));
          syncAttempts();
        }, retryDelay);

        ErrorToast.syncRetrying(syncState.retryCount + 1, opts.maxRetries);
      } else {
        ErrorToast.syncFailed(syncState.queueCount);
      }

      return false;
    } finally {
      syncInProgressRef.current = false;
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [db, isOnline, opts, syncState.retryCount]);

  const updateSyncSuccess = useCallback(async () => {
    const now = new Date().toISOString();
    await db.updateSyncState({
      last_sync_at: now,
      last_error: null,
    });
    
    const queueCount = await db.getQueuedAttemptsCount();
    setSyncState(prev => ({
      ...prev,
      queueCount,
      lastSyncAt: now,
      lastError: null,
      retryCount: 0,
      isRetrying: false,
    }));
  }, [db]);

  const updateSyncError = useCallback(async (error: string) => {
    await db.updateSyncState({
      last_error: error,
    });
    
    const queueCount = await db.getQueuedAttemptsCount();
    setSyncState(prev => ({
      ...prev,
      queueCount,
      lastError: error,
    }));
  }, [db]);

  const forceSyncNow = useCallback(async () => {
    if (syncState.isSyncing) return;
    
    // Reset retry count for manual sync
    setSyncState(prev => ({ ...prev, retryCount: 0 }));
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    return await syncAttempts(true);
  }, [syncAttempts, syncState.isSyncing]);

  const queueInteraction = useCallback(async (interaction: any) => {
    try {
      await db.queueAttempt(interaction);
      
      // Update queue count immediately
      const queueCount = await db.getQueuedAttemptsCount();
      setSyncState(prev => ({ ...prev, queueCount }));
      
      console.log('Interaction queued for sync');
      
      // Auto-sync if online
      if (isOnline && opts.autoSync && !syncState.isSyncing) {
        setTimeout(() => syncAttempts(), 500);
      }
    } catch (error) {
      console.error('Failed to queue interaction:', error);
      ErrorToast.show({
        type: 'storage',
        message: 'Failed to save interaction locally',
        details: error instanceof Error ? error.message : 'Unknown error',
        recoverable: false,
      });
      throw error;
    }
  }, [db, isOnline, opts.autoSync, syncState.isSyncing, syncAttempts]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...syncState,
    isOnline,
    syncAttempts: forceSyncNow,
    queueInteraction,
    refreshStats: loadSyncState,
  };
}

// Component to show sync status
export function SyncStatus() {
  const sync = useSyncManager();
  
  if (sync.queueCount === 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {!sync.isOnline && (
        <span className="text-orange-600">Offline</span>
      )}
      
      {sync.isSyncing ? (
        <span className="text-blue-600">Syncing...</span>
      ) : sync.isRetrying ? (
        <span className="text-yellow-600">Retrying...</span>
      ) : (
        <span className="text-gray-600">
          {sync.queueCount} queued
        </span>
      )}
      
      {sync.queueCount > 0 && (
        <button
          onClick={sync.syncAttempts}
          disabled={sync.isSyncing}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Sync now
        </button>
      )}
    </div>
  );
}