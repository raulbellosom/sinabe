/**
 * Controlador de Push Subscriptions
 * Maneja suscripciones Web Push y Capacitor Push
 */
import { db } from "../lib/db.js";
import {
  getVapidPublicKey,
  generateVapidKeys,
  sendDirectPush,
} from "../notifications/channels/pushChannel.js";

/**
 * GET /api/push/vapid-public-key
 * Obtiene la clave pública VAPID para el cliente
 */
export const getPublicKey = async (req, res) => {
  try {
    const publicKey = getVapidPublicKey();

    if (!publicKey) {
      return res.status(503).json({
        error: "Push notifications no están configuradas en el servidor",
      });
    }

    res.json({ publicKey });
  } catch (error) {
    console.error("[PushController] Error obteniendo VAPID key:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/push/subscribe
 * Registra una nueva suscripción push
 */
export const subscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription, deviceType = "web" } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Suscripción inválida" });
    }

    // Verificar si ya existe una suscripción con este endpoint
    const existing = await db.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Actualizar suscripción existente
      const updated = await db.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId,
          keys: subscription.keys,
          deviceType,
          enabled: true,
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: "Suscripción actualizada",
        subscription: {
          id: updated.id,
          deviceType: updated.deviceType,
          enabled: updated.enabled,
        },
      });
    }

    // Crear nueva suscripción
    const newSubscription = await db.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        deviceType,
        enabled: true,
      },
    });

    res.status(201).json({
      message: "Suscripción registrada exitosamente",
      subscription: {
        id: newSubscription.id,
        deviceType: newSubscription.deviceType,
        enabled: newSubscription.enabled,
      },
    });
  } catch (error) {
    console.error("[PushController] Error registrando suscripción:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/push/unsubscribe
 * Elimina o deshabilita una suscripción push
 */
export const unsubscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint requerido" });
    }

    const subscription = await db.pushSubscription.findFirst({
      where: {
        userId,
        endpoint,
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: "Suscripción no encontrada" });
    }

    // Deshabilitar en lugar de eliminar para mantener historial
    await db.pushSubscription.update({
      where: { id: subscription.id },
      data: { enabled: false },
    });

    res.json({ message: "Suscripción cancelada exitosamente" });
  } catch (error) {
    console.error("[PushController] Error cancelando suscripción:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/push/subscriptions
 * Obtiene las suscripciones del usuario actual
 */
export const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        deviceType: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error("[PushController] Error obteniendo suscripciones:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/push/test
 * Envía una notificación push de prueba al usuario actual
 */
export const sendTestPush = async (req, res) => {
  try {
    const userId = req.user.id;

    const results = await sendDirectPush(userId, {
      title: "🔔 Notificación de Prueba",
      body: "¡Las notificaciones push están funcionando correctamente!",
      icon: "/icons/icon-192x192.png",
      url: "/notifications",
      tag: `test-${Date.now()}`,
    });

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    res.json({
      message:
        successCount > 0
          ? "Notificación de prueba enviada"
          : "No se pudo enviar la notificación",
      results: {
        total: results.length,
        success: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("[PushController] Error enviando push de prueba:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/push/send (Admin)
 * Envía una notificación push a un usuario específico
 */
export const sendPushToUser = async (req, res) => {
  try {
    const { userId, title, body, url, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: "userId, title y body son requeridos",
      });
    }

    const results = await sendDirectPush(userId, {
      title,
      body,
      url,
      data,
    });

    const successCount = results.filter((r) => r.success).length;

    res.json({
      message:
        successCount > 0
          ? "Notificación enviada"
          : "No se pudo enviar la notificación",
      results,
    });
  } catch (error) {
    console.error("[PushController] Error enviando push:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/push/generate-vapid-keys (Setup)
 * Genera un nuevo par de claves VAPID (solo para configuración inicial)
 */
export const generateKeys = async (req, res) => {
  try {
    const keys = generateVapidKeys();

    res.json({
      message: "Claves VAPID generadas. Agrégalas a tu archivo .env",
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      envExample: `VAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\nVAPID_SUBJECT=mailto:admin@sinabe.com`,
    });
  } catch (error) {
    console.error("[PushController] Error generando claves:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getPublicKey,
  subscribe,
  unsubscribe,
  getSubscriptions,
  sendTestPush,
  sendPushToUser,
  generateKeys,
};
