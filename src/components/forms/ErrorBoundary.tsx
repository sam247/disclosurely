
import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    const errorMessage = error?.message || 'Unknown error';
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // If it's a module loading error, try to reload the page
    if (errorMessage.includes('Failed to fetch dynamically imported module') || 
        errorMessage.includes('MIME type')) {
      console.warn('Module loading error detected. This may be a deployment issue. Attempting page reload...');
      // Don't auto-reload, let user decide
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-900">Something went wrong</h3>
                <p className="text-sm text-red-800">
                  {this.state.error?.message || 'An unexpected error occurred. Please refresh the page and try again.'}
                </p>
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
