import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getDocumentsByProjectId,
  deleteDocument,
} from "../controllers/projectDocumentController.js";

import { uploadProjectDocument } from "../controllers/uploadProjectDocumentsController.js";

const router = express.Router();

// 📤 Subir documento a un proyecto
router.post(
  "/:projectId/documents",
  protect,
  uploadProjectDocument.single("documento"),
  uploadDocument
);

// 📄 Listar documentos por proyecto
router.get("/:projectId/documents", protect, getDocumentsByProjectId);

// ❌ Eliminar documento lógicamente
router.delete("/documents/:id", protect, deleteDocument);

export default router;
