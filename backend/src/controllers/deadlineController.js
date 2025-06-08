import { db } from "../lib/db.js";

// 🔄 Obtener todos los deadlines de un proyecto
export const getDeadlinesByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const deadlines = await db.deadline.findMany({
      where: {
        projectId: parseInt(projectId),
        enabled: true,
      },
      include: {
        inventoryAssignments: {
          include: {
            inventory: {
              include: {
                model: {
                  include: { brand: true, type: true },
                },
              },
            },
          },
        },
        tasks: true,
      },
      orderBy: { dueDate: "asc" },
    });

    res.json(deadlines);
  } catch (error) {
    console.error("Error getting deadlines:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear deadline
export const createDeadline = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, dueDate, responsible, status } = req.body;

  try {
    const deadline = await db.deadline.create({
      data: {
        name,
        description,
        responsible,
        status,
        dueDate: new Date(dueDate),
        projectId: parseInt(projectId),
        enabled: true,
      },
    });

    res.status(201).json(deadline);
  } catch (error) {
    console.error("Error creating deadline:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar deadline
export const updateDeadline = async (req, res) => {
  const { id } = req.params;
  const { name, description, dueDate, responsible, status } = req.body;

  try {
    const updated = await db.deadline.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        responsible,
        status,
        dueDate: new Date(dueDate),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating deadline:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminación lógica
export const deleteDeadline = async (req, res) => {
  const { id } = req.params;

  try {
    await db.deadline.update({
      where: { id: parseInt(id) },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting deadline:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🛠 Asignar inventario a deadline
export const assignInventoryToDeadline = async (req, res) => {
  const { deadlineId } = req.params;
  const { inventoryId } = req.body;

  try {
    const existing = await db.inventoryDeadline.findFirst({
      where: {
        deadlineId: parseInt(deadlineId),
        inventoryId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Ya está asignado." });
    }

    const assignment = await db.inventoryDeadline.create({
      data: {
        deadlineId: parseInt(deadlineId),
        inventoryId,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error assigning inventory:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📦 Obtener inventarios asignados a un deadline
export const getInventoriesByDeadline = async (req, res) => {
  const { deadlineId } = req.params;

  try {
    const inventories = await db.inventoryDeadline.findMany({
      where: {
        deadlineId: parseInt(deadlineId),
      },
      include: {
        inventory: {
          include: {
            model: {
              include: { brand: true, type: true },
            },
          },
        },
      },
    });

    res.json(inventories.map((item) => item.inventory));
  } catch (error) {
    console.error("Error fetching inventories by deadline:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔓 Remover inventario de un deadline
export const unassignInventoryFromDeadline = async (req, res) => {
  const { deadlineId, inventoryId } = req.params;

  try {
    const existing = await db.inventoryDeadline.findFirst({
      where: {
        deadlineId: parseInt(deadlineId),
        inventoryId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Relación no encontrada." });
    }

    await db.inventoryDeadline.delete({
      where: { id: existing.id },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error unassigning inventory:", error.message);
    res.status(500).json({ error: error.message });
  }
};
