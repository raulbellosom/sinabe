import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates an audit log entry.
 * @param {string} entityType - The type of entity (e.g., 'VERTICAL', 'INVENTORY').
 * @param {string} entityId - The ID of the entity.
 * @param {string} action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE').
 * @param {string} entityTitle - The readable name/title of the entity.
 * @param {string} userId - The ID of the user performing the action.
 * @param {object} changes - Object detailing the changes (optional).
 */
export const logAction = async ({
  entityType,
  entityId,
  action,
  entityTitle,
  userId,
  changes,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId: String(entityId),
        action,
        entityTitle,
        userId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    // We intentionally don't throw here to avoid failing the main operation if logging fails
  }
};
