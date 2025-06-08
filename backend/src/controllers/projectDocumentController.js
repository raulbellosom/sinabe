import { db } from "../lib/db.js";

// 📤 Subir documento a un proyecto
export const uploadDocument = async (req, res) => {
  const { projectId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Archivo no recibido." });
  }

  try {
    const document = await db.projectDocument.create({
      data: {
        name: file.originalname,
        fileUrl: `/uploads/projects/documents/${file.filename}`,
        projectId: parseInt(projectId),
        enabled: true,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Error al subir documento:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📄 Obtener documentos de un proyecto
export const getDocumentsByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const documents = await db.projectDocument.findMany({
      where: {
        projectId: parseInt(projectId),
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

// ❌ Eliminación lógica
export const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    await db.projectDocument.update({
      where: { id: parseInt(id) },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando documento:", error.message);
    res.status(500).json({ error: error.message });
  }
};
