import { PrismaClient } from "@prisma/client";
import { logAction } from "../services/logger.service.js";

const prisma = new PrismaClient();

// Get maintenance events (filter by vertical or date range)
export const getMaintenanceEvents = async (req, res) => {
  try {
    const { verticalId, startDate, endDate, status } = req.query;

    const where = {};
    if (verticalId) where.verticalId = Number(verticalId);
    if (status) where.status = status;
    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.maintenanceEvent.findMany({
      where,
      include: {
        vertical: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching maintenance events:", error);
    res.status(500).json({ error: "Failed to fetch maintenance events" });
  }
};

// Create a new maintenance event
export const createMaintenanceEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledDate,
      verticalId,
      provider,
      isRecurring,
      recurrence,
    } = req.body;
    const userId = req.user.id;

    const event = await prisma.maintenanceEvent.create({
      data: {
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        verticalId: Number(verticalId),
        provider,
        isRecurring: Boolean(isRecurring),
        recurrence,
        createdById: userId,
        status: "SCHEDULED",
      },
    });

    // Log action
    await logAction({
      entityType: "MAINTENANCE",
      entityId: event.id,
      action: "CREATE",
      userId,
      changes: { event },
      entityTitle: event.title,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating maintenance event:", error);
    res.status(500).json({ error: "Failed to create maintenance event" });
  }
};

// Update an existing maintenance event
export const updateMaintenanceEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      scheduledDate,
      status,
      provider,
      completedDate,
    } = req.body;
    const userId = req.user.id;

    const existingEvent = await prisma.maintenanceEvent.findUnique({
      where: { id },
    });
    if (!existingEvent)
      return res.status(404).json({ error: "Event not found" });

    const updateData = {
      title,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      status,
      provider,
      completedDate: completedDate ? new Date(completedDate) : undefined,
    };

    // If marking as COMPLETED and no date provided, use now
    if (
      status === "COMPLETED" &&
      !completedDate &&
      existingEvent.status !== "COMPLETED"
    ) {
      updateData.completedDate = new Date();
    }

    const updatedEvent = await prisma.maintenanceEvent.update({
      where: { id },
      data: updateData,
    });

    // Log action
    await logAction({
      entityType: "MAINTENANCE",
      entityId: id,
      action: "UPDATE",
      userId,
      changes: { before: existingEvent, after: updatedEvent },
      entityTitle: updatedEvent.title,
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating maintenance event:", error);
    res.status(500).json({ error: "Failed to update maintenance event" });
  }
};

// Delete a maintenance event
export const deleteMaintenanceEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingEvent = await prisma.maintenanceEvent.findUnique({
      where: { id },
    });
    if (!existingEvent)
      return res.status(404).json({ error: "Event not found" });

    await prisma.maintenanceEvent.delete({ where: { id } });

    // Log action
    await logAction({
      entityType: "MAINTENANCE",
      entityId: id,
      action: "DELETE",
      userId,
      changes: { deletedEvent: existingEvent },
      entityTitle: existingEvent.title,
    });

    res.json({ message: "Maintenance event deleted" });
  } catch (error) {
    console.error("Error deleting maintenance event:", error);
    res.status(500).json({ error: "Failed to delete maintenance event" });
  }
};
