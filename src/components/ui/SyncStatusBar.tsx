import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader2 
} from 'lucide-react';
import { useSyncManager } from '@/hooks/useSyncManager';
import { useNetworkStatus } from '@/hooks/useServiceWorker';
import { Card, CardContent } from './card';

interface SyncStatusBarProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function SyncStatusBar({ compact = false, showDetails = false }: SyncStatusBarProps) {
  const sync = useSyncManager();
  const { isOnline } = useNetworkStatus();

  if (compact && sync.queueCount === 0 && isOnline) {
    return null; // Hide when nothing to show
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-orange-500" />;
    if (sync.isSyncing) return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    if (sync.isRetrying) return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    if (sync.queueCount === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (sync.lastError) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (sync.isSyncing) return 'Syncing...';
    if (sync.isRetrying) return `Retrying... (${sync.retryCount}/3)`;
    if (sync.queueCount === 0) return 'All synced';
    if (sync.lastError) return 'Sync failed';
    return `${sync.queueCount} queued`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'orange';
    if (sync.isSyncing) return 'blue';
    if (sync.isRetrying) return 'yellow';
    if (sync.queueCount === 0) return 'green';
    if (sync.lastError) return 'red';
    return 'gray';
  };

  const handleSyncNow = () => {
    sync.syncAttempts();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm text-gray-600">{getStatusText()}</span>
        {sync.queueCount > 0 && isOnline && !sync.isSyncing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncNow}
            className="h-6 px-2 text-xs"
          >
            Sync
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{getStatusText()}</span>
                {sync.queueCount > 0 && (
                  <Badge variant="secondary">
                    {sync.queueCount} items
                  </Badge>
                )}
              </div>
              {showDetails && sync.lastSyncAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Last sync: {new Date(sync.lastSyncAt).toLocaleTimeString()}
                </p>
              )}
              {sync.lastError && (
                <p className="text-sm text-red-600 mt-1">
                  Error: {sync.lastError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            
            {sync.queueCount > 0 && isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncNow}
                disabled={sync.isSyncing}
                className="gap-2"
              >
                {sync.isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {sync.isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar for syncing */}
        {sync.isSyncing && showDetails && (
          <div className="mt-3">
            <Progress value={undefined} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Uploading interaction data...
            </p>
          </div>
        )}

        {/* Retry countdown */}
        {sync.isRetrying && showDetails && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <RefreshCw className="h-4 w-4" />
              <span>Retrying in a moment... (Attempt {sync.retryCount}/3)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple inline sync indicator for headers/navigation
export function SyncIndicator() {
  const sync = useSyncManager();
  const { isOnline } = useNetworkStatus();

  if (!isOnline || sync.queueCount === 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs">
      {sync.isSyncing ? (
        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      ) : (
        <div className="h-2 w-2 rounded-full bg-orange-500" />
      )}
      <span className="text-gray-600">
        {sync.queueCount}
      </span>
    </div>
  );
}

// Floating sync button for always-accessible sync
export function FloatingSyncButton() {
  const sync = useSyncManager();
  const { isOnline } = useNetworkStatus();

  if (!isOnline || sync.queueCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={sync.syncAttempts}
        disabled={sync.isSyncing}
        className="rounded-full shadow-lg gap-2"
        size="lg"
      >
        {sync.isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {sync.isSyncing ? 'Syncing...' : `Sync ${sync.queueCount}`}
      </Button>
    </div>
  );
}