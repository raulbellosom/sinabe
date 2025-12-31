/**
 * Service Worker personalizado para Sinabe
 * Maneja:
 * - Caching de assets (via Workbox)
 * - Push Notifications
 * - Background Sync (futuro)
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache de assets generados por Vite
precacheAndRoute(self.__WB_MANIFEST);

// Limpiar caches viejos
cleanupOutdatedCaches();

// ========================================
// ESTRATEGIAS DE CACHE
// ========================================

// Cache para imágenes
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  }),
);

// Cache para fuentes
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
      }),
    ],
  }),
);

// Cache para JS y CSS
registerRoute(
  ({ request }) =>
    request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// API calls - Network First (no cachear, pero fallback a cache si offline)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  }),
);

// Navegación SPA - devolver index.html
const navigationHandler = new NavigationRoute(
  async ({ request }) => {
    try {
      return await fetch(request);
    } catch (error) {
      const cache = await caches.open('offline-cache');
      return await cache.match('/index.html');
    }
  },
  {
    denylist: [/^\/api\//],
  },
);

registerRoute(navigationHandler);

// ========================================
// PUSH NOTIFICATIONS
// ========================================

/**
 * Evento: Recibir notificación push
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);

  let data = {
    title: 'Sinabe',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    url: '/',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'sinabe-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      timestamp: data.timestamp || Date.now(),
      ...data.data,
    },
    actions: data.actions || [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/**
 * Evento: Click en notificación
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Abrir o enfocar la ventana de la app
  const urlToOpen = notificationData?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Buscar si ya hay una ventana abierta
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Si no hay ventana, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

/**
 * Evento: Cerrar notificación
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification cerrada:', event.notification.tag);
  // Aquí podrías trackear analytics de notificaciones ignoradas
});

// ========================================
// SERVICE WORKER LIFECYCLE
// ========================================

/**
 * Evento: Instalación
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

/**
 * Evento: Activación
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activado');
  // Tomar control de todas las páginas inmediatamente
  event.waitUntil(clients.claim());
});

/**
 * Evento: Mensajes desde la app
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open('dynamic-cache').then((cache) => {
        return cache.addAll(event.data.urls);
      }),
    );
  }
});
