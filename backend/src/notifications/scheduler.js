/**
 * Scheduler de Notificaciones
 * Gestiona la ejecución periódica de las reglas de notificación
 */
import cron from "node-cron";
import { CronExpressionParser } from "cron-parser";
import { db } from "../lib/db.js";
import { executeRule } from "./engine.js";
import { createDirectNotification } from "./channels/inAppChannel.js";

let schedulerJob = null;
let dailyJob = null;
let weeklyJob = null;
let isProcessing = false; // Flag para evitar ejecuciones concurrentes

/**
 * Inicia el scheduler que revisa las reglas pendientes
 * Se ejecuta cada minuto para verificar qué reglas deben correr
 */
export const startScheduler = () => {
  if (schedulerJob) {
    console.log("[Scheduler] Ya está corriendo");
    return;
  }

  console.log("[Scheduler] ============================================");
  console.log("[Scheduler] Iniciando scheduler de notificaciones...");
  console.log(
    "[Scheduler] Hora actual del servidor:",
    new Date().toISOString(),
  );
  console.log(
    "[Scheduler] Timezone:",
    process.env.NOTIFY_TIMEZONE || "America/Mexico_City",
  );
  console.log("[Scheduler] ============================================");

  // Ejecutar inmediatamente al iniciar para procesar reglas pendientes
  setTimeout(async () => {
    console.log("[Scheduler] Ejecutando verificación inicial...");
    try {
      await processScheduledRules();
    } catch (error) {
      console.error("[Scheduler] Error en verificación inicial:", error);
    }
  }, 5000); // Esperar 5 segundos para que el servidor esté listo

  // Corre cada minuto
  schedulerJob = cron.schedule("* * * * *", async () => {
    console.log(`[Scheduler] Tick: ${new Date().toISOString()}`);
    try {
      await processScheduledRules();
    } catch (error) {
      console.error("[Scheduler] Error procesando reglas:", error);
    }
  });

  // Corre diariamente a las 8:00 AM para recordatorios de eventos
  dailyJob = cron.schedule("0 8 * * *", async () => {
    console.log(
      `[Scheduler] Ejecutando recordatorios diarios: ${new Date().toISOString()}`,
    );
    try {
      await processEventReminders();
    } catch (error) {
      console.error("[Scheduler] Error procesando recordatorios:", error);
    }
  });

  // Corre los Lunes a las 8:00 AM para resumen semanal
  weeklyJob = cron.schedule("0 8 * * 1", async () => {
    console.log(
      `[Scheduler] Ejecutando resumen semanal: ${new Date().toISOString()}`,
    );
    try {
      await processWeeklySummary();
    } catch (error) {
      console.error("[Scheduler] Error procesando resumen semanal:", error);
    }
  });

  console.log("[Scheduler] Scheduler iniciado correctamente");
};

/**
 * Detiene el scheduler
 */
export const stopScheduler = () => {
  if (schedulerJob) {
    schedulerJob.stop();
    schedulerJob = null;
    console.log("[Scheduler] Scheduler detenido");
  }
  if (dailyJob) {
    dailyJob.stop();
    dailyJob = null;
    console.log("[Scheduler] Daily Job detenido");
  }
  if (weeklyJob) {
    weeklyJob.stop();
    weeklyJob = null;
    console.log("[Scheduler] Weekly Job detenido");
  }
};

/**
 * Procesa recordatorios de eventos (Hoy y en 7 días)
 */
