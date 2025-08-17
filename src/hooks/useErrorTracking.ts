import { useState, useCallback, useEffect, useRef } from 'react';
import { useMetrics } from './useMetrics';

interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context?: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
  resolved?: boolean;
}

interface ErrorPattern {
  pattern: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  examples: string[];
}

interface ErrorState {
  recentErrors: ErrorReport[];
  errorPatterns: Map<string, ErrorPattern>;
  totalErrors: number;
  isTracking: boolean;
}

const MAX_RECENT_ERRORS = 50;
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

export function useErrorTracking() {
  const metrics = useMetrics();
  const [state, setState] = useState<ErrorState>({
    recentErrors: [],
    errorPatterns: new Map(),
    totalErrors: 0,
    isTracking: true,
  });

  const reportQueue = useRef<ErrorReport[]>([]);

  // Generate error report
  const createErrorReport = useCallback((
    error: Error | string,
    context?: string,
    metadata?: Record<string, unknown>
  ): ErrorReport => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const severity = determineSeverity(errorObj, context);
    
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      message: errorObj.message,
      stack: errorObj.stack,
      context: context || 'unknown',
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: SESSION_ID,
      severity,
      metadata,
    };
  }, []);

  // Determine error severity based on context and error type
  const determineSeverity = (error: Error, context?: string): ErrorReport['severity'] => {
    // Critical errors - app breaking
    if (error.name === 'ChunkLoadError' || 
        error.message.includes('Loading chunk') ||
        context === 'app_crash') {
      return 'critical';
    }
    
    // High severity - major functionality broken
    if (error.name === 'TypeError' && context?.includes('auth') ||
        error.message.includes('Network Error') ||
        context === 'payment_failure') {
      return 'high';
    }
    
    // Medium severity - feature degradation
    if (error.name === 'NetworkError' ||
        context?.includes('sync') ||
        context?.includes('storage')) {
      return 'medium';
    }
    
    // Low severity - minor issues
    return 'low';
  };

  // Track error patterns
  const trackErrorPattern = useCallback((errorReport: ErrorReport) => {
    const pattern = createErrorPattern(errorReport);
    
    setState(prev => {
      const newPatterns = new Map(prev.errorPatterns);
      const existing = newPatterns.get(pattern);
      
      if (existing) {
        existing.count++;
        existing.lastSeen = errorReport.timestamp;
        existing.examples.push(errorReport.id);
        // Keep only recent examples
        if (existing.examples.length > 5) {
          existing.examples = existing.examples.slice(-5);
        }
      } else {
        newPatterns.set(pattern, {
          pattern,
          count: 1,
          firstSeen: errorReport.timestamp,
          lastSeen: errorReport.timestamp,
          examples: [errorReport.id],
        });
      }
      
      return { ...prev, errorPatterns: newPatterns };
    });
  }, []);

  // Create error pattern key for grouping similar errors
  const createErrorPattern = (errorReport: ErrorReport): string => {
    // Group by error type, first line of stack, and context
    const errorType = errorReport.message.split(':')[0] || 'Unknown';
    const stackFirstLine = errorReport.stack?.split('\n')[1]?.trim() || '';
    const context = errorReport.context || 'unknown';
    
    return `${errorType}:${context}:${stackFirstLine.substring(0, 100)}`;
  };

  // Main error tracking function
  const trackError = useCallback((
    error: Error | string,
    context?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!state.isTracking) return;
    
    const errorReport = createErrorReport(error, context, metadata);
    
    console.error(`[ErrorTracker] ${errorReport.severity.toUpperCase()}: ${errorReport.message}`, {
      context,
      metadata,
      stack: errorReport.stack,
    });
    
    // Update state
    setState(prev => {
      const newRecentErrors = [errorReport, ...prev.recentErrors].slice(0, MAX_RECENT_ERRORS);
      return {
        ...prev,
        recentErrors: newRecentErrors,
        totalErrors: prev.totalErrors + 1,
      };
    });
    
    // Track pattern
    trackErrorPattern(errorReport);
    
    // Send to metrics
    metrics.trackError(typeof error === 'string' ? new Error(error) : error, context);
    
    // Queue for reporting
    reportQueue.current.push(errorReport);
    
    // Report critical errors immediately
    if (errorReport.severity === 'critical') {
      reportError(errorReport);
    }
  }, [state.isTracking, createErrorReport, trackErrorPattern, metrics]);

  // Report error to external service
  const reportError = useCallback(async (errorReport: ErrorReport) => {
    try {
      // Store locally first
      const existingReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
      existingReports.push(errorReport);
      
      // Keep only recent reports
      if (existingReports.length > 100) {
        existingReports.splice(0, existingReports.length - 100);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(existingReports));
      
      // TODO: Send to external error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }, []);

  // Batch report errors
  const flushErrorReports = useCallback(async () => {
    if (reportQueue.current.length === 0) return;
    
    const errors = [...reportQueue.current];
    reportQueue.current = [];
    
    try {
      // Report non-critical errors in batch
      for (const error of errors) {
        if (error.severity !== 'critical') {
          await reportError(error);
        }
      }
    } catch (error) {
      console.error('Failed to flush error reports:', error);
      // Re-queue failed reports
      reportQueue.current.unshift(...errors);
    }
  }, [reportError]);

  // Convenience methods for common error scenarios
  const trackNetworkError = useCallback((url: string, status?: number, statusText?: string) => {
    trackError(
      new Error(`Network request failed: ${status || 'Unknown'} ${statusText || ''}`),
      'network',
      { url, status, statusText }
    );
  }, [trackError]);

  const trackStorageError = useCallback((operation: string, error: Error) => {
    trackError(error, 'storage', { operation });
  }, [trackError]);

  const trackSyncError = useCallback((operation: string, itemCount: number, error: Error) => {
    trackError(error, 'sync', { operation, itemCount });
  }, [trackError]);

  const trackUIError = useCallback((component: string, error: Error) => {
    trackError(error, 'ui', { component });
  }, [trackError]);

  const trackAuthError = useCallback((operation: string, error: Error) => {
    trackError(error, 'auth', { operation });
  }, [trackError]);

  // Get error statistics
  const getErrorStats = useCallback(() => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const recentErrorsHour = state.recentErrors.filter(
      err => new Date(err.timestamp).getTime() > oneHourAgo
    );
    
    const recentErrorsDay = state.recentErrors.filter(
      err => new Date(err.timestamp).getTime() > oneDayAgo
    );
    
    const severityCounts = state.recentErrors.reduce((acc, err) => {
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: state.totalErrors,
      recentHour: recentErrorsHour.length,
      recentDay: recentErrorsDay.length,
      patterns: state.errorPatterns.size,
      severity: severityCounts,
      topPatterns: Array.from(state.errorPatterns.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }, [state]);

  // Clear old errors
  const clearErrors = useCallback((olderThan?: Date) => {
    setState(prev => {
      const cutoff = olderThan || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      const filteredErrors = prev.recentErrors.filter(
        err => new Date(err.timestamp) > cutoff
      );
      
      return {
        ...prev,
        recentErrors: filteredErrors,
      };
    });
  }, []);

  // Toggle error tracking
  const toggleTracking = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isTracking: enabled }));
  }, []);

  // Set up global error handlers
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'unhandled_promise_rejection'
      );
    };

    const handleError = (event: ErrorEvent) => {
      trackError(
        new Error(event.message),
        'global_error',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [trackError]);

  // Set up periodic error reporting
  useEffect(() => {
    const interval = setInterval(() => {
      flushErrorReports();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [flushErrorReports]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      flushErrorReports();
    };
  }, [flushErrorReports]);

  return {
    // Error tracking
    trackError,
    trackNetworkError,
    trackStorageError,
    trackSyncError,
    trackUIError,
    trackAuthError,
    
    // Data access
    recentErrors: state.recentErrors,
    errorPatterns: Array.from(state.errorPatterns.values()),
    getErrorStats,
    
    // Management
    clearErrors,
    toggleTracking,
    flushErrorReports,
    
    // State
    isTracking: state.isTracking,
    totalErrors: state.totalErrors,
  };
}