// routes/invoiceRoutes.js - UNIFIED VERSION
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
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

// 🔎 Buscar facturas independientes
// GET /api/invoices/search/independent
independentRouter.get("/search/independent", searchIndependentInvoices);

// 🔎 Buscar TODAS las facturas (independientes + con OC)
// GET /api/invoices/search
independentRouter.get("/search", searchAllInvoices);

// 🔗 Asignar factura a orden de compra
// PUT /api/invoices/:invoiceId/assign-purchase-order
independentRouter.put(
  "/:invoiceId/assign-purchase-order",
  assignInvoiceToPurchaseOrder
);

// 🔓 Remover factura de orden de compra
// PUT /api/invoices/:invoiceId/remove-purchase-order
independentRouter.put(
  "/:invoiceId/remove-purchase-order",
  removeInvoiceFromPurchaseOrder
);

// 📄 Crear factura independiente (ruta específica para frontend)
// POST /api/invoices/independent
independentRouter.post("/independent", createIndependentInvoice);

// 📄 CRUD facturas independientes
// POST /api/invoices - Crear factura independiente
// GET  /api/invoices - Listar facturas independientes
independentRouter
  .route("/")
  .post(
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    createIndependentInvoice
  )
  .get(getIndependentInvoices);

// 📄 Operaciones sobre factura específica
// GET    /api/invoices/:invoiceId
// PUT    /api/invoices/:invoiceId
// DELETE /api/invoices/:invoiceId
independentRouter
  .route("/:invoiceId")
  .get(getInvoiceById)
  .put(
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    updateInvoice
  )
  .delete(deleteInvoice);

// 📦 Inventarios asociados a facturas independientes
// GET  /api/invoices/:invoiceId/inventories
// POST /api/invoices/:invoiceId/inventories
independentRouter
  .route("/:invoiceId/inventories")
  .get(getInventoriesByInvoice)
  .post(assignInventoriesToInvoice);

// �️ Desasignar inventario de factura independiente
// DELETE /api/invoices/:invoiceId/inventories/:inventoryId
independentRouter
  .route("/:invoiceId/inventories/:inventoryId")
  .delete(removeInventoryFromInvoice);

// === FACTURACIÓN LIGADA A ÓRDENES DE COMPRA (Sub-rutas) ===
const purchaseOrderRouter = Router({ mergeParams: true });
purchaseOrderRouter.use(protect);

// 🔎 Buscar facturas de una orden de compra específica
// GET /purchase-orders/:orderId/invoices/search
purchaseOrderRouter.get("/search", searchInvoicesByOrderId);

// 📄 CRUD facturas de orden de compra
// POST /purchase-orders/:orderId/invoices - Crear factura para orden
// GET  /purchase-orders/:orderId/invoices - Listar facturas de orden
purchaseOrderRouter
  .route("/")
  .post(
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    createInvoice
  )
  .get(getInvoicesByOrderId);

// 📄 Operaciones sobre factura específica de orden
// GET    /purchase-orders/:orderId/invoices/:invoiceId
// PUT    /purchase-orders/:orderId/invoices/:invoiceId
// DELETE /purchase-orders/:orderId/invoices/:invoiceId
purchaseOrderRouter
  .route("/:invoiceId")
  .get(getInvoiceById)
  .put(
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    updateInvoice
  )
  .delete(deleteInvoice);

// 📦 Inventarios asociados a factura de orden
// GET  /purchase-orders/:orderId/invoices/:invoiceId/inventories
// POST /purchase-orders/:orderId/invoices/:invoiceId/inventories
purchaseOrderRouter
  .route("/:invoiceId/inventories")
  .get(getInventoriesByInvoice)
  .post(assignInventoriesToInvoice);

// 🗑️ Desasignar inventario de factura de orden
// DELETE /purchase-orders/:orderId/invoices/:invoiceId/inventories/:inventoryId
purchaseOrderRouter
  .route("/:invoiceId/inventories/:inventoryId")
  .delete(removeInventoryFromInvoice);

// Export both routers
export { independentRouter as default, purchaseOrderRouter };
