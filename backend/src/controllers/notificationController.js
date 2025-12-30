/**
 * Controlador de Notificaciones In-App
 * Gestiona la bandeja de notificaciones del usuario
 */
import { db } from "../lib/db.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../notifications/channels/inAppChannel.js";

/**
 * Obtener notificaciones del usuario actual
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { onlyUnread, limit = 50, offset = 0 } = req.query;

    const { notifications, total } = await getUserNotifications(userId, {
      onlyUnread: onlyUnread === "true",
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      notifications,
      total,
      unreadCount: await getUnreadCount(userId),
    });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    res.status(500).json({ error: "Error al obtener las notificaciones" });
  }
};

/**
 * Obtener conteo de notificaciones no leídas
 */
export const getMyUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error obteniendo conteo:", error);
    res.status(500).json({ error: "Error al obtener el conteo" });
  }
};

/**
 * Marcar una notificación como leída
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await markAsRead(id, userId);
    res.json(notification);
  } catch (error) {
    console.error("Error marcando notificación:", error);
    if (error.message === "Notificación no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al marcar la notificación" });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await markAllAsRead(userId);
    res.json({
      message: "Todas las notificaciones marcadas como leídas",
      count: result.count,
    });
  } catch (error) {
    console.error("Error marcando notificaciones:", error);
    res.status(500).json({ error: "Error al marcar las notificaciones" });
  }
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la notificación pertenece al usuario
    const notification = await db.inAppNotification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    await db.inAppNotification.delete({
      where: { id },
    });

    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    console.error("Error eliminando notificación:", error);
    res.status(500).json({ error: "Error al eliminar la notificación" });
  }
};

/**
 * Eliminar todas las notificaciones leídas del usuario
 */
export const deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.inAppNotification.deleteMany({
      where: { userId, isRead: true },
    });

    res.json({
      message: "Notificaciones leídas eliminadas",
      count: result.count,
    });
  } catch (error) {
    console.error("Error eliminando notificaciones:", error);
    res.status(500).json({ error: "Error al eliminar las notificaciones" });
  }
};
