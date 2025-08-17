import { useState, useCallback, useEffect, useRef } from 'react';
import { useIndexedDB } from './useIndexedDB';

interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
}

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  labels?: Record<string, string>;
}

interface MetricsState {
  counters: Map<string, number>;
  gauges: Map<string, number>;
  timers: Map<string, PerformanceMetric>;
  isCollecting: boolean;
  batchSize: number;
  flushInterval: number;
}

const DEFAULT_CONFIG = {
  batchSize: 100,
  flushInterval: 30000, // 30 seconds
  enableAutoFlush: true,
  enablePerformanceApi: true,
};

export function useMetrics(config = DEFAULT_CONFIG) {
  const db = useIndexedDB();
  const flushTimerRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<MetricsState>({
    counters: new Map(),
    gauges: new Map(),
    timers: new Map(),
    isCollecting: true,
    batchSize: config.batchSize,
    flushInterval: config.flushInterval,
  });

  // Counter metrics - values that only increase
  const incrementCounter = useCallback((name: string, value = 1, labels?: Record<string, string>) => {
    if (!state.isCollecting) return;
    
    const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
    setState(prev => {
      const newCounters = new Map(prev.counters);
      newCounters.set(key, (newCounters.get(key) || 0) + value);
      return { ...prev, counters: newCounters };
    });
    
    // Queue for batch sending
    queueMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'counter',
    });
  }, [state.isCollecting]);

  // Gauge metrics - values that can go up or down
  const setGauge = useCallback((name: string, value: number, labels?: Record<string, string>) => {
    if (!state.isCollecting) return;
    
    const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
    setState(prev => {
      const newGauges = new Map(prev.gauges);
      newGauges.set(key, value);
      return { ...prev, gauges: newGauges };
    });
    
    queueMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'gauge',
    });
  }, [state.isCollecting]);

  // Timer metrics - measure duration
  const startTimer = useCallback((name: string, labels?: Record<string, string>) => {
    if (!state.isCollecting) return null;
    
    const timerId = `${name}:${Date.now()}:${Math.random()}`;
    const timer: PerformanceMetric = {
      name,
      startTime: performance.now(),
      labels,
    };
    
    setState(prev => {
      const newTimers = new Map(prev.timers);
      newTimers.set(timerId, timer);
      return { ...prev, timers: newTimers };
    });
    
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - timer.startTime;
        
        setState(prev => {
          const newTimers = new Map(prev.timers);
          newTimers.delete(timerId);
          return { ...prev, timers: newTimers };
        });
        
        queueMetric({
          name: `${name}_duration_ms`,
          value: duration,
          timestamp: new Date().toISOString(),
          labels,
          type: 'timer',
        });
        
        return duration;
      },
    };
  }, [state.isCollecting]);

  // Time a function execution
  const timeFunction = useCallback(async <T>(
    name: string,
    fn: () => Promise<T> | T,
    labels?: Record<string, string>
  ): Promise<T> => {
    const timer = startTimer(name, labels);
    try {
      const result = await fn();
      timer?.end();
      return result;
    } catch (error) {
      timer?.end();
      incrementCounter(`${name}_errors`, 1, labels);
      throw error;
    }
  }, [startTimer, incrementCounter]);

  // Measure page performance
  const measurePagePerformance = useCallback(() => {
    if (!config.enablePerformanceApi || !window.performance) return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;
    
    const metrics = {
      // Core Web Vitals
      'page_load_time': navigation.loadEventEnd - navigation.fetchStart,
      'dom_content_loaded': navigation.domContentLoadedEventEnd - navigation.fetchStart,
      'first_byte': navigation.responseStart - navigation.fetchStart,
      'dns_lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      'tcp_connect': navigation.connectEnd - navigation.connectStart,
    };
    
    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        setGauge(`performance_${name}_ms`, value);
      }
    });
    
    // Measure resource timings
    const resources = performance.getEntriesByType('resource');
    const resourceTypes = new Map<string, number>();
    
    resources.forEach(resource => {
      const type = (resource as PerformanceResourceTiming).initiatorType || 'other';
      resourceTypes.set(type, (resourceTypes.get(type) || 0) + 1);
    });
    
    resourceTypes.forEach((count, type) => {
      setGauge('resource_count', count, { type });
    });
  }, [setGauge, config.enablePerformanceApi]);

  // Memory usage metrics
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as never as { memory: MemoryInfo }).memory;
      setGauge('memory_used_bytes', memory.usedJSHeapSize);
      setGauge('memory_total_bytes', memory.totalJSHeapSize);
      setGauge('memory_limit_bytes', memory.jsHeapSizeLimit);
    }
    
    // IndexedDB usage estimation
    if (db.isInitialized) {
      navigator.storage?.estimate().then(estimate => {
        if (estimate.usage) setGauge('storage_used_bytes', estimate.usage);
        if (estimate.quota) setGauge('storage_quota_bytes', estimate.quota);
      }).catch(() => {
        // Ignore errors
      });
    }
  }, [setGauge, db.isInitialized]);

  // Queue metric for batch sending
  const metricQueue = useRef<MetricData[]>([]);
  
  const queueMetric = useCallback((metric: MetricData) => {
    metricQueue.current.push(metric);
    
    // Auto-flush if batch size reached
    if (metricQueue.current.length >= state.batchSize) {
      flushMetrics();
    }
  }, [state.batchSize]);

  // Flush metrics to storage/server
  const flushMetrics = useCallback(async () => {
    if (metricQueue.current.length === 0) return;
    
    const metrics = [...metricQueue.current];
    metricQueue.current = [];
    
    try {
      // Store locally first
      if (db.isInitialized) {
        await db.storeMetrics?.(metrics);
      }
      
      // TODO: Send to analytics server
      console.log(`📊 Flushed ${metrics.length} metrics`);
      
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-queue failed metrics
      metricQueue.current.unshift(...metrics);
    }
  }, [db]);

  // Application-specific metrics
  const trackUserAction = useCallback((action: string, metadata?: Record<string, string>) => {
    incrementCounter('user_actions', 1, { action, ...metadata });
  }, [incrementCounter]);

  const trackQuestionInteraction = useCallback((questionId: string, type: 'start' | 'complete' | 'skip') => {
    incrementCounter('question_interactions', 1, { type });
    incrementCounter(`question_${type}`, 1, { question_id: questionId });
  }, [incrementCounter]);

  const trackSyncOperation = useCallback((operation: 'attempt' | 'success' | 'failure', itemCount?: number) => {
    incrementCounter('sync_operations', 1, { operation });
    if (itemCount) {
      setGauge('sync_queue_size', itemCount);
    }
  }, [incrementCounter, setGauge]);

  const trackContentLoad = useCallback((packId: string, loadTime: number, cached: boolean) => {
    incrementCounter('content_loads', 1, { pack_id: packId, cached: cached.toString() });
    setGauge('content_load_time_ms', loadTime, { pack_id: packId });
  }, [incrementCounter, setGauge]);

  const trackError = useCallback((error: Error, context?: string) => {
    incrementCounter('errors', 1, { 
      type: error.name,
      context: context || 'unknown',
    });
    
    // Store error details for debugging
    queueMetric({
      name: 'error_details',
      value: 1,
      timestamp: new Date().toISOString(),
      labels: {
        message: error.message,
        stack: error.stack?.substring(0, 500) || '',
        context: context || 'unknown',
      },
      type: 'counter',
    });
  }, [incrementCounter, queueMetric]);

  // System metrics collection
  useEffect(() => {
    if (!config.enableAutoFlush) return;
    
    // Set up periodic metrics collection
    const collectSystemMetrics = () => {
      measureMemoryUsage();
      setGauge('timestamp', Date.now());
    };
    
    // Collect initial metrics
    measurePagePerformance();
    collectSystemMetrics();
    
    // Set up periodic collection
    const metricsInterval = setInterval(collectSystemMetrics, 10000); // Every 10 seconds
    
    return () => clearInterval(metricsInterval);
  }, [measurePagePerformance, measureMemoryUsage, setGauge, config.enableAutoFlush]);

  // Set up auto-flush timer
  useEffect(() => {
    if (!config.enableAutoFlush) return;
    
    flushTimerRef.current = setInterval(() => {
      flushMetrics();
    }, state.flushInterval);
    
    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
    };
  }, [flushMetrics, state.flushInterval, config.enableAutoFlush]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      flushMetrics();
    };
  }, [flushMetrics]);

  // Get current metrics summary
  const getMetricsSummary = useCallback(() => {
    return {
      counters: Object.fromEntries(state.counters),
      gauges: Object.fromEntries(state.gauges),
      activeTimers: state.timers.size,
      queuedMetrics: metricQueue.current.length,
    };
  }, [state]);

  const toggleCollection = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isCollecting: enabled }));
  }, []);

  return {
    // Basic metrics
    incrementCounter,
    setGauge,
    startTimer,
    timeFunction,
    
    // System metrics
    measurePagePerformance,
    measureMemoryUsage,
    
    // Application metrics
    trackUserAction,
    trackQuestionInteraction,
    trackSyncOperation,
    trackContentLoad,
    trackError,
    
    // Management
    flushMetrics,
    getMetricsSummary,
    toggleCollection,
    
    // State
    isCollecting: state.isCollecting,
    queuedMetrics: metricQueue.current.length,
  };
}