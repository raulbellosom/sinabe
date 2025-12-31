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

/**
 * Obtener estado de lectura de una notificación específica
 * Solo el dueño de la regla que generó la notificación puede ver esto
 */
export const getNotificationReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Obtener la notificación
    const notification = await db.inAppNotification.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        ruleRunId: true,
        ruleCreatorId: true,
        createdAt: true,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    // Verificar que el usuario es el creador de la regla
    if (notification.ruleCreatorId !== currentUserId) {
      return res.status(403).json({
        error: "Solo el creador de la regla puede ver el estado de lectura",
      });
    }

    // Si no hay ruleRunId, no hay otras notificaciones relacionadas
    if (!notification.ruleRunId) {
      return res.json({
        title: notification.title,
        createdAt: notification.createdAt,
        summary: {
          totalRecipients: 1,
          totalRead: 0,
          totalUnread: 1,
          readPercentage: 0,
        },
        recipients: [],
      });
    }

    // Obtener todas las notificaciones de la misma ejecución (ruleRunId)
    const allNotifications = await db.inAppNotification.findMany({
      where: { ruleRunId: notification.ruleRunId },
      select: {
        id: true,
        userId: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    // Obtener información de los usuarios
    const userIds = [...new Set(allNotifications.map((n) => n.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        photo: {
          where: { enabled: true },
          select: { thumbnail: true, url: true },
          take: 1,
        },
      },
    });

    // Crear mapa de usuarios
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photoUrl: user.photo?.[0]?.thumbnail || user.photo?.[0]?.url || null,
      };
      return acc;
    }, {});

    // Preparar lista de destinatarios con estado de lectura
    const recipients = allNotifications.map((n) => ({
      notificationId: n.id,
      user: userMap[n.viserId] ||
        userMap[n.userId] || {
          id: n.userId,
          firstName: "Usuario",
          lastName: "Desconocido",
        },
      isRead: n.isRead,
      readAt: n.readAt,
      createdAt: n.createdAt,
    }));

    // Calcular resumen
    const totalRecipients = recipients.length;
    const totalRead = recipients.filter((r) => r.isRead).length;
    const totalUnread = totalRecipients - totalRead;

    res.json({
      title: notification.title,
      createdAt: notification.createdAt,
      summary: {
        totalRecipients,
        totalRead,
        totalUnread,
        readPercentage:
          totalRecipients > 0
            ? Math.round((totalRead / totalRecipients) * 100)
            : 0,
      },
      recipients: recipients.sort((a, b) => {
        // Ordenar: leídas primero, luego por fecha de lectura
        if (a.isRead && !b.isRead) return -1;
        if (!a.isRead && b.isRead) return 1;
        if (a.readAt && b.readAt)
          return new Date(b.readAt) - new Date(a.readAt);
        return 0;
      }),
    });
  } catch (error) {
    console.error("Error obteniendo estado de lectura:", error);
    res.status(500).json({ error: "Error al obtener el estado de lectura" });
  }
};
