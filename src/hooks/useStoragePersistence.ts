import { useState, useCallback, useEffect } from 'react';
import { useMetrics } from './useMetrics';

interface StoragePersistenceState {
  isPersistent: boolean;
  isRequesting: boolean;
  isSupported: boolean;
  quota: {
    used: number;
    available: number;
    percentage: number;
  };
  lastChecked: string | null;
}

interface StorageEstimate {
  quota?: number;
  usage?: number;
  usageDetails?: {
    indexedDB?: number;
    caches?: number;
    serviceWorker?: number;
  };
}

export function useStoragePersistence() {
  const metrics = useMetrics();
  
  const [state, setState] = useState<StoragePersistenceState>({
    isPersistent: false,
    isRequesting: false,
    isSupported: 'storage' in navigator && 'persist' in navigator.storage,
    quota: {
      used: 0,
      available: 0,
      percentage: 0,
    },
    lastChecked: null,
  });

  // Check if storage is already persistent
  const checkPersistence = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Storage persistence not supported in this browser');
      return false;
    }

    try {
      const isPersistent = await navigator.storage.persisted();
      
      setState(prev => ({
        ...prev,
        isPersistent,
        lastChecked: new Date().toISOString(),
      }));

      metrics.setGauge('storage_persistent', isPersistent ? 1 : 0);
      
      return isPersistent;
    } catch (error) {
      console.error('Failed to check storage persistence:', error);
      metrics.trackError(error as Error, 'storage_persistence');
      return false;
    }
  }, [state.isSupported, metrics]);

  // Request persistent storage
  const requestPersistence = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Storage persistence not supported in this browser');
      return false;
    }

    if (state.isPersistent) {
      console.log('Storage is already persistent');
      return true;
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      console.log('Requesting persistent storage...');
      
      const granted = await navigator.storage.persist();
      
      setState(prev => ({
        ...prev,
        isPersistent: granted,
        isRequesting: false,
        lastChecked: new Date().toISOString(),
      }));

      if (granted) {
        console.log('✅ Persistent storage granted');
        metrics.incrementCounter('storage_persistence_granted', 1);
        
        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Storage Protection Enabled', {
            body: 'Your SAT practice data is now protected from automatic cleanup.',
            icon: '/favicon.ico',
            tag: 'storage-persistence',
          });
        }
      } else {
        console.warn('❌ Persistent storage denied');
        metrics.incrementCounter('storage_persistence_denied', 1);
      }

      metrics.setGauge('storage_persistent', granted ? 1 : 0);
      
      return granted;
    } catch (error) {
      console.error('Failed to request storage persistence:', error);
      metrics.trackError(error as Error, 'storage_persistence');
      
      setState(prev => ({ ...prev, isRequesting: false }));
      return false;
    }
  }, [state.isSupported, state.isPersistent, metrics]);

  // Get storage quota information
  const updateStorageQuota = useCallback(async () => {
    if (!state.isSupported || !('estimate' in navigator.storage)) {
      return;
    }

    try {
      const estimate: StorageEstimate = await navigator.storage.estimate();
      
      const used = estimate.usage || 0;
      const available = estimate.quota || 0;
      const percentage = available > 0 ? (used / available) * 100 : 0;
      
      setState(prev => ({
        ...prev,
        quota: {
          used,
          available,
          percentage,
        },
      }));

      // Update metrics
      metrics.setGauge('storage_used_bytes', used);
      metrics.setGauge('storage_quota_bytes', available);
      metrics.setGauge('storage_usage_percentage', percentage);

      // Warn if storage is getting full
      if (percentage > 90) {
        console.warn('⚠️ Storage usage is very high:', percentage.toFixed(1) + '%');
        metrics.incrementCounter('storage_quota_warning', 1);
      }

    } catch (error) {
      console.error('Failed to get storage estimate:', error);
      metrics.trackError(error as Error, 'storage_quota');
    }
  }, [state.isSupported, metrics]);

  // Format bytes for display
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Get storage recommendations
  const getStorageRecommendations = useCallback(() => {
    const recommendations = [];
    
    if (!state.isSupported) {
      recommendations.push({
        type: 'info',
        message: 'Persistent storage is not supported in this browser',
        action: 'Consider upgrading to a modern browser',
      });
    } else if (!state.isPersistent) {
      recommendations.push({
        type: 'warning',
        message: 'Storage is not persistent and may be cleared by the browser',
        action: 'Enable persistent storage to protect your data',
      });
    }
    
    if (state.quota.percentage > 90) {
      recommendations.push({
        type: 'error',
        message: 'Storage is almost full (' + state.quota.percentage.toFixed(1) + '%)',
        action: 'Clear unused content or free up device storage',
      });
    } else if (state.quota.percentage > 75) {
      recommendations.push({
        type: 'warning',
        message: 'Storage is getting full (' + state.quota.percentage.toFixed(1) + '%)',
        action: 'Consider clearing old content packs',
      });
    }
    
    return recommendations;
  }, [state]);

  // Setup automatic persistence management
  const setupAutoPersistence = useCallback(async () => {
    console.log('🔧 Setting up automatic storage persistence...');
    
    // Check current persistence status
    await checkPersistence();
    await updateStorageQuota();
    
    // Request persistence if not already granted
    if (state.isSupported && !state.isPersistent) {
      // Wait a bit before requesting to avoid aggressive prompting
      setTimeout(async () => {
        await requestPersistence();
      }, 5000); // 5 seconds delay
    }
  }, [checkPersistence, updateStorageQuota, requestPersistence, state.isSupported, state.isPersistent]);

  // Monitor storage usage patterns
  const monitorStorageUsage = useCallback(() => {
    // Check storage every 5 minutes
    const interval = setInterval(async () => {
      await updateStorageQuota();
      
      // Re-check persistence status occasionally
      if (Math.random() < 0.1) { // 10% chance
        await checkPersistence();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateStorageQuota, checkPersistence]);

  // Handle storage pressure
  const handleStoragePressure = useCallback(async () => {
    if (state.quota.percentage < 85) return;
    
    console.warn('🗄️ Storage pressure detected, attempting cleanup...');
    
    try {
      // Clear old caches first
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.includes('old') || name.includes('temp')
        );
        
        for (const cacheName of oldCaches) {
          await caches.delete(cacheName);
          console.log('Cleared old cache:', cacheName);
        }
      }
      
      // Update quota after cleanup
      await updateStorageQuota();
      
      metrics.incrementCounter('storage_cleanup_performed', 1);
      
    } catch (error) {
      console.error('Storage cleanup failed:', error);
      metrics.trackError(error as Error, 'storage_cleanup');
    }
  }, [state.quota.percentage, updateStorageQuota, metrics]);

  // Initialize persistence management
  useEffect(() => {
    if (!state.isSupported) {
      console.warn('Storage persistence not supported');
      return;
    }

    setupAutoPersistence();
    const cleanupMonitoring = monitorStorageUsage();
    
    return cleanupMonitoring;
  }, []); // Only run once on mount

  // Handle storage pressure automatically
  useEffect(() => {
    if (state.quota.percentage > 85) {
      handleStoragePressure();
    }
  }, [state.quota.percentage, handleStoragePressure]);

  // Setup page visibility handling
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && state.isSupported) {
        // Refresh storage info when page becomes visible
        await updateStorageQuota();
        
        // Occasionally re-check persistence
        if (Math.random() < 0.2) { // 20% chance
          await checkPersistence();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateStorageQuota, checkPersistence, state.isSupported]);

  return {
    // State
    ...state,
    
    // Actions
    requestPersistence,
    checkPersistence,
    updateStorageQuota,
    
    // Utilities
    formatBytes,
    getStorageRecommendations,
    
    // Computed values
    storageUsed: formatBytes(state.quota.used),
    storageAvailable: formatBytes(state.quota.available),
    storagePercentage: Math.round(state.quota.percentage),
    
    // Status checks
    isStorageCritical: state.quota.percentage > 90,
    isStorageWarning: state.quota.percentage > 75,
    canRequestPersistence: state.isSupported && !state.isPersistent && !state.isRequesting,
  };
}