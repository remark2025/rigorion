import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Shield,
  Server,
  Clock,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export interface ErrorInfo {
  type: 'network' | 'server' | 'auth' | 'quota' | 'storage' | 'unknown';
  code?: string | number;
  message: string;
  details?: string;
  recoverable: boolean;
  timestamp?: string;
}

interface ErrorHandlerProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  onReport?: () => void;
  compact?: boolean;
}

export function ErrorHandler({ 
  error, 
  onRetry, 
  onDismiss, 
  onReport, 
  compact = false 
}: ErrorHandlerProps) {
  const getErrorConfig = () => {
    switch (error.type) {
      case 'network':
        return {
          icon: <WifiOff className="h-5 w-5 text-orange-500" />,
          title: 'Connection Issue',
          userMessage: 'Unable to connect to server',
          suggestion: 'Check your internet connection and try again',
          primaryAction: 'Retry',
          variant: 'orange' as const,
        };

      case 'server':
        return {
          icon: <Server className="h-5 w-5 text-red-500" />,
          title: 'Server Error',
          userMessage: 'Content update failed',
          suggestion: 'Our servers are experiencing issues. Your progress is saved locally.',
          primaryAction: 'Retry',
          variant: 'red' as const,
        };

      case 'auth':
        return {
          icon: <Shield className="h-5 w-5 text-purple-500" />,
          title: 'Access Required',
          userMessage: 'Upgrade to access this pack',
          suggestion: 'This content requires premium access',
          primaryAction: 'Upgrade',
          variant: 'purple' as const,
        };

      case 'quota':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: 'Rate Limited',
          userMessage: 'Too many requests',
          suggestion: 'Please wait a moment before trying again',
          primaryAction: 'Wait',
          variant: 'yellow' as const,
        };

      case 'storage':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          title: 'Storage Full',
          userMessage: 'Device storage is full',
          suggestion: 'Free up space to continue downloading content',
          primaryAction: 'Manage Storage',
          variant: 'red' as const,
        };

      default:
        return {
          icon: <HelpCircle className="h-5 w-5 text-gray-500" />,
          title: 'Something went wrong',
          userMessage: 'An unexpected error occurred',
          suggestion: 'Try refreshing the page or contact support if this persists',
          primaryAction: 'Retry',
          variant: 'gray' as const,
        };
    }
  };

  const config = getErrorConfig();

  // Compact inline error display
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
        {config.icon}
        <span className="text-red-700">{config.userMessage}</span>
        {error.recoverable && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2 text-red-700 hover:text-red-800"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Full error card display
  return (
    <Card className={`border-l-4 border-l-${config.variant}-500`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {config.icon}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{config.title}</h3>
              <Badge variant="outline" className={`text-${config.variant}-600 border-${config.variant}-600`}>
                {error.type}
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-2">{config.userMessage}</p>
            <p className="text-sm text-gray-500 mb-3">{config.suggestion}</p>
            
            {error.details && (
              <details className="mb-3">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  Technical details <ChevronRight className="inline h-3 w-3" />
                </summary>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                  {error.code && <div>Code: {error.code}</div>}
                  <div>Message: {error.message}</div>
                  {error.details && <div>Details: {error.details}</div>}
                  {error.timestamp && (
                    <div>Time: {new Date(error.timestamp).toLocaleString()}</div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {error.recoverable && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {config.primaryAction}
              </Button>
            )}
            
            {onReport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReport}
                className="gap-2"
              >
                Report Issue
              </Button>
            )}
          </div>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-500"
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Factory functions for common error types
export const ErrorFactory = {
  packFetchFailed: (details?: string): ErrorInfo => ({
    type: 'server',
    message: 'Failed to fetch content pack',
    details,
    recoverable: true,
    timestamp: new Date().toISOString(),
  }),

  syncFailed: (queueCount: number, details?: string): ErrorInfo => ({
    type: 'network',
    message: `Failed to sync ${queueCount} attempts`,
    details,
    recoverable: true,
    timestamp: new Date().toISOString(),
  }),

  entitlementFailed: (packId: string): ErrorInfo => ({
    type: 'auth',
    code: 403,
    message: `Access denied for pack: ${packId}`,
    details: 'Premium subscription required',
    recoverable: false,
    timestamp: new Date().toISOString(),
  }),

  storageFull: (): ErrorInfo => ({
    type: 'storage',
    message: 'Device storage quota exceeded',
    details: 'Unable to download additional content',
    recoverable: true,
    timestamp: new Date().toISOString(),
  }),

  rateLimited: (retryAfter?: number): ErrorInfo => ({
    type: 'quota',
    code: 429,
    message: 'Too many requests',
    details: retryAfter ? `Retry after ${retryAfter}s` : undefined,
    recoverable: true,
    timestamp: new Date().toISOString(),
  }),

  networkError: (details?: string): ErrorInfo => ({
    type: 'network',
    message: 'Network connection failed',
    details,
    recoverable: true,
    timestamp: new Date().toISOString(),
  }),
};

// Hook for managing error state
export function useErrorHandler() {
  const [errors, setErrors] = React.useState<ErrorInfo[]>([]);

  const addError = React.useCallback((error: ErrorInfo) => {
    setErrors(prev => [...prev, { ...error, timestamp: new Date().toISOString() }]);
  }, []);

  const removeError = React.useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const handlePackFetchError = React.useCallback((packId: string, error: any) => {
    if (error.status === 403) {
      addError(ErrorFactory.entitlementFailed(packId));
    } else if (error.status === 429) {
      addError(ErrorFactory.rateLimited());
    } else {
      addError(ErrorFactory.packFetchFailed(`Pack: ${packId}, Error: ${error.message}`));
    }
  }, [addError]);

  const handleSyncError = React.useCallback((queueCount: number, error: any) => {
    if (error.message?.includes('Network')) {
      addError(ErrorFactory.networkError(`${queueCount} attempts queued`));
    } else {
      addError(ErrorFactory.syncFailed(queueCount, error.message));
    }
  }, [addError]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handlePackFetchError,
    handleSyncError,
  };
}