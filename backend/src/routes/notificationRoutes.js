/**
 * Rutas para Notificaciones In-App (bandeja del usuario)
 */
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  getMyUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationReadStatus,
} from "../controllers/notificationController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener notificaciones del usuario actual
router.get("/", getMyNotifications);

// Obtener conteo de no leídas
router.get("/unread-count", getMyUnreadCount);

// Marcar todas como leídas
router.post("/read-all", markAllNotificationsAsRead);

// Eliminar todas las leídas
router.delete("/read", deleteReadNotifications);

// Ver estado de lectura de una notificación (solo dueño de la regla)
router.get("/:id/read-status", getNotificationReadStatus);

// Marcar una como leída
router.post("/:id/read", markNotificationAsRead);

// Eliminar una notificación
router.delete("/:id", deleteNotification);

export default router;
