import { db } from "../lib/db.js";

/**
 * Generates a snapshot of an inventory with descriptive names.
 * @param {string} id - The inventory ID.
 * @returns {Promise<object>} The snapshot object.
 */
export const getInventorySnapshot = async (id) => {
  const inventory = await db.inventory.findUnique({
    where: { id },
    include: {
      model: {
        include: {
          brand: true,
          type: true,
        },
      },
      location: true,
      conditions: {
        include: {
          condition: true,
        },
      },
      customField: {
        include: {
          customField: true,
        },
      },
      images: { where: { enabled: true } },
      files: { where: { enabled: true } },
      invoice: true,
      purchaseOrder: true,
    },
  });

  if (!inventory) return null;

  return {
    id: inventory.id,
    internalFolio: inventory.internalFolio,
    serialNumber: inventory.serialNumber,
    activeNumber: inventory.activeNumber,
    status: inventory.status,
    model: inventory.model?.name || "N/A",
    brand: inventory.model?.brand?.name || "N/A",
    type: inventory.model?.type?.name || "N/A",
    location: inventory.location?.name || "Sin Ubicación",
    conditions: inventory.conditions
      .map((c) => c.condition.name)
      .sort()
      .join(", "),
    customFields: inventory.customField
      .map((f) => `${f.customField.name}: ${f.value}`)
      .sort()
      .join(", "),
    images: inventory.images
      .map((i) => i.metadata?.originalname || i.url.split("/").pop())
      .sort()
      .join(", "),
    files: inventory.files
      .map((f) => f.metadata?.originalname || f.url.split("/").pop())
      .sort()
      .join(", "),
    invoice: inventory.invoice?.code || "N/A",
    purchaseOrder: inventory.purchaseOrder?.code || "N/A",
    receptionDate: inventory.receptionDate
      ? inventory.receptionDate.toISOString().split("T")[0]
      : null,
    comments: inventory.comments,
  };
};

/**
 * Generates a diff between two objects.
 * @param {object} oldObj - The old object.
 * @param {object} newObj - The new object.
 * @returns {object} The diff object { field: { old, new } }.
 */
export const generateDiff = (oldObj, newObj) => {
  const diff = {};
  if (!oldObj || !newObj) return diff;

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    // Simple comparison, ignoring undefined/null mismatch if they are effectively empty
    const isEmpty = (val) => val === null || val === undefined || val === "";

    if (isEmpty(oldValue) && isEmpty(newValue)) continue;

    if (oldValue !== newValue) {
      // Special handling for arrays or complex types if needed, but for now string comparison is enough for names
      diff[key] = {
        old: oldValue || "N/A",
        new: newValue || "N/A",
      };
    }
  }
  return diff;
};
