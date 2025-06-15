import { db } from "../lib/db.js";

// ➕ Asignar inventario a una deadline
export const assignInventoryToDeadline = async (req, res) => {
  const { deadlineId, inventoryId, quantity = 1 } = req.body;

  if (!deadlineId || !inventoryId) {
    return res.status(400).json({
      error: "Se requiere deadlineId e inventoryId",
    });
  }

  try {
    // Evitar duplicados
    const existing = await db.inventoryDeadline.findFirst({
      where: {
        deadlineId,
        inventoryId,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Este inventario ya está asignado a la deadline." });
    }

    const assignment = await db.inventoryDeadline.create({
      data: {
        deadlineId,
        inventoryId,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error al asignar inventario a deadline:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📦 Obtener inventarios asignados a una deadline
export const getInventoryAssignmentsByDeadline = async (req, res) => {
  const { deadlineId } = req.params;

  try {
    const rawAssignments = await db.inventoryDeadline.findMany({
      where: {
        deadlineId,
      },
      include: {
        inventory: {
          include: {
            model: {
              include: {
                brand: true,
                type: true,
              },
            },
            images: true,
            conditions: true,
          },
        },
      },
    });

    // 🔍 Filtro manual (enabled)
    const assignments = rawAssignments.filter(
      (a) =>
        a.inventory?.enabled &&
        a.inventory.model?.enabled &&
        a.inventory.model.brand?.enabled &&
        a.inventory.model.type?.enabled &&
        (a.inventory.images || []).every((img) => img.enabled !== false)
    );

    res.json(assignments);
  } catch (error) {
    console.error("Error al obtener inventarios asignados:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminar lógica (soft delete) — no aplica si no hay campo `enabled`
// Alternativa: eliminación física
export const unassignInventoryFromDeadline = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    await db.inventoryDeadline.delete({
      where: { id: assignmentId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al desasignar inventario:", error.message);
    res.status(500).json({ error: error.message });
  }
};
