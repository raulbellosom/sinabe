/**
 * Rutas para Reglas de Notificación
 */
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  testRunRule,
  getRuleHistory,
  getRuleTypes,
  getAvailableRecipients,
  getInventoryFieldsEndpoint,
  getConditionsEndpoint,
  unsubscribeFromRule,
} from "../controllers/notificationRuleController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener tipos de regla disponibles (metadata)
router.get("/types", getRuleTypes);

// Obtener campos de inventario disponibles para filtros
router.get("/inventory-fields", getInventoryFieldsEndpoint);

// Obtener condiciones disponibles del catálogo
router.get("/conditions", getConditionsEndpoint);

// Obtener usuarios disponibles para destinatarios
router.get("/recipients", getAvailableRecipients);

// CRUD de reglas
router.get("/", getAllRules);
router.get("/:id", getRuleById);
router.post("/", createRule);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

// Test-run de una regla
router.post("/:id/test-run", testRunRule);

// Historial de ejecuciones
router.get("/:id/history", getRuleHistory);

// Desuscribirse de una regla
router.post("/:id/unsubscribe", unsubscribeFromRule);

export default router;
