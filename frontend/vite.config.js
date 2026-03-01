import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  // Use a non-default cache dir so Vite generates completely new chunk names
  // that the browser has never seen before, bypassing any stale HTTP cache.
  cacheDir: 'node_modules/.vite-sinabe',
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@headlessui/react'],
    conditions: ['module', 'browser', 'development|production'],
  },
  optimizeDeps: {
    // All known deps are listed in `include` so Vite pre-bundles everything
    // up-front and never needs to re-optimize mid-session (no ?v= hash churn).
    // NOTE: `force` removed — with an explicit include list Vite already avoids
    // mid-session re-optimization, and force:true caused ~3-5s of unnecessary
    // re-bundling on every cold start.
    include: [
      // React core
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      // Routing & state
      'react-router-dom',
      '@tanstack/react-query',
      // UI / animation
      '@headlessui/react',
      'framer-motion',
      'lucide-react',
      '@use-gesture/react',
      // Forms & validation
      'formik',
      'yup',
      // Utilities
      'classnames',
      'sonner',
      'axios',
      'dayjs',
      'date-fns',
      'lodash',
      'uuid',
      // Media & files
      'browser-image-compression',
      'file-saver',
      'jszip',
      'react-photo-view',
      'react-lazy-load-image-component',
      'react-responsive',
      'react-loading-skeleton',
      'react-loader-spinner',
      // Charts
      'chart.js',
      'react-chartjs-2',
      // Documents & QR
      'react-pdf',
      'qrcode.react',
      // DnD & signature
      'react-beautiful-dnd',
      'react-signature-canvas',
      // Capacitor
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/camera',
      '@capacitor/status-bar',
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'robots.txt', 'assets/*'],
      manifest: {
        name: 'Sinabe',
        short_name: 'Sinabe',
        description: 'Gestion de proyectos e inventarios',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
        type: 'module',
        navigateFallback: 'index.html',
        suppressWarnings: true,
      },
    }),
  ],
  build: {
    target: 'esnext',
    // Temporary: allow larger bundles while we avoid dynamic imports to
    // prioritize runtime stability over granular code splitting.
    chunkSizeWarningLimit: 2500,
  },
});
