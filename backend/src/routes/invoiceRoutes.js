// routes/invoiceRoutes.js - UNIFIED VERSION
import { Router } from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  uploadInvoiceFiles,
  processInvoiceFiles,
} from "../controllers/uploadInvoicesController.js";
import {
  createInvoice,
  createIndependentInvoice,
  getInvoicesByOrderId,
  getIndependentInvoices,
  searchIndependentInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInventoriesByInvoice,
  assignInventoriesToInvoice,
  removeInventoryFromInvoice,
  searchInvoicesByOrderId,
  searchAllInvoices,
  assignInvoiceToPurchaseOrder,
  removeInvoiceFromPurchaseOrder,
} from "../controllers/invoiceController.js";

// === FACTURACIÓN INDEPENDIENTE (Rutas principales) ===
const independentRouter = Router();
independentRouter.use(protect);

const canView = checkPermission("view_invoices");
const canCreate = checkPermission("create_invoices");
const canEdit = checkPermission("edit_invoices");
const canDelete = checkPermission("delete_invoices");

// Buscar facturas independientes
// GET /api/invoices/search/independent
independentRouter.get(
  "/search/independent",
  canView,
  searchIndependentInvoices,
);

// 🔎 Buscar TODAS las facturas (independientes + con OC)
// GET /api/invoices/search
independentRouter.get("/search", canView, searchAllInvoices);

// 🔗 Asignar factura a orden de compra
// PUT /api/invoices/:invoiceId/assign-purchase-order
independentRouter.put(
  "/:invoiceId/assign-purchase-order",
  canEdit,
  assignInvoiceToPurchaseOrder,
);

independentRouter.put(
  "/:invoiceId/remove-purchase-order",
  canEdit,
  removeInvoiceFromPurchaseOrder,
);

// 📄 Crear factura independiente (ruta específica para frontend)
// POST /api/invoices/independent
independentRouter.post("/independent", canCreate, createIndependentInvoice);

// 📄 CRUD facturas independientes
// POST /api/invoices - Crear factura independiente
// GET  /api/invoices - Listar facturas independientes
independentRouter
  .route("/")
  .post(
    canCreate,
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    createIndependentInvoice,
  )
  .get(canView, getIndependentInvoices);

// 📄 Operaciones sobre factura específica
// GET    /api/invoices/:invoiceId
// PUT    /api/invoices/:invoiceId
// DELETE /api/invoices/:invoiceId
independentRouter
  .route("/:invoiceId")
  .get(canView, getInvoiceById)
  .put(
    canEdit,
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    updateInvoice,
  )
  .delete(canDelete, deleteInvoice);

// 📦 Inventarios asociados a facturas independientes
// GET  /api/invoices/:invoiceId/inventories
// POST /api/invoices/:invoiceId/inventories
independentRouter
  .route("/:invoiceId/inventories")
  .get(canView, getInventoriesByInvoice)
  .post(canEdit, assignInventoriesToInvoice);

independentRouter
  .route("/:invoiceId/inventories/:inventoryId")
  .delete(canEdit, removeInventoryFromInvoice);

// === FACTURACIÓN LIGADA A ÓRDENES DE COMPRA (Sub-rutas) ===
const purchaseOrderRouter = Router({ mergeParams: true });
purchaseOrderRouter.use(protect);

const poView = checkPermission("view_invoices");
const poCreate = checkPermission("create_invoices");
const poEdit = checkPermission("edit_invoices");
const poDelete = checkPermission("delete_invoices");

purchaseOrderRouter.get("/search", poView, searchInvoicesByOrderId);

// 📄 CRUD facturas de orden de compra
// POST /purchase-orders/:orderId/invoices - Crear factura para orden
// GET  /purchase-orders/:orderId/invoices - Listar facturas de orden
purchaseOrderRouter
  .route("/")
  .post(
    poCreate,
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    createInvoice,
  )
  .get(poView, getInvoicesByOrderId);

// 📄 Operaciones sobre factura específica de orden
// GET    /purchase-orders/:orderId/invoices/:invoiceId
// PUT    /purchase-orders/:orderId/invoices/:invoiceId
// DELETE /purchase-orders/:orderId/invoices/:invoiceId
purchaseOrderRouter
  .route("/:invoiceId")
  .get(poView, getInvoiceById)
  .put(
    poEdit,
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    updateInvoice,
  )
  .delete(poDelete, deleteInvoice);

// 📦 Inventarios asociados a factura de orden
// GET  /purchase-orders/:orderId/invoices/:invoiceId/inventories
// POST /purchase-orders/:orderId/invoices/:invoiceId/inventories
purchaseOrderRouter
  .route("/:invoiceId/inventories")
  .get(poView, getInventoriesByInvoice)
  .post(poEdit, assignInventoriesToInvoice);

purchaseOrderRouter
  .route("/:invoiceId/inventories/:inventoryId")
  .delete(poEdit, removeInventoryFromInvoice);

// Export both routers
export { independentRouter as default, purchaseOrderRouter };
