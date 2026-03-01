import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
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
  getAllInventoriesByPurchaseOrder,
} from "../controllers/purchaseOrderController.js";
import { purchaseOrderRouter } from "./invoiceRoutes.js";

const router = express.Router();

// Todas las rutas de OC requieren auth
router.use(protect);

const canView = checkPermission("view_purchase_orders");
const canCreate = checkPermission("create_purchase_orders");
const canEdit = checkPermission("edit_purchase_orders");
const canDelete = checkPermission("delete_purchase_orders");

// 🔎 Buscador general sin proyecto
router.get("/search", canView, searchPurchaseOrders);

// 🔎 Buscador por proyecto
router.get("/projects/:projectId/search", canView, searchPurchaseOrders);

// 🔍 Obtener OC sin asignar
router.get("/without-project", canView, getUnassignedPurchaseOrders);

// 🔍 Buscar OC sin asignar
router.get("/without-project/search", canView, searchUnassignedPurchaseOrders);

// ➕ Crear OC sin proyecto asignado
router.post("/without-project", canCreate, createPurchaseOrderWithoutProject);

// 📦 Obtener y crear OC por proyecto
router
  .route("/projects/:projectId")
  .get(canView, getPurchaseOrdersByProjectId)
  .post(canCreate, createPurchaseOrder);

// 🔗 Asignar/remover órdenes de compra a/de proyectos
router.put(
  "/projects/:projectId/orders/:orderId/assign",
  canEdit,
  assignPurchaseOrderToProject,
);
router.delete(
  "/projects/:projectId/orders/:orderId/remove",
  canDelete,
  removePurchaseOrderFromProject,
);

// 📦 Inventarios asociados a una orden de compra
router
  .route("/:orderId/inventories")
  .get(canView, getInventoriesByPurchaseOrder)
  .post(canEdit, assignInventoriesToPurchaseOrder);

// 📦 Obtener TODOS los inventarios de una OC (directos + de facturas)
router.get(
  "/:orderId/all-inventories",
  canView,
  getAllInventoriesByPurchaseOrder,
);

// 🗑️ Desasignar un inventario de la orden de compra
router
  .route("/:orderId/inventories/:inventoryId")
  .delete(canEdit, removeInventoryFromPurchaseOrder);

// ✏️ Actualizar / ❌ Eliminar OC por ID
router
  .route("/:id")
  .put(canEdit, updatePurchaseOrder)
  .delete(canDelete, deletePurchaseOrder);

// 🎫 Sub‑rutas de facturas anidadas
router.use("/:orderId/invoices", purchaseOrderRouter);

export default router;
