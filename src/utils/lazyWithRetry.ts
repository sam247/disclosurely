import { ComponentType, lazy } from 'react';

/**
 * Creates a lazy-loaded component with retry logic for failed module loads
 * This helps handle deployment issues where chunk files might not be available
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptImport = (attempt: number) => {
        importFn()
          .then(resolve)
          .catch((error) => {
            // Check if it's a module loading error
            const isModuleError = 
              error?.message?.includes('Failed to fetch dynamically imported module') ||
              error?.message?.includes('MIME type') ||
              error?.message?.includes('404') ||
              error?.name === 'ChunkLoadError';

            if (isModuleError && attempt < retries) {
              console.warn(
                `Module load failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`,
                error
              );
              
              // Wait before retrying
              setTimeout(() => {
                attemptImport(attempt + 1);
              }, delay * attempt); // Exponential backoff
            } else {
              // If it's not a module error or we've exhausted retries, reject
              console.error('Module load failed after retries:', error);
              reject(error);
            }
          });
      };

      attemptImport(1);
    });
  });
}

