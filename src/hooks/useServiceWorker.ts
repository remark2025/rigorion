import { useEffect, useState } from 'react';
import { toast } from './use-toast';
import { ErrorToast } from '@/components/ui/ErrorToast';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    hasUpdate: false,
    registration: null,
  });

  const registerServiceWorker = async () => {
    if (!state.isSupported) {
      console.log('Service Workers not supported');
      return;
    }

    try {
      console.log('Registering Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      console.log('Service Worker registered:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        setState(prev => ({ ...prev, isUpdating: true }));

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            setState(prev => ({
              ...prev,
              isUpdating: false,
              hasUpdate: true,
            }));

            toast({
              title: 'Update Available',
              description: 'A new version of the app is ready. Refresh to update.',
              duration: 10000,
            });
          }
        });
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CACHE_UPDATED') {
          console.log('Cache updated for:', event.data.url);
          
          toast({
            title: 'Content Updated',
            description: 'New content is available in the background.',
            duration: 3000,
          });
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast({
        title: 'Offline Setup Failed',
        description: 'App will work online only.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const updateServiceWorker = async () => {
    if (!state.registration) return;

    const waitingWorker = state.registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload to activate new SW
      window.location.reload();
    }
  };

  const checkForUpdates = async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();
      console.log('Checked for Service Worker updates');
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  useEffect(() => {
    registerServiceWorker();

    // Check for updates every 30 minutes
    const updateInterval = setInterval(() => {
      checkForUpdates();
    }, 30 * 60 * 1000);

    return () => clearInterval(updateInterval);
  }, []);

  return {
    ...state,
    updateServiceWorker,
    checkForUpdates,
  };
}

// Helper to check if app is running offline
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      ErrorToast.backOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      ErrorToast.networkOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}