import express from "express";
import {
  dailyInventoryReport,
  weeklyInventoryAnalysis,
  getSystemStatus,
  testEmailSystem,
} from "../controllers/cronController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🕐 Ejecutar reporte diario de inventarios (equivalente al script bash)
router.post("/daily-report", dailyInventoryReport);

// 🕐 Ejecutar análisis semanal de inventarios
router.post("/weekly-analysis", weeklyInventoryAnalysis);

// 📊 Status del sistema de notificaciones
router.get("/status", getSystemStatus);

// 🧪 Prueba del sistema de correos (requiere autenticación)
router.post("/test-email", protect, testEmailSystem);

export default router;
