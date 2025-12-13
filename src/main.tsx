import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import i18n from './i18n/config'
import ErrorBoundary from './components/forms/ErrorBoundary'
import * as Sentry from "@sentry/react"

// Initialize Sentry BEFORE React
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    release: import.meta.env.VITE_SENTRY_RELEASE || 'unknown',
    
    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring sample rate (set to 0 to stay 100% in free tier)
    tracesSampleRate: 0, // Disabled to guarantee free tier (only errors tracked)
    
    // Session Replay sample rate
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Skip localhost errors in development
      if (window.location.hostname === 'localhost' && !import.meta.env.PROD) {
        return null
      }
      
      // Redact sensitive information from error messages
      if (event.message) {
        event.message = event.message
          .replace(/Bearer\s+[^\s]+/g, 'Bearer [REDACTED]')
          .replace(/password=\S+/gi, 'password=[REDACTED]')
          .replace(/token=\S+/gi, 'token=[REDACTED]')
          .replace(/apikey=\S+/gi, 'apikey=[REDACTED]')
      }
      
      // Redact sensitive data from request/response bodies
      if (event.request) {
        delete event.request.cookies
        if (event.request.data && typeof event.request.data === 'object') {
          const sanitized = { ...event.request.data } as any
          delete sanitized.password
          delete sanitized.token
          delete sanitized.apiKey
          event.request.data = sanitized
        }
      }
      
      return event
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // Network errors (handled by app retry logic)
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      // Browser extension errors
      'chrome-extension://',
      'moz-extension://',
      // React hydration errors (non-critical)
      'Hydration failed',
    ],
  })
  
  // Sentry initialized
} else {
  // Sentry DSN not found - error monitoring disabled
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})



createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    </I18nextProvider>
  </ErrorBoundary>
);