const processEventReminders = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  const nextWeekStart = new Date(todayStart);
  nextWeekStart.setDate(todayStart.getDate() + 7);
  const nextWeekEnd = new Date(todayEnd);
  nextWeekEnd.setDate(todayEnd.getDate() + 7);

  console.log("[Scheduler] Buscando eventos para recordatorios...");

  try {
    // Buscar eventos para hoy y para dentro de 7 días
    const events = await db.event.findMany({
      where: {
        status: "SCHEDULED",
        OR: [
          {
            scheduledDate: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
          {
            scheduledDate: {
              gte: nextWeekStart,
              lte: nextWeekEnd,
            },
          },
        ],
      },
      include: {
        attendees: true,
      },
    });

    console.log(
      `[Scheduler] Encontrados ${events.length} eventos para recordar.`,
    );

    for (const event of events) {
      const isToday = new Date(event.scheduledDate).getDate() === now.getDate();
      const timeMsg = isToday ? "HOY" : "en 7 días";
      const title = isToday
        ? "¡Recordatorio de Evento para HOY!"
        : "Recordatorio: Evento Próximo";

      const dateStr = new Date(event.scheduledDate).toLocaleString("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
      });

      const body = `El evento "${event.title}" está programado para ${timeMsg} (${dateStr}).`;
      const link = `/agenda?date=${
        new Date(event.scheduledDate).toISOString().split("T")[0]
      }`;

      // Determinar destinatarios
      const recipients = new Set(event.attendees.map((a) => a.userId));

      // Si es HOY, agregar al creador si no está incluido
      if (isToday && event.createdById) {
        recipients.add(event.createdById);
      }

      // Notificar a los destinatarios únicos
      for (const userId of recipients) {
        await createDirectNotification({
          userId,
          title,
          body,
          link,
          creatorId: null, // Sistema
        });
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error en processEventReminders:", error);
  }
};

/**
 * Procesa el resumen semanal (Lunes 8 AM)
 */
const processWeeklySummary = async () => {
  console.log("[Scheduler] Generando resumen semanal...");
  const now = new Date();

  // Asumimos que hoy es Lunes si esto corre por cron "0 8 * * 1"
  // Calculamos rango de la semana (Lunes 00:00 a Domingo 23:59)
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const events = await db.event.findMany({
      where: {
        status: "SCHEDULED",
        scheduledDate: { gte: startOfWeek, lte: endOfWeek },
      },
      include: { attendees: true },
    });

    if (events.length === 0) {
      console.log("[Scheduler] No hay eventos para esta semana.");
      return;
    }

    // Mapa de Usuario -> Cantidad de Eventos
    const userEventsMap = {};

    events.forEach((event) => {
      const usersToNotify = new Set(event.attendees.map((a) => a.userId));
      // El creador también debe saber de sus eventos
      if (event.createdById) usersToNotify.add(event.createdById);

      usersToNotify.forEach((uid) => {
        if (!userEventsMap[uid]) userEventsMap[uid] = 0;
        userEventsMap[uid]++;
      });
    });

    console.log(
      `[Scheduler] Enviando resumen semanal a ${Object.keys(userEventsMap).length} usuarios.`,
    );

    for (const [userIdStr, count] of Object.entries(userEventsMap)) {
      const userId = parseInt(userIdStr);
      await createDirectNotification({
        userId,
        title: "Resumen Semanal de Eventos",
        body: `Tienes ${count} elemento(s) programado(s) para esta semana. Revisa tu agenda.`,
        link: "/agenda",
        creatorId: null,
      });
    }
  } catch (error) {
    console.error("[Scheduler] Error en processWeeklySummary:", error);
  }
};

/**
 * Procesa las reglas que ya deben ejecutarse
 */
