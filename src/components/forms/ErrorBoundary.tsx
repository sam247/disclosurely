
import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    const errorMessage = error?.message || 'Unknown error';
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // If it's a module loading error, log it but don't auto-reload
    const isModuleError = 
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('MIME type') ||
      errorMessage.includes('ChunkLoadError');

    if (isModuleError) {
      console.warn('Module loading error detected. This may be a deployment issue.');
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, retryCount: this.state.retryCount + 1 });
  };

  private handleReload = () => {
    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isModuleError = 
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('MIME type') ||
        this.state.error?.message?.includes('ChunkLoadError');

      return (
        <Card className="border-red-200 bg-red-50 m-4">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Something went wrong</h3>
                  <p className="text-sm text-red-800 mb-4">
                    {isModuleError 
                      ? 'Unable to load the required component. This may be due to a deployment update. Please try refreshing the page.'
                      : this.state.error?.message || 'An unexpected error occurred. Please refresh the page and try again.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                      onClick={this.handleRetry}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={this.handleReload}
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                  
                  {this.state.retryCount > 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Retry attempt: {this.state.retryCount}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
