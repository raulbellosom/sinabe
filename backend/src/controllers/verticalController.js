import { db } from "../lib/db.js";

// 🟢 Obtener todas las verticales con modelos, marcas e inventarios
export const getVerticals = async (req, res) => {
  try {
    const verticals = await db.vertical.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        ModelVertical: {
          include: {
            model: {
              include: {
                brand: true,
                type: true,
                inventories: {
                  where: { enabled: true },
                  include: {
                    model: {
                      include: {
                        brand: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formatted = verticals.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      models: v.ModelVertical.map((mv) => ({
        id: mv.model.id,
        name: mv.model.name,
        type: mv.model.type,
        brand: mv.model.brand,
        inventories: mv.model.inventories,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error al obtener verticales:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ➕ Crear una nueva vertical
export const createVertical = async (req, res) => {
  const { name, description } = req.body;

  const existing = await db.vertical.findFirst({ where: { name } });
  if (existing) {
    return res.status(400).json({ message: "La vertical ya existe" });
  }

  const vertical = await db.vertical.create({
    data: { name, description },
  });

  res.status(201).json(vertical);
};

// 📝 Actualizar una vertical
export const updateVertical = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const existing = await db.vertical.findFirst({
    where: { name, id: { not: parseInt(id) } },
  });

  if (existing) {
    return res.status(400).json({ message: "La vertical ya existe" });
  }

  const updated = await db.vertical.update({
    where: { id: parseInt(id) },
    data: { name, description },
  });

  res.json(updated);
};

// ❌ Eliminación lógica
export const deleteVertical = async (req, res) => {
  const { id } = req.params;

  const existing = await db.vertical.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existing) {
    return res.status(404).json({ message: "Vertical no encontrada" });
  }

  await db.vertical.update({
    where: { id: parseInt(id) },
    data: { enabled: false },
  });

  res.status(204).end();
};

// 🔄 Asignar verticales a un modelo
export const assignVerticalsToModel = async (req, res) => {
  const { modelId } = req.params;
  const { verticalIds } = req.body;

  try {
    await db.modelVertical.deleteMany({
      where: { modelId: parseInt(modelId) },
    });

    const data = verticalIds.map((verticalId) => ({
      modelId: parseInt(modelId),
      verticalId: parseInt(verticalId),
    }));

    await db.modelVertical.createMany({ data });

    res.status(200).json({ message: "Verticales asignadas correctamente" });
  } catch (error) {
    console.error("Error asignando verticales:", error.message);
    res.status(500).json({ error: "Error interno al asignar verticales" });
  }
};

// ❌ Eliminar una sola vertical de un modelo
export const removeVerticalFromModel = async (req, res) => {
  const { modelId, verticalId } = req.params;

  try {
    await db.modelVertical.deleteMany({
      where: {
        modelId: parseInt(modelId),
        verticalId: parseInt(verticalId),
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando relación vertical-modelo:", error.message);
    res.status(500).json({ error: "Error interno" });
  }
};

// 🔍 Obtener verticales por modelo con todos los datos
export const getModelVerticals = async (req, res) => {
  const { modelId } = req.params;

  try {
    const relations = await db.modelVertical.findMany({
      where: { modelId: parseInt(modelId) },
      include: {
        vertical: true,
      },
    });

    res.json(relations.map((r) => r.vertical));
  } catch (error) {
    console.error("Error al obtener verticales del modelo:", error.message);
    res.status(500).json({ error: "Error interno" });
  }
};
