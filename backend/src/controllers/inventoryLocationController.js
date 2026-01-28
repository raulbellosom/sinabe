import { db } from "../lib/db.js";
import { logAction } from "../services/logger.service.js";

// 📋 Obtener lista de ubicaciones (con búsqueda opcional)
export const getInventoryLocations = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      enabled: true,
      ...(search
        ? {
            name: {
              contains: String(search),
              mode: "insensitive",
            },
          }
        : {}),
    };

    const locations = await db.inventoryLocation.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { inventories: { where: { enabled: true } } },
        },
      },
    });

    const locationsWithCount = locations.map((location) => ({
      ...location,
      count: location._count.inventories,
    }));

    res.json(locationsWithCount);
  } catch (error) {
    console.error("Error fetching inventory locations:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📍 Obtener ubicación por ID
export const getInventoryLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await db.inventoryLocation.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        inventories: {
          select: {
            id: true,
            internalFolio: true,
            serialNumber: true,
          },
        },
      },
    });

    if (!location) {
      return res.status(404).json({ message: "Ubicación no encontrada" });
    }

    res.json(location);
  } catch (error) {
    console.error("Error fetching inventory location:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear nueva ubicación
export const createInventoryLocation = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const trimmedName = name.trim();

    // Verificar si ya existe una ubicación con ese nombre
    const existing = await db.inventoryLocation.findFirst({
      where: { name: trimmedName, enabled: true },
    });

    if (existing) {
      return res.json(existing);
    }

    const location = await db.inventoryLocation.create({
      data: {
        name: trimmedName,
      },
    });

    try {
      await logAction({
        entityType: "LOCATION",
        entityId: location.id,
        action: "CREATE",
        userId: req.user.id,
        changes: { name: location.name },
        entityTitle: location.name,
      });
    } catch (logError) {
      console.error("Error logging:", logError);
    }

    res.status(201).json(location);
  } catch (error) {
    console.error("Error creating inventory location:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar ubicación
export const updateInventoryLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const trimmedName = name.trim();

    // Verificar si ya existe otra ubicación con ese nombre
    const existing = await db.inventoryLocation.findFirst({
      where: {
        name: trimmedName,
        enabled: true,
        NOT: { id: parseInt(id, 10) },
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Ya existe una ubicación con ese nombre" });
    }

    const oldLocation = await db.inventoryLocation.findUnique({
      where: { id: parseInt(id, 10) },
    });

    const location = await db.inventoryLocation.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: trimmedName,
      },
    });

    try {
      await logAction({
        entityType: "LOCATION",
        entityId: location.id,
        action: "UPDATE",
        userId: req.user.id,
        changes: {
          name: {
            old: oldLocation.name,
            new: location.name,
          },
        },
        entityTitle: location.name,
      });
    } catch (logError) {
      console.error("Error logging:", logError);
    }

    res.json(location);
  } catch (error) {
    console.error("Error updating inventory location:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Eliminar ubicación (borrado lógico)
export const deleteInventoryLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay inventarios usando esta ubicación
    const inventoriesCount = await db.inventory.count({
      where: { locationId: parseInt(id, 10), enabled: true },
    });

    if (inventoriesCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar la ubicación porque tiene ${inventoriesCount} inventarios asignados`,
      });
    }

    const locationToDelete = await db.inventoryLocation.findUnique({
      where: { id: parseInt(id, 10) },
    });

    const location = await db.inventoryLocation.update({
      where: { id: parseInt(id, 10) },
      data: { enabled: false },
    });

    try {
      await logAction({
        entityType: "LOCATION",
        entityId: id,
        action: "DELETE",
        userId: req.user.id,
        changes: { name: locationToDelete.name },
        entityTitle: locationToDelete.name,
      });
    } catch (logError) {
      console.error("Error logging:", logError);
    }

    res.json(location);
  } catch (error) {
    console.error("Error deleting inventory location:", error);
    res.status(500).json({ error: error.message });
  }
};
