import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  analyzeInventoriesForNotifications,
  runInventoryAnalysis,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔔 Obtener notificaciones del usuario
router.get("/user/:userId", protect, getNotifications);

// 📊 Obtener estadísticas de notificaciones del usuario
router.get("/user/:userId/stats", protect, getNotificationStats);

// ✅ Marcar notificación como leída
router.patch("/:notificationId/read", protect, markAsRead);

// ✅ Marcar todas las notificaciones del usuario como leídas
router.patch("/user/:userId/read-all", protect, markAllAsRead);

// 🗑️ Eliminar notificación
router.delete("/:notificationId", protect, deleteNotification);

// 🔍 Análisis manual de inventarios (para testing)
router.post("/analyze", protect, analyzeInventoriesForNotifications);

export default router;
