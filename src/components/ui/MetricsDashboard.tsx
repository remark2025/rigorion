import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Database,
  Download,
  Eye,
  Memory,
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useMetrics } from '@/hooks/useMetrics';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { useSyncManager } from '@/hooks/useSyncManager';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs ${trendColor} flex items-center gap-1 mt-1`}>
                <TrendingUp className="h-3 w-3" />
                {change}
              </p>
            )}
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard() {
  const metrics = useMetrics();
  const db = useIndexedDB();
  const sync = useSyncManager();
  
  const [systemMetrics, setSystemMetrics] = useState({
    memoryUsage: 0,
    memoryLimit: 0,
    storageUsed: 0,
    storageQuota: 0,
    pageLoadTime: 0,
    errorRate: 0,
  });
  
  const [appMetrics, setAppMetrics] = useState({
    questionsAttempted: 0,
    syncOperations: 0,
    contentLoads: 0,
    userActions: 0,
    totalErrors: 0,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    
    try {
      // Collect current performance metrics
      metrics.measurePagePerformance();
      metrics.measureMemoryUsage();
      
      // Get metrics summary
      const summary = metrics.getMetricsSummary();
      
      // Update system metrics
      const memoryUsed = summary.gauges['memory_used_bytes'] || 0;
      const memoryLimit = summary.gauges['memory_limit_bytes'] || 0;
      const storageUsed = summary.gauges['storage_used_bytes'] || 0;
      const storageQuota = summary.gauges['storage_quota_bytes'] || 0;
      const pageLoadTime = summary.gauges['performance_page_load_time_ms'] || 0;
      
      setSystemMetrics({
        memoryUsage: memoryUsed,
        memoryLimit: memoryLimit,
        storageUsed: storageUsed,
        storageQuota: storageQuota,
        pageLoadTime: pageLoadTime,
        errorRate: 0, // TODO: Calculate error rate
      });
      
      // Update app metrics
      setAppMetrics({
        questionsAttempted: summary.counters['question_interactions'] || 0,
        syncOperations: summary.counters['sync_operations'] || 0,
        contentLoads: summary.counters['content_loads'] || 0,
        userActions: summary.counters['user_actions'] || 0,
        totalErrors: summary.counters['errors'] || 0,
      });
      
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
      metrics.trackError(error as Error, 'metrics_dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const memoryUsagePercent = systemMetrics.memoryLimit > 0 
    ? (systemMetrics.memoryUsage / systemMetrics.memoryLimit) * 100 
    : 0;
    
  const storageUsagePercent = systemMetrics.storageQuota > 0 
    ? (systemMetrics.storageUsed / systemMetrics.storageQuota) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-gray-600">Real-time application metrics and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={metrics.isCollecting ? 'default' : 'secondary'}>
            {metrics.isCollecting ? 'Collecting' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Memory Usage"
            value={formatBytes(systemMetrics.memoryUsage)}
            change={`${memoryUsagePercent.toFixed(1)}% of limit`}
            icon={<Memory className="h-6 w-6" />}
            trend={memoryUsagePercent > 80 ? 'up' : 'stable'}
          />
          
          <MetricCard
            title="Storage Used"
            value={formatBytes(systemMetrics.storageUsed)}
            change={`${storageUsagePercent.toFixed(1)}% of quota`}
            icon={<Database className="h-6 w-6" />}
            trend={storageUsagePercent > 80 ? 'up' : 'stable'}
          />
          
          <MetricCard
            title="Page Load Time"
            value={formatDuration(systemMetrics.pageLoadTime)}
            icon={<Clock className="h-6 w-6" />}
            trend={systemMetrics.pageLoadTime > 3000 ? 'up' : 'stable'}
          />
          
          <MetricCard
            title="Sync Queue"
            value={sync.queueCount}
            change={sync.isSyncing ? 'Syncing...' : 'Idle'}
            icon={<RefreshCw className="h-6 w-6" />}
            trend={sync.queueCount > 10 ? 'up' : 'stable'}
          />
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Memory className="h-5 w-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>JavaScript Heap</span>
                  <span>{formatBytes(systemMetrics.memoryUsage)} / {formatBytes(systemMetrics.memoryLimit)}</span>
                </div>
                <Progress value={memoryUsagePercent} className="h-2" />
              </div>
              {memoryUsagePercent > 80 && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ High memory usage detected. Consider refreshing the page.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>IndexedDB Storage</span>
                  <span>{formatBytes(systemMetrics.storageUsed)} / {formatBytes(systemMetrics.storageQuota)}</span>
                </div>
                <Progress value={storageUsagePercent} className="h-2" />
              </div>
              {storageUsagePercent > 90 && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ Storage almost full. Clear cached content to free space.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Application Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Questions Attempted"
            value={appMetrics.questionsAttempted}
            icon={<Eye className="h-6 w-6" />}
          />
          
          <MetricCard
            title="User Actions"
            value={appMetrics.userActions}
            icon={<Users className="h-6 w-6" />}
          />
          
          <MetricCard
            title="Content Loads"
            value={appMetrics.contentLoads}
            icon={<Download className="h-6 w-6" />}
          />
          
          <MetricCard
            title="Sync Operations"
            value={appMetrics.syncOperations}
            icon={<RefreshCw className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-time Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Queued Metrics</p>
              <p className="text-2xl font-bold">{metrics.queuedMetrics}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Database Status</p>
              <p className="text-lg font-semibold">
                {db.isInitialized ? (
                  <span className="text-green-600">✓ Connected</span>
                ) : (
                  <span className="text-red-600">✗ Disconnected</span>
                )}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Sync Status</p>
              <p className="text-lg font-semibold">
                {sync.isSyncing ? (
                  <span className="text-blue-600">🔄 Syncing</span>
                ) : sync.queueCount > 0 ? (
                  <span className="text-orange-600">⏳ Pending</span>
                ) : (
                  <span className="text-green-600">✓ Synced</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium mb-2">View Raw Metrics</summary>
            <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(metrics.getMetricsSummary(), null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}