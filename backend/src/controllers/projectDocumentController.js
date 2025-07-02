// File: backend/src/controllers/projectDocumentController.js

import { db } from "../lib/db.js";
import fs from "fs";
import path from "path";

const BASE_PATH = path.resolve("src/uploads/projects/documents/");

// utils/fileMetadata.js
export const buildFileMetadata = (file) => {
  return {
    mimetype: file.mimetype,
    encoding: file.encoding,
    size: file.size,
    originalname: file.originalname,
  };
};

// 📄 Obtener documentos de un proyecto
export const getDocumentsByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const documents = await db.projectDocument.findMany({
      where: {
        projectId: projectId,
        enabled: true,
      },
      orderBy: { uploadDate: "desc" },
    });

    res.json(documents);
  } catch (error) {
    console.error("Error obteniendo documentos:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📤 Subir UN documento a un proyecto
export const uploadDocument = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const file = req.file;
  const { name, description } = req.body;

  if (!file) {
    return res.status(400).json({ message: "Archivo no recibido." });
  }

  try {
    const document = await db.projectDocument.create({
      data: {
        name: name || file.originalname,
        description: description || null,
        metadata: buildFileMetadata(file),
        fileUrl: `uploads/projects/documents/${file.filename}`,
        projectId,
        createdById: userId,
        enabled: true,
        uploadDate: new Date(),
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Error al subir documento:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📤 Subir VARIOS documentos a un proyecto
export const uploadMultipleDocuments = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No se recibieron archivos." });
  }

  try {
    const documentsToCreate = files.map((file) => ({
      name: file.originalname,
      fileUrl: `uploads/projects/documents/${file.filename}`,
      description: null,
      metadata: buildFileMetadata(file),
      projectId,
      createdById: userId,
      enabled: true,
      uploadDate: new Date(),
    }));

    const result = await db.projectDocument.createMany({
      data: documentsToCreate,
    });

    res.status(201).json({
      message: "Documentos subidos exitosamente",
      count: result.count,
    });
  } catch (error) {
    console.error("Error al subir múltiples documentos:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar documento (nombre, descripción o archivo)
export const updateDocument = async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const { name, description } = req.body;

  try {
    const existingDoc = await db.projectDocument.findUnique({ where: { id } });

    if (!existingDoc) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (file) {
      // 🧹 Eliminar archivo anterior si existe
      if (existingDoc.fileUrl) {
        const previousPath = path.join(
          BASE_PATH,
          path.basename(existingDoc.fileUrl)
        );
        if (fs.existsSync(previousPath)) {
          fs.unlinkSync(previousPath);
        }
      }

      // 📤 Actualizar archivo y metadatos
      updateData.fileUrl = `uploads/projects/documents/${file.filename}`;
      updateData.uploadDate = new Date(); // solo si cambia el archivo
      updateData.metadata = buildFileMetadata(file);
    }

    const updated = await db.projectDocument.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error actualizando documento:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminación lógica del documento
export const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    await db.projectDocument.update({
      where: { id },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando documento:", error.message);
    res.status(500).json({ error: error.message });
  }
};
