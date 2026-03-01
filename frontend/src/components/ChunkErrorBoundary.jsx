import React from 'react';

/**
 * Error boundary that catches chunk / dynamic-import failures and offers
 * the user a one-click recovery (full reload).
 *
 * Wrap this around <Routes> or any Suspense boundary that lazy-loads pages.
 */
export default class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Catch ALL errors that occur within the lazy-loaded route tree.
    // Even non-chunk errors (e.g. "basename is null") are typically
    // downstream effects of a failed module import. Catching everything
    // prevents a white screen and gives the user a reload button.
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Actualización disponible
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Hay una nueva versión de la aplicación. Recarga la página para
              obtener la última actualización.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Heuristic to detect dynamic import / chunk load failures.
 */
function isChunkError(error) {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk') ||
    msg.includes('dynamically imported module') ||
    msg.includes('mime type') ||
    msg.includes('importing a module script') ||
    error.name === 'ChunkLoadError'
  );
}
