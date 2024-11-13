import { db } from "../lib/db.js";

export const getCustomFields = async (req, res) => {
  try {
    const customFields = await db.customField.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
    });
    res.json(customFields);
  } catch (error) {
    console.log("Error in getCustomFields", error);
    res.status(500).json({ message: error.message });
  }
};

export const createCustomField = async (req, res) => {
  const { name } = req.body;

  try {
    // Verificar si el campo ya existe
    const existingField = await db.customField.findFirst({
      where: { name, enabled: true },
    });

    if (existingField) {
      return res.status(400).json({ message: "Custom field already exists" });
    }

    // Crear el nuevo campo personalizado
    const newCustomField = await db.customField.create({
      data: { name, enabled: true },
    });

    res.status(201).json(newCustomField);
  } catch (error) {
    console.log("Error in createCustomField", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCustomFieldValues = async (req, res) => {
  const { customFieldId } = req.params;
  const { query } = req.query;
  try {
    const values = await db.inventoryCustomField.findMany({
      where: {
        customFieldId: parseInt(customFieldId, 10),
        value: { contains: query },
      },
      select: { value: true },
      distinct: ["value"],
    });

    res.json(values.map((v) => v.value));
  } catch (error) {
    console.log("Error in getCustomFieldValues", error);
    res.status(500).json({ message: error.message });
  }
};

export const addCustomFieldValue = async (req, res) => {
  const { inventoryId, customFieldId, value } = req.body;

  try {
    const existingValue = await db.inventoryCustomField.findFirst({
      where: {
        inventoryId,
        customFieldId,
        value,
      },
    });

    if (existingValue) {
      return res
        .status(400)
        .json({ message: "Value already exists for this inventory" });
    }

    // Agregar el valor
    const customFieldValue = await db.inventoryCustomField.create({
      data: {
        inventoryId,
        customFieldId,
        value,
      },
    });

    res.status(201).json(customFieldValue);
  } catch (error) {
    console.log("Error in addCustomFieldValue", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomField = async (req, res) => {
  const { id } = req.params; // ID del CustomField a actualizar
  const { name } = req.body; // Nuevo nombre del CustomField

  try {
    // Verificar si el CustomField existe
    const existingCustomField = await db.customField.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingCustomField) {
      return res.status(404).json({ message: "CustomField not found" });
    }

    // Verificar si ya existe otro CustomField con el mismo nombre
    const nameExists = await db.customField.findFirst({
      where: { name, enabled: true },
    });

    if (nameExists) {
      return res
        .status(400)
        .json({ message: "A CustomField with this name already exists" });
    }

    // Actualizar el nombre del CustomField
    const updatedCustomField = await db.customField.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });

    res.json({
      id: updatedCustomField.id,
      name: updatedCustomField.name,
      message: "CustomField updated successfully",
    });
  } catch (error) {
    console.error("Error updating CustomField:", error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un CustomField (Deshabilitar)
export const deleteCustomField = async (req, res) => {
  const { id } = req.params; // ID del CustomField a eliminar

  try {
    // Verificar si el CustomField existe y está habilitado
    const existingCustomField = await db.customField.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!existingCustomField) {
      return res
        .status(404)
        .json({ message: "CustomField not found or already disabled" });
    }

    // Deshabilitar el CustomField
    await db.customField.update({
      where: { id: parseInt(id, 10) },
      data: { enabled: false },
    });

    res.json({ id, message: "CustomField deleted (disabled) successfully" });
  } catch (error) {
    console.error("Error deleting CustomField:", error);
    res.status(500).json({ message: error.message });
  }
};
