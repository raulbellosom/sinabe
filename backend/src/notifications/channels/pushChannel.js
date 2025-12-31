/**
 * Canal Push para Notificaciones
 * Soporta Web Push (Chrome/PWA) y Push Móvil (FCM/Capacitor)
 */
import webpush from "web-push";
import { db } from "../../lib/db.js";

// Configurar VAPID keys para Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@sinabe.com";

// Inicializar web-push si las keys están configuradas
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log("[PushChannel] VAPID configurado correctamente");
} else {
  console.warn(
    "[PushChannel] VAPID keys no configuradas. Push notifications deshabilitadas."
  );
}

/**
 * Obtiene la clave pública VAPID para el cliente
 */
export const getVapidPublicKey = () => {
  return VAPID_PUBLIC_KEY;
};

/**
 * Genera un par de claves VAPID (solo para setup inicial)
 */
export const generateVapidKeys = () => {
  return webpush.generateVAPIDKeys();
};

/**
 * Envía notificaciones push a los destinatarios configurados
 */
export const sendPushNotification = async (
  rule,
  run,
  matches,
  summary,
  channelType = "PUSH_WEB"
) => {
  const deliveries = [];

  // Verificar que VAPID esté configurado
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn(
      `[PushChannel] No se pueden enviar push: VAPID no configurado`
    );
    return deliveries;
  }

  // Filtrar solo destinatarios tipo USER
  const userRecipients = rule.recipients.filter(
    (r) => r.kind === "USER" && r.userId
  );

  if (userRecipients.length === 0) {
    console.log(`[PushChannel] Regla ${rule.id}: Sin usuarios para notificar`);
    return deliveries;
  }

  // Generar contenido de la notificación
  const { title, body, icon, badge, url, tag } = generatePushContent(
    rule,
    matches,
    summary
  );

  // Payload de la notificación
  const payload = JSON.stringify({
    title,
    body,
    icon: icon || "/icons/icon-192x192.png",
    badge: badge || "/icons/badge-72x72.png",
    url: url || "/notifications",
    tag: tag || `rule-${rule.id}`,
    timestamp: Date.now(),
    ruleId: rule.id,
    ruleRunId: run.id,
    data: {
      type: rule.ruleType,
      matchCount: matches.length,
    },
  });

  for (const recipient of userRecipients) {
    // Obtener todas las suscripciones del usuario
    const deviceFilter =
      channelType === "PUSH_WEB"
        ? { deviceType: { in: ["web", null] } }
        : { deviceType: { in: ["android", "ios"] } };

    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId: recipient.userId,
        enabled: true,
        ...deviceFilter,
      },
    });

    if (subscriptions.length === 0) {
      console.log(
        `[PushChannel] Usuario ${recipient.userId}: Sin suscripciones push activas`
      );
      continue;
    }

    for (const subscription of subscriptions) {
      // Crear registro de delivery
      const delivery = await db.notificationDelivery.create({
        data: {
          ruleRunId: run.id,
          channel: channelType,
          recipientId: recipient.userId,
          status: "PENDING",
        },
      });

      try {
        // Construir objeto de suscripción para web-push
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        };

        // Enviar la notificación
        await webpush.sendNotification(pushSubscription, payload);

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
          `[PushChannel] Push enviado a usuario ${recipient.userId} (${
            subscription.deviceType || "web"
          })`
        );
      } catch (error) {
        console.error(`[PushChannel] Error enviando push:`, error);

        // Si la suscripción expiró o es inválida, deshabilitarla
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.pushSubscription.update({
            where: { id: subscription.id },
            data: { enabled: false },
          });
          console.log(
            `[PushChannel] Suscripción ${subscription.id} deshabilitada (expirada)`
          );
        }

        await db.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "FAILED",
            errorMsg: error.message,
            attempts: 1,
          },
        });

        deliveries.push({
          ...delivery,
          status: "FAILED",
          error: error.message,
        });
      }
    }
  }

  return deliveries;
};

/**
 * Envía una notificación push directa a un usuario (sin regla)
 */
export const sendDirectPush = async (userId, notification) => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error("VAPID no configurado");
  }

  const subscriptions = await db.pushSubscription.findMany({
    where: {
      userId,
      enabled: true,
    },
  });

  if (subscriptions.length === 0) {
    throw new Error("El usuario no tiene suscripciones push activas");
  }

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || "/icons/icon-192x192.png",
    badge: notification.badge || "/icons/badge-72x72.png",
    url: notification.url || "/",
    tag: notification.tag || `direct-${Date.now()}`,
    timestamp: Date.now(),
    data: notification.data || {},
  });

  const results = [];

  for (const subscription of subscriptions) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      };

      await webpush.sendNotification(pushSubscription, payload);
      results.push({ subscriptionId: subscription.id, success: true });
    } catch (error) {
      // Deshabilitar suscripciones inválidas
      if (error.statusCode === 410 || error.statusCode === 404) {
        await db.pushSubscription.update({
          where: { id: subscription.id },
          data: { enabled: false },
        });
      }
      results.push({
        subscriptionId: subscription.id,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Genera el contenido de la notificación push según el tipo de regla
 */
const generatePushContent = (rule, matches, summary) => {
  const baseContent = {
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: `sinabe-${rule.ruleType}-${rule.id}`,
  };

  switch (rule.ruleType) {
    case "INCOMPLETE_INVENTORY":
      return {
        ...baseContent,
        title: "⚠️ Inventario Incompleto",
        body:
          summary ||
          `${matches.length} equipo(s) con información faltante requieren atención`,
        url: "/inventory?filter=incomplete",
      };

    case "DEADLINE_REMINDER":
      return {
        ...baseContent,
        title: "⏰ Recordatorio de Fecha Límite",
        body: summary || `${matches.length} fecha(s) límite próxima(s)`,
        url: "/projects",
      };

    case "LOW_STOCK_ALERT":
      return {
        ...baseContent,
        title: "📦 Alerta de Stock Bajo",
        body: summary || `${matches.length} producto(s) con stock bajo`,
        url: "/inventory?filter=lowStock",
      };

    case "CUSTODY_PENDING":
      return {
        ...baseContent,
        title: "📋 Resguardos Pendientes",
        body: summary || `${matches.length} resguardo(s) pendiente(s) de firma`,
        url: "/custody",
      };

    default:
      return {
        ...baseContent,
        title: `🔔 ${rule.name}`,
        body: summary || `${matches.length} elemento(s) encontrado(s)`,
        url: "/notifications",
      };
  }
};

export default {
  getVapidPublicKey,
  generateVapidKeys,
  sendPushNotification,
  sendDirectPush,
};
