// src/controllers/deadlineTaskController.js
import { db } from "../lib/db.js";

// ➕ Crear una tarea
export const createTask = async (req, res) => {
  const { deadlineId } = req.params;
  const {
    name,
    description,
    date,
    users = [],
    order = 0,
    createdById,
    status = "PENDIENTE",
  } = req.body;

  try {
    const task = await db.deadlineTask.create({
      data: {
        name,
        description,
        date: new Date(date),
        order,
        deadlineId,
        createdById,
        status,
        enabled: true,
        users: {
          connect: users.map((id) => ({ id })),
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creando tarea:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Editar tarea
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, users = [], status } = req.body;

  try {
    const existing = await db.deadlineTask.findFirst({
      where: { id, enabled: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ error: "Tarea no encontrada o deshabilitada" });
    }

    const updated = await db.deadlineTask.update({
      where: { id },
      data: {
        name,
        description,
        date: new Date(date),
        status,
        users: {
          set: users.map((id) => ({ id })),
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error actualizando tarea:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminar tarea (lógica)
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  console.log("Eliminando tarea con ID:", id);

  try {
    await db.deadlineTask.update({
      where: { id },
      data: { enabled: false },
    });

    res.status(200).json({ message: "Tarea eliminada correctamente." });
  } catch (error) {
    console.error("Error eliminando tarea:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔃 Reordenar tareas de un deadline
export const reorderTasks = async (req, res) => {
  const tasks = req.body;

  if (!Array.isArray(tasks)) {
    return res
      .status(400)
      .json({ error: "El cuerpo debe ser un array de tareas con id y order." });
  }

  try {
    const updates = await Promise.all(
      tasks.map(async ({ id, order }) => {
        const existing = await db.deadlineTask.findFirst({
          where: { id, enabled: true },
        });
        if (!existing) return null;

        return db.deadlineTask.update({
          where: { id },
          data: { order },
        });
      })
    );

    res.status(200).json({
      message: "Tareas reordenadas.",
      updated: updates.filter(Boolean).length,
    });
  } catch (error) {
    console.error("Error reordenando tareas:", error.message);
    res.status(500).json({ error: error.message });
  }
};
