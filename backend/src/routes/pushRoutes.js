/**
 * Rutas de Push Notifications
 */
import { Router } from "express";
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  getSubscriptions,
  sendTestPush,
  sendPushToUser,
  generateKeys,
} from "../controllers/pushController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Rutas públicas (solo una)
router.get("/vapid-public-key", getPublicKey);

// Rutas protegidas
router.use(protect);

// Gestión de suscripciones
router.post("/subscribe", subscribe);
router.delete("/unsubscribe", unsubscribe);
router.get("/subscriptions", getSubscriptions);

// Pruebas
router.post("/test", sendTestPush);

// Admin
router.post("/send", sendPushToUser);

// Setup (solo para configuración inicial, considerar proteger o eliminar en producción)
router.post("/generate-vapid-keys", generateKeys);

export default router;
