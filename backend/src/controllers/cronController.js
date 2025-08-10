import { runInventoryAnalysis } from "../controllers/notificationController.js";
import emailService from "../services/emailService.js";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// 🕐 Función para ejecutar el cron diario (reporte de equipos nuevos)
export const dailyInventoryReport = async (req, res) => {
  try {
    const testMode = req.query.test === "1" || req.query.test === "true";
    const result = await emailService.sendDailyInventoryReport(testMode);

    res.json({
      message: "Reporte diario ejecutado",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en reporte diario:", error);
    res.status(500).json({
      error: "Error ejecutando reporte diario",
      message: error.message,
    });
  }
};

// 🕐 Función para ejecutar análisis semanal de inventarios
export const weeklyInventoryAnalysis = async (req, res) => {
  try {
    const results = await runInventoryAnalysis();

    // Enviar correos según los resultados
    if (results.newInventoriesWithoutAssignment > 0) {
      // Ya se crearon las notificaciones, aquí podríamos enviar correos adicionales si es necesario
    }

    res.json({
      message: "Análisis semanal ejecutado",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en análisis semanal:", error);
    res.status(500).json({
      error: "Error ejecutando análisis semanal",
      message: error.message,
    });
  }
};

// 📊 Status del sistema de notificaciones
export const getSystemStatus = async (req, res) => {
  try {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    // Estadísticas del día
    const { db } = await import("../lib/db.js");

    const todayNotifications = await db.notification.count({
      where: {
        createdAt: {
          gte: new Date(today + "T00:00:00.000Z"),
          lt: new Date(today + "T23:59:59.999Z"),
        },
      },
    });

    const totalUnreadNotifications = await db.notification.count({
      where: { read: false },
    });

    const recentInventories = await db.inventory.count({
      where: {
        enabled: true,
        createdAt: {
          gte: new Date(today + "T00:00:00.000Z"),
          lt: new Date(today + "T23:59:59.999Z"),
        },
        receptionDate: { not: null },
      },
    });

    res.json({
      status: "Sistema operativo",
      timestamp: now.toISOString(),
      stats: {
        notificationsToday: todayNotifications,
        totalUnreadNotifications,
        newInventoriesToday: recentInventories,
      },
      config: {
        emailService: "msmtp",
        logFile: emailService.EMAIL_CONFIG.logFile,
        sinabeUrl: emailService.EMAIL_CONFIG.sinabeUrl,
      },
    });
  } catch (error) {
    console.error("Error obteniendo status del sistema:", error);
    res.status(500).json({
      error: "Error obteniendo status del sistema",
      message: error.message,
    });
  }
};

// 🧪 Función de prueba para envío de correos
export const testEmailSystem = async (req, res) => {
  try {
    const { type = "daily", recipients } = req.body;

    let result;
    switch (type) {
      case "daily":
        result = await emailService.sendDailyInventoryReport(true);
        break;
      case "analysis":
        result = await runInventoryAnalysis();
        break;
      default:
        return res.status(400).json({ error: "Tipo de prueba no válido" });
    }

    res.json({
      message: `Prueba de ${type} ejecutada exitosamente`,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en prueba de correo:", error);
    res.status(500).json({
      error: "Error en prueba de correo",
      message: error.message,
    });
  }
};
