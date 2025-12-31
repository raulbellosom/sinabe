/**
 * Hook personalizado para manejar Push Notifications
 * Soporta Web Push (PWA/Chrome) y Capacitor (Android/iOS)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  isPushSupported,
  isNativePlatform,
  getPermissionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed as checkIsSubscribed,
  getUserSubscriptions,
  sendTestPush,
  setupCapacitorPushListeners,
  removeCapacitorPushListeners,
} from '../services/push.service';

/**
 * Estados posibles del permiso
 */
export const PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  DEFAULT: 'default',
  UNSUPPORTED: 'unsupported',
};

/**
 * Hook para manejar notificaciones push
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.onNotificationReceived - Callback cuando llega una notificación (Capacitor)
 * @param {Function} options.onNotificationTapped - Callback cuando se toca una notificación (Capacitor)
 * @param {boolean} options.autoSubscribe - Auto suscribirse al montar (default: false)
 */
export const usePushNotifications = (options = {}) => {
  const {
    onNotificationReceived,
    onNotificationTapped,
    autoSubscribe = false,
  } = options;

  // Estados
  const [isSupported, setIsSupported] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [permission, setPermission] = useState(PERMISSION_STATUS.DEFAULT);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs para evitar múltiples inicializaciones
  const initialized = useRef(false);
  const listenersSetup = useRef(false);

  /**
   * Verifica el estado inicial
   */
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar soporte
      const supported = isPushSupported();
      const native = isNativePlatform();
      setIsSupported(supported);
      setIsNative(native);

      if (!supported) {
        setPermission(PERMISSION_STATUS.UNSUPPORTED);
        setLoading(false);
        return;
      }

      // Verificar permiso
      const permStatus = await getPermissionStatus();
      setPermission(permStatus);

      // Verificar suscripción actual (solo web)
      if (!native && permStatus === PERMISSION_STATUS.GRANTED) {
        const subscribed = await checkIsSubscribed();
        setIsSubscribed(subscribed);
      }

      // Obtener suscripciones del servidor
      try {
        const subs = await getUserSubscriptions();
        setSubscriptions(subs);

        // Si hay suscripciones activas, marcar como suscrito
        if (subs.some((s) => s.enabled)) {
          setIsSubscribed(true);
        }
      } catch (e) {
        // Ignorar error si no está autenticado
        console.log('No se pudieron obtener suscripciones:', e.message);
      }
    } catch (err) {
      console.error('Error verificando estado de push:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Suscribirse a notificaciones push
   */
  const subscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await subscribeToPush();
      setIsSubscribed(true);
      setPermission(PERMISSION_STATUS.GRANTED);

      // Actualizar lista de suscripciones
      const subs = await getUserSubscriptions();
      setSubscriptions(subs);

      return result;
    } catch (err) {
      console.error('Error suscribiendo a push:', err);
      setError(err.message);

      // Actualizar estado del permiso si fue denegado
      if (err.message.includes('denegado') || err.message.includes('denied')) {
        setPermission(PERMISSION_STATUS.DENIED);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar suscripción
   */
  const unsubscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await unsubscribeFromPush();
      setIsSubscribed(false);

      // Actualizar lista de suscripciones
      const subs = await getUserSubscriptions();
      setSubscriptions(subs);

      return true;
    } catch (err) {
      console.error('Error cancelando suscripción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enviar notificación de prueba
   */
  const testNotification = useCallback(async () => {
    try {
      setError(null);
      const result = await sendTestPush();
      return result;
    } catch (err) {
      console.error('Error enviando notificación de prueba:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Refrescar estado
   */
  const refresh = useCallback(async () => {
    await checkStatus();
  }, [checkStatus]);

  // Efecto: Inicialización
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    checkStatus();
  }, [checkStatus]);

  // Efecto: Auto suscripción
  useEffect(() => {
    if (!autoSubscribe || loading || !isSupported || isSubscribed) return;
    if (permission === PERMISSION_STATUS.GRANTED) {
      subscribe().catch(() => {}); // Ignorar errores en auto-subscribe
    }
  }, [
    autoSubscribe,
    loading,
    isSupported,
    isSubscribed,
    permission,
    subscribe,
  ]);

  // Efecto: Setup listeners de Capacitor
  useEffect(() => {
    if (!isNative || listenersSetup.current) return;
    listenersSetup.current = true;

    setupCapacitorPushListeners({
      onNotificationReceived: (notification) => {
        console.log(
          '[usePushNotifications] Notification received:',
          notification,
        );
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      },
      onNotificationTapped: (notification, actionId) => {
        console.log(
          '[usePushNotifications] Notification tapped:',
          notification,
          actionId,
        );
        if (onNotificationTapped) {
          onNotificationTapped(notification, actionId);
        }
      },
      onError: (error) => {
        console.error('[usePushNotifications] Push error:', error);
        setError(error.message || 'Error de push');
      },
    });

    return () => {
      removeCapacitorPushListeners();
      listenersSetup.current = false;
    };
  }, [isNative, onNotificationReceived, onNotificationTapped]);

  return {
    // Estados
    isSupported,
    isNative,
    permission,
    isSubscribed,
    subscriptions,
    loading,
    error,

    // Acciones
    subscribe,
    unsubscribe,
    testNotification,
    refresh,

    // Utilidades
    canSubscribe: isSupported && permission !== PERMISSION_STATUS.DENIED,
    needsPermission: permission === PERMISSION_STATUS.DEFAULT,
    permissionDenied: permission === PERMISSION_STATUS.DENIED,
  };
};

export default usePushNotifications;
