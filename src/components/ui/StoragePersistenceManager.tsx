import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { 
  Database,
  Shield,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';
import { useStoragePersistence } from '@/hooks/useStoragePersistence';

interface StorageActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'outline' | 'destructive';
  children: React.ReactNode;
}

function StorageActionButton({ 
  onClick, 
  disabled, 
  loading, 
  variant = 'default', 
  children 
}: StorageActionButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || loading}
      className="gap-2"
    >
      {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function StoragePersistenceManager() {
  const storage = useStoragePersistence();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await storage.updateStorageQuota();
      await storage.checkPersistence();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRequestPersistence = async () => {
    setIsRequesting(true);
    try {
      await storage.requestPersistence();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleClearStorage = async () => {
    if (!confirm('Are you sure you want to clear all cached content? This will require re-downloading content packs.')) {
      return;
    }

    try {
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear IndexedDB (would need to implement specific clearing logic)
      console.log('Storage clearing initiated');
      
      // Refresh storage info
      await handleRefresh();
      
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  const getStorageStatusIcon = () => {
    if (!storage.isSupported) {
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
    if (storage.isPersistent) {
      return <Shield className="h-5 w-5 text-green-500" />;
    }
    return <Database className="h-5 w-5 text-blue-500" />;
  };

  const getStorageStatusText = () => {
    if (!storage.isSupported) {
      return 'Not Supported';
    }
    if (storage.isPersistent) {
      return 'Protected';
    }
    return 'Temporary';
  };

  const getStorageStatusColor = () => {
    if (!storage.isSupported) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    if (storage.isPersistent) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getUsageColor = () => {
    if (storage.isStorageCritical) return 'bg-red-500';
    if (storage.isStorageWarning) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const recommendations = storage.getStorageRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Storage Management
          </h2>
          <p className="text-gray-600">Manage your application's storage persistence and usage</p>
        </div>
        <div className="flex gap-2">
          <StorageActionButton
            onClick={handleRefresh}
            loading={isRefreshing}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </StorageActionButton>
        </div>
      </div>

      {/* Storage Status Overview */}
      <Card className={`border-2 ${getStorageStatusColor()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {getStorageStatusIcon()}
                Storage Status: {getStorageStatusText()}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {storage.isPersistent 
                  ? 'Your data is protected from automatic browser cleanup'
                  : storage.isSupported
                    ? 'Your data may be cleared by the browser to free space'
                    : 'Persistent storage is not available in this browser'
                }
              </p>
              {storage.lastChecked && (
                <p className="text-xs text-gray-500">
                  Last checked: {new Date(storage.lastChecked).toLocaleString()}
                </p>
              )}
            </div>
            
            {storage.canRequestPersistence && (
              <StorageActionButton
                onClick={handleRequestPersistence}
                loading={isRequesting}
              >
                <Shield className="h-4 w-4" />
                Enable Protection
              </StorageActionButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used Storage</span>
                <span>{storage.storageUsed} / {storage.storageAvailable}</span>
              </div>
              <Progress 
                value={storage.storagePercentage} 
                className={`h-3 [&>div]:${getUsageColor()}`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{storage.storagePercentage}% used</span>
                <span>{storage.formatBytes(storage.quota.available - storage.quota.used)} free</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Used Space</p>
                <p className="text-lg font-semibold">{storage.storageUsed}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Available Space</p>
                <p className="text-lg font-semibold">{storage.storageAvailable}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Usage Percentage</p>
                <p className="text-lg font-semibold">{storage.storagePercentage}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recommendations</h3>
          {recommendations.map((rec, index) => (
            <Alert 
              key={index}
              className={
                rec.type === 'error' ? 'border-red-200 bg-red-50' :
                rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }
            >
              <div className="flex">
                {rec.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                 rec.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                 <Info className="h-4 w-4 text-blue-600" />}
                <div className="ml-3">
                  <AlertDescription>
                    <strong>{rec.message}</strong>
                    <br />
                    <span className="text-sm">{rec.action}</span>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Storage Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Storage Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Data Protection</h4>
              <div className="space-y-2">
                {storage.isPersistent ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Storage is protected from cleanup</span>
                  </div>
                ) : storage.canRequestPersistence ? (
                  <StorageActionButton
                    onClick={handleRequestPersistence}
                    loading={isRequesting}
                  >
                    <Shield className="h-4 w-4" />
                    Request Storage Protection
                  </StorageActionButton>
                ) : (
                  <div className="text-sm text-gray-500">
                    {storage.isSupported 
                      ? 'Storage protection request in progress...'
                      : 'Storage protection not available in this browser'
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Cleanup Options</h4>
              <div className="space-y-2">
                <StorageActionButton
                  onClick={handleClearStorage}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cached Content
                </StorageActionButton>
                <p className="text-xs text-gray-500">
                  This will clear all cached content packs and force re-download when needed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Storage Persistence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What is Storage Persistence?</h4>
              <p>
                Storage persistence prevents the browser from automatically clearing your cached 
                SAT practice content, progress data, and offline capabilities when device storage 
                becomes low.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Benefits of Persistent Storage:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Your progress and downloaded content won't be lost</li>
                <li>Faster app loading with reliable offline access</li>
                <li>No need to re-download content packs</li>
                <li>Seamless studying experience even offline</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Browser Support:</h4>
              <p>
                Storage persistence is supported in most modern browsers including Chrome, 
                Firefox, Safari, and Edge. The browser may automatically grant persistence 
                for sites you use frequently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}