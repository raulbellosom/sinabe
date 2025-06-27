// routes/invoiceRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadInvoiceFiles,
  processInvoiceFiles,
} from "../controllers/uploadInvoicesController.js";
import {
  createInvoice,
  getInvoicesByOrderId,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInventoriesByInvoice,
  assignInventoriesToInvoice,
  removeInventoryFromInvoice,
} from "../controllers/invoiceController.js";

const router = Router({ mergeParams: true });

// Todas las rutas requieren autenticación
router.use(protect);

// 📄 Crear y listar facturas de una orden de compra
// POST /purchase-orders/:orderId/invoices
// GET  /purchase-orders/:orderId/invoices
router
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

// 📄 Operaciones sobre factura específica
// GET    /purchase-orders/:orderId/invoices/:invoiceId
// PUT    /purchase-orders/:orderId/invoices/:invoiceId
// DELETE /purchase-orders/:orderId/invoices/:invoiceId
router
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

// 📦 Inventarios asociados a una factura
// GET  /purchase-orders/:orderId/invoices/:invoiceId/inventories
// POST /purchase-orders/:orderId/invoices/:invoiceId/inventories
router
  .route("/:invoiceId/inventories")
  .get(getInventoriesByInvoice)
  .post(assignInventoriesToInvoice);

// 🗑️ Desasignar un inventario de la factura
// DELETE /purchase-orders/:orderId/invoices/:invoiceId/inventories/:inventoryId
router
  .route("/:invoiceId/inventories/:inventoryId")
  .delete(removeInventoryFromInvoice);

export default router;
