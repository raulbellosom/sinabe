/**
 * Canal In-App para Notificaciones
 * Crea notificaciones en la bandeja del usuario dentro de la aplicación
 */
import { db } from "../../lib/db.js";

/**
 * Crea notificaciones in-app para los destinatarios configurados
 */
export const createInAppNotification = async (rule, run, matches, summary) => {
  const deliveries = [];

  // Filtrar solo destinatarios tipo USER (IN_APP no tiene sentido para emails externos)
  const userRecipients = rule.recipients.filter(
    (r) => r.kind === "USER" && r.userId,
  );

  if (userRecipients.length === 0) {
    console.log(
      `[InAppChannel] Regla ${rule.id}: Sin usuarios para notificar in-app`,
    );
    return deliveries;
  }

  // Generar contenido de la notificación
  const { title, body, link } = generateInAppContent(rule, matches, summary);

  for (const recipient of userRecipients) {
    // Crear registro de delivery
    const delivery = await db.notificationDelivery.create({
      data: {
        ruleRunId: run.id,
        channel: "IN_APP",
        recipientId: recipient.userId,
        status: "PENDING",
      },
    });

    try {
      // Crear la notificación in-app
      await db.inAppNotification.create({
        data: {
          userId: recipient.userId,
          title,
          body,
          link,
          ruleRunId: run.id,
          ruleCreatorId: rule.createdById, // Guardar quién creó la regla
        },
      });

      // Marcar delivery como enviado
      await db.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          attempts: 1,
        },
      });

      deliveries.push({ ...delivery, status: "SENT" });
      console.log(
        `[InAppChannel] Notificación creada para usuario ${recipient.userId}`,
      );
    } catch (error) {
      console.error(`[InAppChannel] Error creando notificación:`, error);

      await db.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "FAILED",
          errorMsg: error.message,
          attempts: 1,
        },
      });

      deliveries.push({ ...delivery, status: "FAILED", error: error.message });
    }
  }

  return deliveries;
};

/**
 * Genera el contenido de la notificación in-app
 */
const generateInAppContent = (rule, matches, summary) => {
  const title = rule.name;
  const body = `Se encontraron ${matches.length} elemento(s) que requieren tu atención.`;
  const link = summary.link || null;

  return { title, body, link };
};

/**
 * Obtiene las notificaciones in-app de un usuario
 */
export const getUserNotifications = async (userId, options = {}) => {
  const { onlyUnread = false, limit = 50, offset = 0 } = options;

  const where = {
    userId,
    ...(onlyUnread && { isRead: false }),
  };

  const [notifications, total] = await Promise.all([
    db.inAppNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        ruleCreator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    db.inAppNotification.count({ where }),
  ]);

  // Agregar flag para indicar si el usuario es el dueño de la regla
  const notificationsWithMeta = notifications.map((n) => ({
    ...n,
    isRuleOwner: n.ruleCreatorId === userId,
  }));

  return { notifications: notificationsWithMeta, total };
};

/**
 * Marca una notificación como leída
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await db.inAppNotification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new Error("Notificación no encontrada");
  }

  return await db.inAppNotification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export const markAllAsRead = async (userId) => {
  return await db.inAppNotification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Obtiene el conteo de notificaciones no leídas
 */
export const getUnreadCount = async (userId) => {
  return await db.inAppNotification.count({
    where: { userId, isRead: false },
  });
};

/**
 * Crea una notificación directa (para eventos, alertas manuales, etc.)
 */
export const createDirectNotification = async ({
  userId,
  title,
  body,
  link,
  creatorId,
}) => {
  try {
    const notification = await db.inAppNotification.create({
      data: {
        userId,
        title,
        body,
        link,
        // ruleRunId is optional, leave null
        ruleCreatorId: creatorId, // Optional: who triggered it
      },
    });
    console.log(
      `[InAppChannel] Direct notification created for user ${userId}`,
    );
    return notification;
  } catch (error) {
    console.error(`[InAppChannel] Error creating direct notification:`, error);
    // Don't throw to avoid blocking the main flow
  }
};
