import { db } from "../lib/db.js";

// 🔄 Obtener todos los deadlines de un proyecto
export const getDeadlinesByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const rawDeadlines = await db.deadline.findMany({
      where: {
        projectId,
        enabled: true,
      },
      include: {
        inventoryAssignments: {
          include: {
            inventory: {
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
        tasks: {
          include: {
            users: true,
          },
          orderBy: { date: "asc" },
        },
        users: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // Filtrado manual en JS
    const deadlines = rawDeadlines.map((deadline) => ({
      ...deadline,
      tasks: deadline.tasks.filter((task) => task.enabled),
      inventoryAssignments: deadline.inventoryAssignments.filter(
        (a) =>
          a.inventory?.enabled &&
          a.inventory.model?.enabled &&
          a.inventory.model.brand?.enabled &&
          a.inventory.model.type?.enabled
      ),
      users: deadline.users.filter((u) => u.enabled),
    }));

    res.json(deadlines);
  } catch (error) {
    console.error("Error getting deadlines:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear deadline
export const createDeadline = async (req, res) => {
  const { projectId } = req.params;
  const {
    name,
    description,
    dueDate,
    status,
    order = 0,
    users = [],
  } = req.body;
  const createdById = req.user.id;

  try {
    const deadline = await db.deadline.create({
      data: {
        name,
        description,
        status,
        dueDate: new Date(dueDate),
        projectId,
        order,
        createdById,
        enabled: true,
        users: {
          connect: users.map((id) => ({ id })),
        },
      },
      include: {
        tasks: {
          where: { enabled: true },
        },
        users: true,
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
  const {
    name,
    description,
    dueDate,
    responsible,
    status,
    order,
    users = [],
  } = req.body;

  try {
    const updated = await db.deadline.update({
      where: { id, enabled: true },
      data: {
        name,
        description,
        responsible,
        status,
        dueDate: new Date(dueDate),
        users: {
          set: users.map((id) => ({ id })),
        },
        order,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating deadline:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminación lógica de deadline y sus tareas
export const deleteDeadline = async (req, res) => {
  const { id } = req.params;

  try {
    await db.deadline.update({
      where: { id },
      data: { enabled: false },
    });

    await db.deadlineTask.updateMany({
      where: { deadlineId: id },
      data: { enabled: false },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting deadline and its tasks:", error.message);
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
        deadlineId,
        inventoryId,
        enabled: true,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Ya está asignado." });
    }

    const assignment = await db.inventoryDeadline.create({
      data: {
        deadlineId,
        inventoryId,
        enabled: true,
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
        deadlineId,
        enabled: true,
      },
      include: {
        inventory: {
          where: { enabled: true },
          include: {
            model: {
              where: { enabled: true },
              include: {
                brand: true,
                type: true,
              },
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
        deadlineId,
        inventoryId,
        enabled: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Relación no encontrada." });
    }

    await db.inventoryDeadline.update({
      where: { id: existing.id },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error unassigning inventory:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔀 Reordenar deadlines
export const reorderDeadlines = async (req, res) => {
  const deadlines = req.body;

  if (!Array.isArray(deadlines)) {
    return res.status(400).json({
      error: "El cuerpo debe ser un array de deadlines con id y order.",
    });
  }

  try {
    const updates = await Promise.all(
      deadlines.map(({ id, order }) =>
        db.deadline.update({
          where: { id, enabled: true },
          data: { order },
        })
      )
    );

    res.status(200).json({
      message: "Orden actualizado correctamente.",
      updated: updates.length,
    });
  } catch (error) {
    console.error("Error reordenando deadlines:", error.message);
    res.status(500).json({ error: error.message });
  }
};
