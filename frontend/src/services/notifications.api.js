/**
 * API Service para el sistema de notificaciones
 */
import axios from 'axios';

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
// REGLAS DE NOTIFICACIÓN
// ============================================

/**
 * Obtener todas las reglas de notificación
 */
export const getNotificationRules = async () => {
  const response = await api.get('/notification-rules');
  return response.data;
};

/**
 * Obtener una regla por ID
 */
export const getNotificationRule = async (id) => {
  const response = await api.get(`/notification-rules/${id}`);
  return response.data;
};

/**
 * Crear una nueva regla
 */
export const createNotificationRule = async (data) => {
  const response = await api.post('/notification-rules', data);
  return response.data;
};

/**
 * Actualizar una regla
 */
export const updateNotificationRule = async (id, data) => {
  const response = await api.put(`/notification-rules/${id}`, data);
  return response.data;
};

/**
 * Eliminar una regla
 */
export const deleteNotificationRule = async (id, permanent = false) => {
  const response = await api.delete(
    `/notification-rules/${id}?permanent=${permanent}`,
  );
  return response.data;
};

/**
 * Ejecutar test-run de una regla
 */
export const testRunRule = async (id, sendNotifications = false) => {
  const response = await api.post(`/notification-rules/${id}/test-run`, {
    sendNotifications,
  });
  return response.data;
};

/**
 * Obtener historial de ejecuciones de una regla
 */
export const getRuleHistory = async (id, limit = 20) => {
  const response = await api.get(
    `/notification-rules/${id}/history?limit=${limit}`,
  );
  return response.data;
};

/**
 * Obtener tipos de regla disponibles
 */
export const getRuleTypes = async () => {
  const response = await api.get('/notification-rules/types');
  return response.data;
};

/**
 * Obtener campos de inventario disponibles para filtros dinámicos
 */
export const getInventoryFields = async () => {
  const response = await api.get('/notification-rules/inventory-fields');
  return response.data;
};

/**
 * Obtener condiciones disponibles del catálogo
 */
export const getConditions = async () => {
  const response = await api.get('/notification-rules/conditions');
  return response.data;
};

/**
 * Obtener usuarios disponibles como destinatarios
 */
export const getAvailableRecipients = async () => {
  const response = await api.get('/notification-rules/recipients');
  return response.data;
};

// ============================================
// NOTIFICACIONES IN-APP (BANDEJA)
// ============================================

/**
 * Obtener notificaciones del usuario actual
 */
export const getMyNotifications = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.onlyUnread) params.append('onlyUnread', 'true');
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);

  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data;
};

/**
 * Obtener conteo de notificaciones no leídas
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

/**
 * Marcar una notificación como leída
 */
export const markAsRead = async (id) => {
  const response = await api.post(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Eliminar todas las notificaciones leídas
 */
export const deleteReadNotifications = async () => {
  const response = await api.delete('/notifications/read');
  return response.data;
};

/**
 * Desuscribirse de una regla de notificación
 */
export const unsubscribeFromRule = async (ruleId) => {
  const response = await api.post(`/notification-rules/${ruleId}/unsubscribe`);
  return response.data;
};

export default {
  // Reglas
  getNotificationRules,
  getNotificationRule,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  testRunRule,
  getRuleHistory,
  getRuleTypes,
  getInventoryFields,
  getConditions,
  getAvailableRecipients,
  unsubscribeFromRule,
  // Notificaciones
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
};