const processScheduledRules = async () => {
  // Evitar ejecuciones concurrentes
  if (isProcessing) {
    console.log("[Scheduler] Ya hay un proceso en ejecución, omitiendo...");
    return;
  }

  isProcessing = true;
  const now = new Date();

  try {
    // DEBUG: Primero veamos todas las reglas habilitadas
    const allEnabledRules = await db.notificationRule.findMany({
      where: { enabled: true },
      select: {
        id: true,
        name: true,
        nextRunAt: true,
        lastRunAt: true,
        scheduleType: true,
        intervalMinutes: true,
        cronExpression: true,
      },
    });

    console.log(
      `[Scheduler] Reglas habilitadas: ${
        allEnabledRules.length
      }, Hora: ${now.toISOString()}`,
    );
    allEnabledRules.forEach((r) => {
      const nextRunStr = r.nextRunAt ? r.nextRunAt.toISOString() : "null";
      const shouldRun = !r.nextRunAt || r.nextRunAt <= now;
      console.log(
        `[Scheduler]   - "${r.name}": nextRunAt=${nextRunStr}, shouldRun=${shouldRun}`,
      );
    });

    // Buscar reglas habilitadas cuyo nextRunAt <= ahora
    const rulesToRun = await db.notificationRule.findMany({
      where: {
        enabled: true,
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null }, // Primera ejecución
        ],
      },
      include: {
        channels: true,
        recipients: true,
      },
    });

    if (rulesToRun.length === 0) {
      console.log(`[Scheduler] Sin reglas pendientes para ejecutar`);
      return;
    }

    console.log(
      `[Scheduler] ========== Procesando ${rulesToRun.length} regla(s) ==========`,
    );

    for (const rule of rulesToRun) {
      try {
        console.log(`[Scheduler] → Ejecutando: "${rule.name}" (${rule.id})`);
        console.log(
          `[Scheduler]   Tipo: ${rule.scheduleType}, CRON: ${
            rule.cronExpression || "N/A"
          }, Intervalo: ${rule.intervalMinutes || "N/A"} min`,
        );
        console.log(
          `[Scheduler]   nextRunAt anterior: ${
            rule.nextRunAt?.toISOString() || "null"
          }`,
        );

        // Lock: Calcular y actualizar nextRunAt ANTES de ejecutar para evitar duplicados
        const nextRunAt = calculateNextRun(rule);

        console.log(
          `[Scheduler]   nextRunAt nuevo: ${nextRunAt?.toISOString() || "null"}`,
        );

        await db.notificationRule.update({
          where: { id: rule.id },
          data: {
            nextRunAt,
            lastRunAt: now,
          },
        });

        // Ejecutar la regla
        await executeRule(rule);

        console.log(
          `[Scheduler] ✓ Regla "${rule.name}" ejecutada correctamente`,
        );
      } catch (error) {
        console.error(
          `[Scheduler] ✗ Error ejecutando regla ${rule.id}:`,
          error,
        );
      }
    }

    console.log(`[Scheduler] ========== Fin de procesamiento ==========`);
  } catch (error) {
    console.error("[Scheduler] Error en processScheduledRules:", error);
  } finally {
    isProcessing = false;
  }
};

/**
 * Calcula la próxima fecha de ejecución de una regla
 */
export const calculateNextRun = (rule) => {
  const now = new Date();

  if (rule.scheduleType === "INTERVAL" && rule.intervalMinutes) {
    return new Date(now.getTime() + rule.intervalMinutes * 60 * 1000);
  }

  // Para CRON, calculamos la próxima ejecución usando cron-parser
  if (rule.scheduleType === "CRON" && rule.cronExpression) {
    try {
      const interval = CronExpressionParser.parse(rule.cronExpression, {
        currentDate: now,
        tz: process.env.NOTIFY_TIMEZONE || "America/Mexico_City",
      });
      const nextDate = interval.next().toDate();
      console.log(
        `[Scheduler] Próxima ejecución para CRON "${
          rule.cronExpression
        }": ${nextDate.toISOString()}`,
      );
      return nextDate;
    } catch (error) {
      console.error(
        `[Scheduler] Error parseando expresión CRON "${rule.cronExpression}":`,
        error.message,
      );
      // Fallback: 1 hora si la expresión CRON es inválida
      return new Date(now.getTime() + 60 * 60 * 1000);
    }
  }

  // Default: 1 hora
  return new Date(now.getTime() + 60 * 60 * 1000);
};

/**
 * Ejecuta una regla manualmente (para test-run)
 */
export const runRuleNow = async (ruleId) => {
  const rule = await db.notificationRule.findUnique({
    where: { id: ruleId },
    include: {
      channels: true,
      recipients: true,
    },
  });

  if (!rule) {
    throw new Error("Regla no encontrada");
  }

  return await executeRule(rule);
};
