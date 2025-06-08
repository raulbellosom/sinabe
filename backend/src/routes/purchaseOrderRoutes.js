import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPurchaseOrdersByProjectId,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  addInvoiceToOrder,
  getInvoicesByOrderId,
} from "../controllers/purchaseOrderController.js";

import {
  uploadInvoiceFiles,
  processInvoiceFiles,
} from "../controllers/uploadInvoicesController.js";

const router = express.Router();

// 📦 Órdenes de compra por proyecto
router
  .route("/projects/:projectId")
  .get(protect, getPurchaseOrdersByProjectId)
  .post(protect, createPurchaseOrder);

// ✏️ Actualizar y eliminar OC
router
  .route("/:id")
  .put(protect, updatePurchaseOrder)
  .delete(protect, deletePurchaseOrder);

// 🧾 Facturas (crear y obtener)
router
  .route("/:orderId/invoices")
  .post(
    protect,
    uploadInvoiceFiles.fields([
      { name: "factura", maxCount: 1 },
      { name: "xml", maxCount: 1 },
    ]),
    processInvoiceFiles,
    addInvoiceToOrder
  )
  .get(protect, getInvoicesByOrderId);

export default router;
