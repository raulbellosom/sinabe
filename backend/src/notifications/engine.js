/**
 * Motor de Reglas de Notificación
 * Evalúa condiciones y genera notificaciones según el tipo de regla
 */
import { db } from "../lib/db.js";
import { sendNotificationEmail } from "./channels/emailChannel.js";
import { createInAppNotification } from "./channels/inAppChannel.js";
import { sendPushNotification } from "./channels/pushChannel.js";
import { evaluateRule } from "./ruleTypes/index.js";

/**
 * Ejecuta una regla completa: evalúa condiciones y envía notificaciones
 */
export const executeRule = async (rule) => {
  console.log(`[Engine] Ejecutando regla: ${rule.name} (${rule.id})`);

  // Crear registro de ejecución
  const run = await db.notificationRuleRun.create({
    data: {
      ruleId: rule.id,
      status: "RUNNING",
    },
  });

  try {
    // Evaluar la regla y obtener coincidencias
    const { matches, summary } = await evaluateRule(rule);

    const matchCount = matches.length;
    console.log(`[Engine] Regla ${rule.name}: ${matchCount} coincidencia(s)`);

    if (matchCount === 0) {
      // Sin coincidencias, marcar como éxito sin envíos
      await db.notificationRuleRun.update({
        where: { id: run.id },
        data: {
          status: "SUCCESS",
          finishedAt: new Date(),
          matchCount: 0,
          result: { message: "Sin coincidencias" },
        },
      });
      return { runId: run.id, matchCount: 0, deliveries: [] };
    }

    // Procesar cada canal habilitado
    const enabledChannels = rule.channels.filter((c) => c.enabled);
    const deliveries = [];

    for (const channel of enabledChannels) {
      try {
        const channelDeliveries = await processChannel(
          channel.channel,
          rule,
          run,
          matches,
          summary
        );
        deliveries.push(...channelDeliveries);
      } catch (error) {
        console.error(`[Engine] Error en canal ${channel.channel}:`, error);
      }
    }

    // Actualizar el run como completado
    const successCount = deliveries.filter((d) => d.status === "SENT").length;
    const failedCount = deliveries.filter((d) => d.status === "FAILED").length;

    await db.notificationRuleRun.update({
      where: { id: run.id },
      data: {
        status:
          failedCount === 0
            ? "SUCCESS"
            : successCount > 0
            ? "PARTIAL"
            : "FAILED",
        finishedAt: new Date(),
        matchCount,
        result: {
          summary,
          deliveriesCount: deliveries.length,
          successCount,
          failedCount,
        },
      },
    });

    return { runId: run.id, matchCount, deliveries };
  } catch (error) {
    console.error(`[Engine] Error ejecutando regla ${rule.id}:`, error);

    await db.notificationRuleRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        result: { error: error.message },
      },
    });

    throw error;
  }
};

/**
 * Procesa un canal específico
 */
const processChannel = async (channelType, rule, run, matches, summary) => {
  const deliveries = [];

  switch (channelType) {
    case "EMAIL":
      const emailDeliveries = await sendNotificationEmail(
        rule,
        run,
        matches,
        summary
      );
      deliveries.push(...emailDeliveries);
      break;

    case "IN_APP":
      const inAppDeliveries = await createInAppNotification(
        rule,
        run,
        matches,
        summary
      );
      deliveries.push(...inAppDeliveries);
      break;

    case "PUSH_WEB":
      const webPushDeliveries = await sendPushNotification(
        rule,
        run,
        matches,
        summary,
        "PUSH_WEB"
      );
      deliveries.push(...webPushDeliveries);
      break;

    case "PUSH_MOBILE":
      const mobilePushDeliveries = await sendPushNotification(
        rule,
        run,
        matches,
        summary,
        "PUSH_MOBILE"
      );
      deliveries.push(...mobilePushDeliveries);
      break;

    default:
      console.warn(`[Engine] Canal desconocido: ${channelType}`);
  }

  return deliveries;
};

/**
 * Obtiene el historial de ejecuciones de una regla
 */
export const getRuleRunHistory = async (ruleId, limit = 10) => {
  return await db.notificationRuleRun.findMany({
    where: { ruleId },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      deliveries: true,
    },
  });
};
