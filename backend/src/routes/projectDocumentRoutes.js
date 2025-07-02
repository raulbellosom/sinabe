// File: backend/src/routes/projectDocumentRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadDocument, // POST: subir un documento
  uploadMultipleDocuments, // POST: subir múltiples documentos (nuevo)
  getDocumentsByProjectId, // GET: listar documentos de un proyecto
  deleteDocument, // DELETE: eliminar documento lógico
  updateDocument, // PUT: actualizar documento existente
} from "../controllers/projectDocumentController.js";

import {
  uploadProjectDocument, // middleware para uno
  uploadMultipleProjectDocuments, // middleware para múltiples
} from "../controllers/uploadProjectDocumentsController.js";

const router = express.Router();

// 📤 Subir UN documento a un proyecto
router.post(
  "/:projectId/documents",
  protect,
  uploadProjectDocument,
  uploadDocument
);

// 📤 Subir VARIOS documentos a un proyecto (nuevo)
router.post(
  "/:projectId/documents/multiple",
  protect,
  uploadMultipleProjectDocuments,
  uploadMultipleDocuments
);

// 📄 Listar documentos por proyecto
router.get("/:projectId/documents", protect, getDocumentsByProjectId);

// ✏️ Actualizar documento individual
router.put("/documents/:id", protect, uploadProjectDocument, updateDocument);

// ❌ Eliminar documento lógicamente
router.delete("/documents/:id", protect, deleteDocument);

export default router;
