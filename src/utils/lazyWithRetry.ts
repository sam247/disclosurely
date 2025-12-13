import { ComponentType, lazy } from 'react';

/**
 * Creates a lazy-loaded component with retry logic for failed module loads
 * This helps handle deployment issues where chunk files might not be available
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 5,
  delay = 500
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptImport = (attempt: number) => {
        importFn()
          .then(resolve)
          .catch((error) => {
            // Check if it's a module loading error (stale chunks)
            const isModuleError = 
              error?.message?.includes('Failed to fetch dynamically imported module') ||
              error?.message?.includes('MIME type') ||
              error?.message?.includes('404') ||
              error?.message?.includes('ChunkLoadError') ||
              error?.name === 'ChunkLoadError';

            if (isModuleError && attempt < retries) {
              console.warn(
                `Module load failed (attempt ${attempt}/${retries}). This may be due to a deployment update. Retrying...`,
                error
              );
              
              // For module errors, try fetching the HTML first to get fresh chunk references
              if (attempt === 1) {
                // On first retry, try to fetch fresh HTML
                fetch(window.location.href, { cache: 'no-store' })
                  .then(() => {
                    // Wait a bit for CDN to update, then retry
                    setTimeout(() => {
                      attemptImport(attempt + 1);
                    }, delay * attempt);
                  })
                  .catch(() => {
                    // If HTML fetch fails, just retry normally
                    setTimeout(() => {
                      attemptImport(attempt + 1);
                    }, delay * attempt);
                  });
              } else {
                // Subsequent retries with exponential backoff
                setTimeout(() => {
                  attemptImport(attempt + 1);
                }, delay * Math.pow(2, attempt - 1));
              }
            } else if (isModuleError) {
              // After all retries, this is likely a stale deployment - let error boundary handle it
              console.error('Module load failed after retries. Likely stale deployment - error boundary will handle reload.');
              reject(error);
            } else {
              // If it's not a module error, reject immediately
              console.error('Module load failed (non-module error):', error);
              reject(error);
            }
          });
      };

      attemptImport(1);
    });
  });
}

