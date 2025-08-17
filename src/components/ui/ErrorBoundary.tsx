import React, { Component, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (if configured)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // In production, this would send to an error tracking service
      const errorReport = {
        id: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      console.log('Error Report:', errorReport);
      
      // Store in localStorage for potential manual report
      try {
        const existingReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
        existingReports.push(errorReport);
        // Keep only last 10 reports
        if (existingReports.length > 10) {
          existingReports.splice(0, existingReports.length - 10);
        }
        localStorage.setItem('error_reports', JSON.stringify(existingReports));
      } catch (storageError) {
        console.warn('Failed to store error report:', storageError);
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReportIssue = () => {
    const errorReport = {
      id: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    };

    // Copy to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error details copied to clipboard. Please paste in your bug report.');
    }).catch(() => {
      // Fallback: open mailto with error details
      const subject = encodeURIComponent(`SAT App Error Report - ${this.state.errorId}`);
      const body = encodeURIComponent(`Error Details:\n\n${JSON.stringify(errorReport, null, 2)}`);
      window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600">
                  The app encountered an unexpected error and needs to restart.
                </p>
              </div>

              {this.props.showDetails && this.state.error && (
                <div className="mb-6">
                  <details className="bg-white border border-red-200 rounded p-3">
                    <summary className="cursor-pointer text-sm font-medium text-red-700 mb-2">
                      Technical Details (ID: {this.state.errorId})
                    </summary>
                    <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap">
                      <strong>Error:</strong> {this.state.error.message}
                      {this.state.error.stack && (
                        <>
                          <br /><br />
                          <strong>Stack:</strong>
                          <br />
                          {this.state.error.stack}
                        </>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <>
                          <br /><br />
                          <strong>Component Stack:</strong>
                          <br />
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={this.handleReload}
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={this.handleReportIssue}
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Bug className="h-4 w-4" />
                    Report Issue
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Your progress is automatically saved and won't be lost.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to manually trigger error boundary for testing
export function useErrorHandler() {
  const throwError = (message: string = 'Test error') => {
    throw new Error(message);
  };

  return { throwError };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Async error boundary for handling promise rejections
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error toast
    import('./ErrorToast').then(({ ErrorToast }) => {
      ErrorToast.show({
        type: 'unknown',
        message: 'An unexpected error occurred',
        details: event.reason?.message || 'Unhandled promise rejection',
        recoverable: true,
      });
    });

    // Prevent console error
    event.preventDefault();
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Don't show toast for errors already handled by ErrorBoundary
    if (!event.error?.message?.includes('ErrorBoundary')) {
      import('./ErrorToast').then(({ ErrorToast }) => {
        ErrorToast.show({
          type: 'unknown',
          message: 'JavaScript error occurred',
          details: event.error?.message || event.message,
          recoverable: true,
        });
      });
    }
  });
}