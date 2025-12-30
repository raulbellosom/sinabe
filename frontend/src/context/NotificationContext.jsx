/**
 * Context para el sistema de notificaciones
 * Maneja el estado global de notificaciones in-app y reglas
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuthContext } from './AuthContext';
import notificationsApi from '../services/notifications.api';

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications debe usarse dentro de un NotificationProvider',
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuthContext();

  // Estado de notificaciones in-app
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Estado de reglas de notificación
  const [rules, setRules] = useState([]);
  const [ruleTypes, setRuleTypes] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  // Polling interval para actualizar notificaciones (cada 30 segundos)
  const POLLING_INTERVAL = 30000;

  /**
   * Obtener notificaciones del usuario
   */
  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!user || !token) return;

      try {
        setNotificationsLoading(true);
        const data = await notificationsApi.getMyNotifications(options);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        return data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    },
    [user, token],
  );

  /**
   * Obtener solo el conteo de no leídas (más ligero)
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!user || !token) return;

    try {
      const data = await notificationsApi.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user, token]);

  /**
   * Marcar una notificación como leída
   */
  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date() } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  };

  /**
   * Eliminar una notificación
   */
  const deleteNotification = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      const notification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  /**
   * Eliminar todas las leídas
   */
  const deleteReadNotifications = async () => {
    try {
      await notificationsApi.deleteReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  };

  // ============================================
  // REGLAS DE NOTIFICACIÓN
  // ============================================

  /**
   * Obtener todas las reglas
   */
  const fetchRules = useCallback(async () => {
    if (!user || !token) return;

    try {
      setRulesLoading(true);
      const data = await notificationsApi.getNotificationRules();
      setRules(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setRulesLoading(false);
    }
  }, [user, token]);

  /**
   * Obtener tipos de regla disponibles
   */
  const fetchRuleTypes = useCallback(async () => {
    if (!user || !token) return;

    try {
      const data = await notificationsApi.getRuleTypes();
      setRuleTypes(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching rule types:', error);
    }
  }, [user, token]);

  /**
   * Crear una nueva regla
   */
  const createRule = async (data) => {
    try {
      const rule = await notificationsApi.createNotificationRule(data);
      setRules((prev) => [rule, ...prev]);
      return rule;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  };

  /**
   * Actualizar una regla
   */
  const updateRule = async (id, data) => {
    try {
      const rule = await notificationsApi.updateNotificationRule(id, data);
      setRules((prev) => prev.map((r) => (r.id === id ? rule : r)));
      return rule;
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  };

  /**
   * Eliminar una regla
   */
  const deleteRule = async (id, permanent = false) => {
    try {
      await notificationsApi.deleteNotificationRule(id, permanent);
      if (permanent) {
        setRules((prev) => prev.filter((r) => r.id !== id));
      } else {
        setRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, enabled: false } : r)),
        );
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  };

  /**
   * Desuscribirse de una regla de notificación
   */
  const unsubscribeFromRule = async (id) => {
    try {
      const result = await notificationsApi.unsubscribeFromRule(id);
      // Actualizar la regla en el estado local para reflejar el cambio
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                _meta: {
                  ...r._meta,
                  isRecipient: false,
                  canUnsubscribe: false,
                },
              }
            : r,
        ),
      );
      return result;
    } catch (error) {
      console.error('Error unsubscribing from rule:', error);
      throw error;
    }
  };

  /**
   * Ejecutar test-run de una regla
   */
  const testRunRule = async (id, sendNotifications = false) => {
    try {
      return await notificationsApi.testRunRule(id, sendNotifications);
    } catch (error) {
      console.error('Error running test:', error);
      throw error;
    }
  };

  /**
   * Obtener historial de una regla
   */
  const getRuleHistory = async (id, limit = 20) => {
    try {
      return await notificationsApi.getRuleHistory(id, limit);
    } catch (error) {
      console.error('Error fetching rule history:', error);
      throw error;
    }
  };

  /**
   * Obtener usuarios disponibles como destinatarios
   */
  const getAvailableRecipients = async () => {
    try {
      return await notificationsApi.getAvailableRecipients();
    } catch (error) {
      console.error('Error fetching recipients:', error);
      throw error;
    }
  };

  /**
   * Obtener campos de inventario disponibles para filtros dinámicos
   */
  const getInventoryFields = async () => {
    try {
      return await notificationsApi.getInventoryFields();
    } catch (error) {
      console.error('Error fetching inventory fields:', error);
      throw error;
    }
  };

  /**
   * Obtener condiciones disponibles del catálogo
   */
  const getConditions = async () => {
    try {
      return await notificationsApi.getConditions();
    } catch (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
  };

  // Cargar datos iniciales y configurar polling
  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();
      fetchRuleTypes();

      // Polling para actualizar el contador de no leídas
      const interval = setInterval(fetchUnreadCount, POLLING_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [user, token, fetchUnreadCount, fetchRuleTypes]);

  return (
    <NotificationContext.Provider
      value={{
        // Notificaciones in-app
        notifications,
        unreadCount,
        notificationsLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteReadNotifications,

        // Reglas de notificación
        rules,
        ruleTypes,
        rulesLoading,
        fetchRules,
        fetchRuleTypes,
        createRule,
        updateRule,
        deleteRule,
        unsubscribeFromRule,
        testRunRule,
        getRuleHistory,
        getAvailableRecipients,
        getInventoryFields,
        getConditions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
