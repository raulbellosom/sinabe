/**
 * Servicio de Push Notifications
 * Maneja suscripciones Web Push y Capacitor Push
 */
import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_URL = raw.endsWith('/api') ? raw : `${raw}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// UTILIDADES
// ============================================

/**
 * Verifica si las notificaciones push están soportadas
 */
export const isPushSupported = () => {
  if (Capacitor.isNativePlatform()) {
    return true; // Capacitor siempre soporta push
  }
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Verifica si estamos en una plataforma nativa
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Obtiene el estado actual del permiso de notificaciones
 */
export const getPermissionStatus = async () => {
  if (Capacitor.isNativePlatform()) {
    // Para Capacitor, se maneja diferente
    return 'default'; // Se verificará con el plugin
  }

  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
};

// ============================================
// WEB PUSH (PWA / Chrome)
// ============================================

/**
 * Obtiene la clave pública VAPID del servidor
 */
export const getVapidPublicKey = async () => {
  const response = await api.get('/push/vapid-public-key');
  return response.data.publicKey;
};

/**
 * Convierte la clave VAPID a formato Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Solicita permiso de notificaciones al usuario
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Este navegador no soporta notificaciones');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Suscribe el navegador a notificaciones push
 */
export const subscribeToWebPush = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications no soportadas en este navegador');
  }

  // Solicitar permiso
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Permiso de notificaciones denegado');
  }

  // Obtener el service worker
  const registration = await navigator.serviceWorker.ready;

  // Obtener la clave pública VAPID
  const vapidPublicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  // Suscribirse a push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Enviar la suscripción al servidor
  const response = await api.post('/push/subscribe', {
    subscription: subscription.toJSON(),
    deviceType: 'web',
  });

  return response.data;
};

/**
 * Cancela la suscripción a push
 */
export const unsubscribeFromWebPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    // Notificar al servidor
    await api.delete('/push/unsubscribe', {
      data: { endpoint: subscription.endpoint },
    });

    // Cancelar la suscripción localmente
    await subscription.unsubscribe();
  }

  return true;
};

/**
 * Verifica si el usuario ya está suscrito
 */
export const isSubscribed = async () => {
  if (!isPushSupported() || Capacitor.isNativePlatform()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription !== null;
};

/**
 * Obtiene la suscripción actual
 */
export const getCurrentSubscription = async () => {
  if (!isPushSupported() || Capacitor.isNativePlatform()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
};

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Obtiene las suscripciones del usuario actual
 */
export const getUserSubscriptions = async () => {
  const response = await api.get('/push/subscriptions');
  return response.data.subscriptions;
};

/**
 * Envía una notificación push de prueba
 */
export const sendTestPush = async () => {
  const response = await api.post('/push/test');
  return response.data;
};

/**
 * Envía una notificación push a un usuario específico (admin)
 */
export const sendPushToUser = async (userId, notification) => {
  const response = await api.post('/push/send', {
    userId,
    ...notification,
  });
  return response.data;
};

// ============================================
// CAPACITOR PUSH (Android/iOS)
// ============================================

let PushNotifications = null;

/**
 * Inicializa el plugin de Capacitor Push (lazy load)
 */
const loadCapacitorPush = async () => {
  if (PushNotifications) return PushNotifications;

  if (Capacitor.isNativePlatform()) {
    try {
      const module = await import('@capacitor/push-notifications');
      PushNotifications = module.PushNotifications;
      return PushNotifications;
    } catch (error) {
      console.warn(
        'Plugin @capacitor/push-notifications no disponible:',
        error,
      );
      return null;
    }
  }
  return null;
};

/**
 * Registra el dispositivo para push notifications (Capacitor)
 */
export const registerCapacitorPush = async () => {
  const Push = await loadCapacitorPush();
  if (!Push) {
    throw new Error('Capacitor Push no disponible');
  }

  // Verificar permisos
  let permStatus = await Push.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await Push.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('Permiso de notificaciones denegado');
  }

  // Registrar para push
  await Push.register();

  return new Promise((resolve, reject) => {
    // Listener para obtener el token
    Push.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value);

      try {
        // Enviar el token FCM al servidor
        const response = await api.post('/push/subscribe', {
          subscription: {
            endpoint: `fcm://${token.value}`,
            keys: { fcmToken: token.value },
          },
          deviceType: Capacitor.getPlatform(), // 'android' o 'ios'
        });

        resolve({ token: token.value, ...response.data });
      } catch (error) {
        reject(error);
      }
    });

    Push.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      reject(new Error(error.error));
    });
  });
};

/**
 * Configura los listeners de notificaciones para Capacitor
 */
export const setupCapacitorPushListeners = async (callbacks = {}) => {
  const Push = await loadCapacitorPush();
  if (!Push) return;

  const { onNotificationReceived, onNotificationTapped, onError } = callbacks;

  // Notificación recibida mientras la app está abierta
  Push.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Notificación tocada (abre la app)
  Push.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push notification action performed:', action);
    if (onNotificationTapped) {
      onNotificationTapped(action.notification, action.actionId);
    }
  });

  // Error
  Push.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
    if (onError) {
      onError(error);
    }
  });
};

/**
 * Limpia los listeners de Capacitor Push
 */
export const removeCapacitorPushListeners = async () => {
  const Push = await loadCapacitorPush();
  if (Push) {
    await Push.removeAllListeners();
  }
};

// ============================================
// UNIFIED API
// ============================================

/**
 * Suscribe al usuario a notificaciones push (detecta plataforma)
 */
export const subscribeToPush = async () => {
  if (Capacitor.isNativePlatform()) {
    return await registerCapacitorPush();
  } else {
    return await subscribeToWebPush();
  }
};

/**
 * Cancela la suscripción a push (detecta plataforma)
 */
export const unsubscribeFromPush = async () => {
  if (Capacitor.isNativePlatform()) {
    const Push = await loadCapacitorPush();
    if (Push) {
      // En Capacitor no hay unregister directo, pero podemos deshabilitar en el servidor
      const subscriptions = await getUserSubscriptions();
      for (const sub of subscriptions) {
        if (sub.deviceType === Capacitor.getPlatform()) {
          await api.delete('/push/unsubscribe', {
            data: { endpoint: sub.endpoint },
          });
        }
      }
    }
    return true;
  } else {
    return await unsubscribeFromWebPush();
  }
};

export default {
  // Utilidades
  isPushSupported,
  isNativePlatform,
  getPermissionStatus,

  // Web Push
  getVapidPublicKey,
  requestNotificationPermission,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  isSubscribed,
  getCurrentSubscription,

  // API
  getUserSubscriptions,
  sendTestPush,
  sendPushToUser,

  // Capacitor
  registerCapacitorPush,
  setupCapacitorPushListeners,
  removeCapacitorPushListeners,

  // Unified
  subscribeToPush,
  unsubscribeFromPush,
};
