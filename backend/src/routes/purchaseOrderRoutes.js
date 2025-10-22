import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPurchaseOrdersByProjectId,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  searchPurchaseOrders,
  assignPurchaseOrderToProject,
  removePurchaseOrderFromProject,
  createPurchaseOrderWithoutProject,
  getUnassignedPurchaseOrders,
  searchUnassignedPurchaseOrders,
  getInventoriesByPurchaseOrder,
  assignInventoriesToPurchaseOrder,
  removeInventoryFromPurchaseOrder,
} from "../controllers/purchaseOrderController.js";
import { purchaseOrderRouter } from "./invoiceRoutes.js";

const router = express.Router();

// Todas las rutas de OC requieren auth
router.use(protect);

// 🔎 Buscador general sin proyecto
router.get("/search", searchPurchaseOrders);

// 🔎 Buscador por proyecto
router.get("/projects/:projectId/search", searchPurchaseOrders);

// 🔍 Obtener OC sin asignar
router.get("/without-project", getUnassignedPurchaseOrders);

// 🔍 Buscar OC sin asignar
router.get("/without-project/search", searchUnassignedPurchaseOrders);

// ➕ Crear OC sin proyecto asignado
router.post("/without-project", createPurchaseOrderWithoutProject);

// 📦 Obtener y crear OC por proyecto
router
  .route("/projects/:projectId")
  .get(getPurchaseOrdersByProjectId)
  .post(createPurchaseOrder);

// 🔗 Asignar/remover órdenes de compra a/de proyectos
router.put(
  "/projects/:projectId/orders/:orderId/assign",
  assignPurchaseOrderToProject
);
router.delete(
  "/projects/:projectId/orders/:orderId/remove",
  removePurchaseOrderFromProject
);

// 📦 Inventarios asociados a una orden de compra
// GET  /purchase-orders/:orderId/inventories
// POST /purchase-orders/:orderId/inventories
router
  .route("/:orderId/inventories")
  .get(getInventoriesByPurchaseOrder)
  .post(assignInventoriesToPurchaseOrder);

// 🗑️ Desasignar un inventario de la orden de compra
// DELETE /purchase-orders/:orderId/inventories/:inventoryId
router
  .route("/:orderId/inventories/:inventoryId")
  .delete(removeInventoryFromPurchaseOrder);

// ✏️ Actualizar / ❌ Eliminar OC por ID
router.route("/:id").put(updatePurchaseOrder).delete(deletePurchaseOrder);

// 🎫 Sub‐rutas de facturas anidadas
router.use("/:orderId/invoices", purchaseOrderRouter);

export default router;
