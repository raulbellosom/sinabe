import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ── Dev-mode: unregister stale Service Workers & flush caches ───────────────
// vite-plugin-pwa sets devOptions.enabled = false, which means NO new SW gets
// registered in dev. But a previously-registered SW (from a prod build or
// preview) **stays active** and intercepts Vite dev-server requests, returning
// cached HTML instead of JS modules → MIME-type errors.
// Fix: eagerly unregister every SW and nuke workbox caches when running on the
// Vite dev server.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister();
      console.log('[DEV] Unregistered stale Service Worker:', reg.scope);
    }
  });
  // Also clear any workbox / SW caches that could still serve stale responses
  if (typeof caches !== 'undefined') {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
        console.log('[DEV] Deleted cache:', name);
      }
    });
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Global handler for stale chunk / module errors (production) ─────────────
// After a deployment the old chunk files no longer exist on the server.
// The server returns index.html (text/html) for unknown paths, which triggers
// a MIME-type error or "Failed to fetch dynamically imported module".
// Catch these at the window level and force a single reload.
function isChunkLoadError(message = '') {
  const m = message.toLowerCase();
  return (
    m.includes('failed to fetch dynamically imported module') ||
    m.includes('importing a module script') ||
    m.includes('mime type') ||
    m.includes('loading chunk') ||
    m.includes('loading css chunk')
  );
}

const RELOAD_KEY = 'sinabe-chunk-reload';

function handleChunkError() {
  const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
  if (!alreadyReloaded) {
    sessionStorage.setItem(RELOAD_KEY, '1');
    window.location.reload();
  } else {
    // Already tried once, don't loop forever
    sessionStorage.removeItem(RELOAD_KEY);
  }
}

// Clear the reload flag on successful load
sessionStorage.removeItem(RELOAD_KEY);

window.addEventListener('error', (event) => {
  if (isChunkLoadError(event.message)) {
    event.preventDefault();
    handleChunkError();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (isChunkLoadError(msg)) {
    event.preventDefault();
    handleChunkError();
  }
});
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
