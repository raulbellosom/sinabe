import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPurchaseOrdersByProjectId,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  searchPurchaseOrders,
} from "../controllers/purchaseOrderController.js";
import invoiceRoutes from "./invoiceRoutes.js";

const router = express.Router();

// Todas las rutas de OC requieren auth
router.use(protect);

// 📦 Órdenes de compra por proyecto
router
  .route("/projects/:projectId")
  .get(getPurchaseOrdersByProjectId)
  .post(createPurchaseOrder);

// ✏️ Actualizar / ❌ Borrar OC
router.route("/:id").put(updatePurchaseOrder).delete(deletePurchaseOrder);

// 🔎 Buscador avanzado
router.get("/projects/:projectId/search", searchPurchaseOrders);

// 🎫 Sub‐rutas de facturas anidadas
router.use("/:orderId/invoices", invoiceRoutes);

export default router;
