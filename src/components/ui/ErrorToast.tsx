import React from 'react';
import { toast } from '@/hooks/use-toast';
import { ErrorInfo, ErrorFactory } from './ErrorHandler';
import { Button } from './button';
import { 
  WifiOff, 
  Server, 
  Shield, 
  Clock, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ToastErrorOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ErrorToast {
  static show(error: ErrorInfo, options: ToastErrorOptions = {}) {
    const config = this.getToastConfig(error);
    
    toast({
      title: config.title,
      description: config.description,
      variant: config.variant,
      duration: options.duration || config.duration,
      action: options.action ? (
        <Button
          variant="outline"
          size="sm"
          onClick={options.action.onClick}
          className="gap-2"
        >
          {config.icon}
          {options.action.label}
        </Button>
      ) : undefined,
    });
  }

  private static getToastConfig(error: ErrorInfo) {
    switch (error.type) {
      case 'network':
        return {
          title: 'Connection Failed',
          description: 'Check your internet connection and try again',
          variant: 'destructive' as const,
          duration: 5000,
          icon: <WifiOff className="h-4 w-4" />,
        };

      case 'server':
        return {
          title: 'Server Error',
          description: 'Content update failed. Will retry automatically.',
          variant: 'destructive' as const,
          duration: 7000,
          icon: <Server className="h-4 w-4" />,
        };

      case 'auth':
        return {
          title: 'Premium Required',
          description: 'Upgrade to access this content',
          variant: 'default' as const,
          duration: 8000,
          icon: <Shield className="h-4 w-4" />,
        };

      case 'quota':
        return {
          title: 'Rate Limited',
          description: 'Too many requests. Please wait a moment.',
          variant: 'default' as const,
          duration: 6000,
          icon: <Clock className="h-4 w-4" />,
        };

      case 'storage':
        return {
          title: 'Storage Full',
          description: 'Free up device space to continue',
          variant: 'destructive' as const,
          duration: 10000,
          icon: <AlertTriangle className="h-4 w-4" />,
        };

      default:
        return {
          title: 'Error',
          description: error.message || 'Something went wrong',
          variant: 'destructive' as const,
          duration: 5000,
          icon: <AlertTriangle className="h-4 w-4" />,
        };
    }
  }

  // Quick toast methods for common scenarios
  static packFetchFailed(packId: string, onRetry?: () => void) {
    this.show(ErrorFactory.packFetchFailed(`Pack: ${packId}`), {
      duration: 8000,
      action: onRetry ? {
        label: 'Retry',
        onClick: onRetry,
      } : undefined,
    });
  }

  static syncFailed(queueCount: number, onRetry?: () => void) {
    this.show(ErrorFactory.syncFailed(queueCount), {
      duration: 6000,
      action: onRetry ? {
        label: 'Retry Now',
        onClick: onRetry,
      } : undefined,
    });
  }

  static syncRetrying(attemptCount: number, maxRetries: number) {
    toast({
      title: 'Sync Retrying',
      description: `${attemptCount} attempts will auto-retry (${attemptCount}/${maxRetries})`,
      variant: 'default',
      duration: 4000,
    });
  }

  static entitlementFailed(onUpgrade?: () => void) {
    this.show(ErrorFactory.entitlementFailed('premium-pack'), {
      duration: 10000,
      action: onUpgrade ? {
        label: 'Upgrade',
        onClick: onUpgrade,
      } : undefined,
    });
  }

  static storageFull(onManage?: () => void) {
    this.show(ErrorFactory.storageFull(), {
      duration: 12000,
      action: onManage ? {
        label: 'Manage',
        onClick: onManage,
      } : undefined,
    });
  }

  static networkOffline() {
    toast({
      title: 'You\'re Offline',
      description: 'Your progress is saved locally and will sync when back online',
      variant: 'default',
      duration: 5000,
    });
  }

  static backOnline(queueCount?: number) {
    toast({
      title: 'Back Online',
      description: queueCount ? `Syncing ${queueCount} saved attempts...` : 'Connection restored',
      variant: 'default',
      duration: 3000,
    });
  }
}

// Hook for common error toast patterns
export function useErrorToast() {
  const showPackError = React.useCallback((packId: string, error: any, onRetry?: () => void) => {
    if (error.status === 403) {
      ErrorToast.entitlementFailed();
    } else {
      ErrorToast.packFetchFailed(packId, onRetry);
    }
  }, []);

  const showSyncError = React.useCallback((queueCount: number, error: any, onRetry?: () => void) => {
    ErrorToast.syncFailed(queueCount, onRetry);
  }, []);

  const showConnectionStatus = React.useCallback((isOnline: boolean, queueCount?: number) => {
    if (isOnline && queueCount) {
      ErrorToast.backOnline(queueCount);
    } else if (!isOnline) {
      ErrorToast.networkOffline();
    }
  }, []);

  return {
    showPackError,
    showSyncError,
    showConnectionStatus,
    toast: ErrorToast,
  };
}