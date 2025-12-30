/**
 * Scheduler de Notificaciones
 * Gestiona la ejecución periódica de las reglas de notificación
 */
import cron from "node-cron";
import { CronExpressionParser } from "cron-parser";
import { db } from "../lib/db.js";
import { executeRule } from "./engine.js";

let schedulerJob = null;
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
    new Date().toISOString()
  );
  console.log(
    "[Scheduler] Timezone:",
    process.env.NOTIFY_TIMEZONE || "America/Mexico_City"
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
      }, Hora: ${now.toISOString()}`
    );
    allEnabledRules.forEach((r) => {
      const nextRunStr = r.nextRunAt ? r.nextRunAt.toISOString() : "null";
      const shouldRun = !r.nextRunAt || r.nextRunAt <= now;
      console.log(
        `[Scheduler]   - "${r.name}": nextRunAt=${nextRunStr}, shouldRun=${shouldRun}`
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
      `[Scheduler] ========== Procesando ${rulesToRun.length} regla(s) ==========`
    );

    for (const rule of rulesToRun) {
      try {
        console.log(`[Scheduler] → Ejecutando: "${rule.name}" (${rule.id})`);
        console.log(
          `[Scheduler]   Tipo: ${rule.scheduleType}, CRON: ${
            rule.cronExpression || "N/A"
          }, Intervalo: ${rule.intervalMinutes || "N/A"} min`
        );
        console.log(
          `[Scheduler]   nextRunAt anterior: ${
            rule.nextRunAt?.toISOString() || "null"
          }`
        );

        // Lock: Calcular y actualizar nextRunAt ANTES de ejecutar para evitar duplicados
        const nextRunAt = calculateNextRun(rule);

        console.log(
          `[Scheduler]   nextRunAt nuevo: ${nextRunAt?.toISOString() || "null"}`
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
          `[Scheduler] ✓ Regla "${rule.name}" ejecutada correctamente`
        );
      } catch (error) {
        console.error(
          `[Scheduler] ✗ Error ejecutando regla ${rule.id}:`,
          error
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
        }": ${nextDate.toISOString()}`
      );
      return nextDate;
    } catch (error) {
      console.error(
        `[Scheduler] Error parseando expresión CRON "${rule.cronExpression}":`,
        error.message
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
