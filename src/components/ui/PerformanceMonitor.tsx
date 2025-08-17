import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  Info,
  Zap,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useMetrics } from '@/hooks/useMetrics';
import { useErrorTracking } from '@/hooks/useErrorTracking';

interface PerformanceThresholds {
  pageLoad: { good: number; poor: number };
  memoryUsage: { good: number; poor: number };
  storageUsage: { good: number; poor: number };
  errorRate: { good: number; poor: number };
}

const THRESHOLDS: PerformanceThresholds = {
  pageLoad: { good: 2000, poor: 4000 }, // milliseconds
  memoryUsage: { good: 70, poor: 90 }, // percentage
  storageUsage: { good: 80, poor: 95 }, // percentage
  errorRate: { good: 1, poor: 5 }, // errors per minute
};

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
  description: string;
  recommendation?: string;
}

export function PerformanceMonitor() {
  const metrics = useMetrics();
  const errorTracking = useErrorTracking();
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const calculatePerformanceScore = (metricsList: PerformanceMetric[]): number => {
    if (metricsList.length === 0) return 0;
    
    const statusScores = { good: 100, 'needs-improvement': 60, poor: 20 };
    const totalScore = metricsList.reduce((sum, metric) => sum + statusScores[metric.status], 0);
    return Math.round(totalScore / metricsList.length);
  };

  const getPerformanceStatus = (value: number, thresholds: { good: number; poor: number }, inverted = false): PerformanceMetric['status'] => {
    if (inverted) {
      // For metrics where lower is better (like page load time)
      if (value <= thresholds.good) return 'good';
      if (value <= thresholds.poor) return 'needs-improvement';
      return 'poor';
    } else {
      // For metrics where higher is better
      if (value >= thresholds.good) return 'good';
      if (value >= thresholds.poor) return 'needs-improvement';
      return 'poor';
    }
  };

  const updatePerformanceMetrics = () => {
    const summary = metrics.getMetricsSummary();
    const errorStats = errorTracking.getErrorStats();
    
    const newMetrics: PerformanceMetric[] = [];
    
    // Page Load Performance
    const pageLoadTime = summary.gauges['performance_page_load_time_ms'] || 0;
    if (pageLoadTime > 0) {
      newMetrics.push({
        name: 'Page Load Time',
        value: pageLoadTime,
        unit: 'ms',
        status: getPerformanceStatus(pageLoadTime, THRESHOLDS.pageLoad, true),
        description: 'Time to fully load the page',
        recommendation: pageLoadTime > THRESHOLDS.pageLoad.poor 
          ? 'Consider enabling service worker caching and optimizing assets'
          : undefined,
      });
    }
    
    // Memory Usage
    const memoryUsed = summary.gauges['memory_used_bytes'] || 0;
    const memoryLimit = summary.gauges['memory_limit_bytes'] || 0;
    if (memoryUsed > 0 && memoryLimit > 0) {
      const memoryUsagePercent = (memoryUsed / memoryLimit) * 100;
      newMetrics.push({
        name: 'Memory Usage',
        value: memoryUsagePercent,
        unit: '%',
        status: getPerformanceStatus(memoryUsagePercent, THRESHOLDS.memoryUsage, true),
        description: 'JavaScript heap memory consumption',
        recommendation: memoryUsagePercent > THRESHOLDS.memoryUsage.poor
          ? 'High memory usage detected. Consider refreshing the page or clearing cached data'
          : undefined,
      });
    }
    
    // Storage Usage
    const storageUsed = summary.gauges['storage_used_bytes'] || 0;
    const storageQuota = summary.gauges['storage_quota_bytes'] || 0;
    if (storageUsed > 0 && storageQuota > 0) {
      const storageUsagePercent = (storageUsed / storageQuota) * 100;
      newMetrics.push({
        name: 'Storage Usage',
        value: storageUsagePercent,
        unit: '%',
        status: getPerformanceStatus(storageUsagePercent, THRESHOLDS.storageUsage, true),
        description: 'Local storage consumption',
        recommendation: storageUsagePercent > THRESHOLDS.storageUsage.poor
          ? 'Storage almost full. Clear unused content packs to free space'
          : undefined,
      });
    }
    
    // Error Rate
    const errorRate = errorStats.recentHour / 60; // errors per minute
    newMetrics.push({
      name: 'Error Rate',
      value: errorRate,
      unit: 'errors/min',
      status: getPerformanceStatus(errorRate, THRESHOLDS.errorRate, true),
      description: 'Application errors in the last hour',
      recommendation: errorRate > THRESHOLDS.errorRate.poor
        ? 'High error rate detected. Check console for details'
        : undefined,
    });
    
    // First Contentful Paint (if available)
    const fcp = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
    if (fcp) {
      newMetrics.push({
        name: 'First Contentful Paint',
        value: fcp.startTime,
        unit: 'ms',
        status: getPerformanceStatus(fcp.startTime, { good: 1800, poor: 3000 }, true),
        description: 'Time to first visual content',
      });
    }
    
    // Largest Contentful Paint (if available)
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint') as PerformanceEntry[];
    if (lcpEntries.length > 0) {
      const lcp = lcpEntries[lcpEntries.length - 1];
      newMetrics.push({
        name: 'Largest Contentful Paint',
        value: lcp.startTime,
        unit: 'ms',
        status: getPerformanceStatus(lcp.startTime, { good: 2500, poor: 4000 }, true),
        description: 'Time to largest content element',
      });
    }
    
    setPerformanceMetrics(newMetrics);
    setOverallScore(calculatePerformanceScore(newMetrics));
  };

  useEffect(() => {
    if (!isMonitoring) return;
    
    updatePerformanceMetrics();
    
    // Update metrics every 10 seconds
    const interval = setInterval(updatePerformanceMetrics, 10000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getMetricIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="h-6 w-6" />
            Performance Monitor
          </h2>
          <p className="text-gray-600">Real-time application performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Pause' : 'Resume'}
          </Button>
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Performance Score</h3>
              <div className="flex items-center gap-3">
                {getScoreIcon(overallScore)}
                <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-gray-500">/100</span>
              </div>
            </div>
            <div className="text-right">
              <Progress value={overallScore} className="w-32 h-3 mb-2" />
              <p className="text-sm text-gray-600">
                {overallScore >= 80 ? 'Excellent' : 
                 overallScore >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm">{metric.name}</h4>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                  {getMetricIcon(metric.status)}
                </div>
                
                <div className="mb-3">
                  <span className="text-2xl font-bold">
                    {formatValue(metric.value, metric.unit)}
                  </span>
                </div>
                
                <Badge 
                  variant={metric.status === 'good' ? 'default' : 
                          metric.status === 'needs-improvement' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {metric.status === 'good' ? 'Good' : 
                   metric.status === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
                </Badge>
                
                {metric.recommendation && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-800">{metric.recommendation}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceMetrics.some(m => m.recommendation) ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {performanceMetrics
                    .filter(m => m.recommendation)
                    .map((metric, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-medium">{metric.name}:</span>
                        <span>{metric.recommendation}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  All Systems Good
                </h4>
                <p className="text-sm text-green-700">
                  All performance metrics are within acceptable ranges. Keep up the good work!
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium">Quick Tips</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• Enable service worker for better caching</li>
                  <li>• Refresh the page if memory usage is high</li>
                  <li>• Clear unused content to free storage</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium">Performance Targets</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• Page load: &lt; 2s (good), &lt; 4s (acceptable)</li>
                  <li>• Memory usage: &lt; 70% (good), &lt; 90% (acceptable)</li>
                  <li>• Error rate: &lt; 1/min (good), &lt; 5/min (acceptable)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}