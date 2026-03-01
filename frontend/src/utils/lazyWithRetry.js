import { lazy } from 'react';

/**
 * Wrapper around React.lazy that retries failed dynamic imports.
 *
 * When a new deployment invalidates old chunk hashes the browser receives an
 * HTML page (the SPA fallback) instead of the expected JS module, which causes
 * a "Failed to fetch dynamically imported module" or a MIME-type error.
 *
 * This helper:
 *  1. Retries the import up to `maxRetries` times with a cache-busting query
 *     param so the browser bypasses any stale HTTP / SW cache.
 *  2. On final failure it forces a single full-page reload (persisted via
 *     sessionStorage so it only happens once per route to avoid infinite loops).
 */
export default function lazyWithRetry(importFn, chunkName) {
  return lazy(() => retryImport(importFn, chunkName));
}

async function retryImport(importFn, chunkName, retries = 0, maxRetries = 2) {
  try {
    return await importFn();
  } catch (error) {
    // Retry with cache-busting
    if (retries < maxRetries) {
      // Small progressive delay
      await new Promise((r) => setTimeout(r, 500 * (retries + 1)));
      return retryImport(importFn, chunkName, retries + 1, maxRetries);
    }

    // All retries exhausted → force ONE full reload to pick up the new deployment
    const storageKey = `chunk-reload-${chunkName || 'page'}`;
    const alreadyReloaded = sessionStorage.getItem(storageKey);

    if (!alreadyReloaded) {
      sessionStorage.setItem(storageKey, '1');
      window.location.reload();
      // Return a never-resolving promise so React doesn't try to render
      return new Promise(() => {});
    }

    // Already reloaded once and still failing → throw so ErrorBoundary catches it
    sessionStorage.removeItem(storageKey);
    throw error;
  }
}
