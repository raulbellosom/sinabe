import { PrismaClient } from "@prisma/client";
import { logAction } from "../services/logger.service.js";
import { createDirectNotification } from "../notifications/channels/inAppChannel.js";

const prisma = new PrismaClient();

export const getEvents = async (req, res) => {
  try {
    const { verticalId, startDate, endDate, type, scope } = req.query;

    const where = {};

    if (verticalId) {
      where.verticalId = parseInt(verticalId);
    }

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) {
      where.type = type; // MAINTENANCE | GENERAL
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        vertical: {
          select: { id: true, name: true },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                photo: true,
              },
            },
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

// ... (existing helper function imports if any)

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledDate,
      provider,
      verticalId,
      isRecurring,
      recurrence,
      recurrenceEndDate,
      type,
      scope,
      attendeeIds,
    } = req.body;

    const baseEventData = {
      title,
      description,
      provider,
      verticalId: verticalId ? parseInt(verticalId) : null,
      isRecurring: isRecurring || false,
      recurrence,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
      type: type || "MAINTENANCE",
      scope: scope || "GLOBAL",
      createdById: req.user.id,
    };

    const seriesId = isRecurring ? uuidv4() : null;

    // Determine dates to create
    const datesToCreate = [new Date(scheduledDate)];

    if (isRecurring && recurrence && recurrenceEndDate) {
      let nextDate = dayjs(scheduledDate);
      const end = dayjs(recurrenceEndDate);

      while (true) {
        if (recurrence === "DAILY") {
          nextDate = nextDate.add(1, "day");
        } else if (recurrence === "WEEKLY") {
          nextDate = nextDate.add(1, "week");
        } else if (recurrence === "MONTHLY") {
          nextDate = nextDate.add(1, "month");
        } else if (recurrence === "BIMONTHLY") {
          nextDate = nextDate.add(2, "month");
        } else if (recurrence === "QUARTERLY") {
          nextDate = nextDate.add(3, "month");
        } else if (recurrence === "QUADRIMESTRAL") {
          nextDate = nextDate.add(4, "month");
        } else if (recurrence === "SEMIANNUAL") {
          nextDate = nextDate.add(6, "month");
        } else if (recurrence === "YEARLY") {
          nextDate = nextDate.add(1, "year");
        } else {
          break;
        }

        if (nextDate.isAfter(end)) break;
        datesToCreate.push(nextDate.toDate());
      }
    }

    // Create all events
    const eventsCreated = [];
    for (const date of datesToCreate) {
      const event = await prisma.event.create({
        data: {
          ...baseEventData,
          scheduledDate: date,
          seriesId,
          attendees:
            attendeeIds && attendeeIds.length > 0
              ? {
                  create: attendeeIds.map((uid) => ({ userId: uid })),
                }
              : undefined,
        },
      });
      eventsCreated.push(event);
    }

    await logAction({
      entityType: "EVENT",
      entityId: eventsCreated[0].id,
      action: "CREATE",
      userId: req.user.id,
      changes: {
        eventTitle: title,
        title,
        scheduledDate,
        type: type || "MAINTENANCE",
        scope: scope || "GLOBAL",
        isRecurring,
        recurrence,
        count: eventsCreated.length,
      },
      entityTitle: title,
    });

    // Send notifications to attendees (only for first event to avoid spam, or handle logic differently)
    if (attendeeIds && attendeeIds.length > 0) {
      // ... (existing notification logic, maybe improved to say "Recurring series")
      const formattedDate = new Date(scheduledDate).toLocaleString("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
      });
      for (const userId of attendeeIds) {
        if (userId !== req.user.id) {
          await createDirectNotification({
            userId,
            title: "Nuevo Evento Asignado",
            body:
              `Has sido invitado al evento "${title}" programado para el ${formattedDate}` +
              (isRecurring ? ` (Recurrente: ${recurrence})` : ""),
            link: `/agenda?date=${new Date(scheduledDate).toISOString().split("T")[0]}`,
            creatorId: req.user.id,
          });
        }
      }
    }

    res.status(201).json(eventsCreated[0]);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      scheduledDate,
      status,
      completedDate,
      provider,
      verticalId,
      isRecurring,
      recurrence,
      type,
      scope,
      attendeeIds,
      recurrenceEndDate,
    } = req.body;

    // Get current event to check changes
    const currentEvent = await prisma.event.findUnique({
      where: { id },
      include: { attendees: true },
    });

    if (!currentEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const data = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
      ...(status && { status }),
      ...(completedDate && { completedDate: new Date(completedDate) }),
      ...(provider !== undefined && { provider }),
      ...(verticalId !== undefined && {
        verticalId: verticalId ? parseInt(verticalId) : null,
      }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurrence !== undefined && { recurrence }),
      ...(recurrenceEndDate !== undefined && {
        recurrenceEndDate: recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : null,
      }),
      ...(type && { type }),
      ...(scope && { scope }),
    };

    // Handle Attendees Update
    if (attendeeIds) {
      data.attendees = {
        deleteMany: {},
        create: attendeeIds.map((uid) => ({ userId: uid })),
      };
    }

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    // START RECURRENCE LOGIC

    // Case 1: Turning ON recurrence (was false/null, now true)
    if (
      !currentEvent.isRecurring &&
      isRecurring === true &&
      recurrence &&
      recurrenceEndDate
    ) {
      const seriesId = currentEvent.seriesId || uuidv4();

      // Update current event with seriesId if needed
      if (!currentEvent.seriesId) {
        await prisma.event.update({ where: { id }, data: { seriesId } });
      }

      // Generate future events
      const datesToCreate = [];
      let nextDate = dayjs(scheduledDate || currentEvent.scheduledDate);
      const end = dayjs(recurrenceEndDate);

      while (true) {
        if (recurrence === "DAILY") nextDate = nextDate.add(1, "day");
        else if (recurrence === "WEEKLY") nextDate = nextDate.add(1, "week");
        else if (recurrence === "MONTHLY") nextDate = nextDate.add(1, "month");
        else if (recurrence === "BIMONTHLY")
          nextDate = nextDate.add(2, "month");
        else if (recurrence === "QUARTERLY")
          nextDate = nextDate.add(3, "month");
        else if (recurrence === "QUADRIMESTRAL")
          nextDate = nextDate.add(4, "month");
        else if (recurrence === "SEMIANNUAL")
          nextDate = nextDate.add(6, "month");
        else if (recurrence === "YEARLY") nextDate = nextDate.add(1, "year");
        else break;

        if (nextDate.isAfter(end)) break;
        datesToCreate.push(nextDate.toDate());
      }

      for (const date of datesToCreate) {
        await prisma.event.create({
          data: {
            title: title || currentEvent.title,
            description: description ?? currentEvent.description,
            provider: provider ?? currentEvent.provider,
            verticalId: verticalId ?? currentEvent.verticalId,
            type: type || currentEvent.type,
            scope: scope || currentEvent.scope,
            createdById: req.user.id,
            scheduledDate: date,
            seriesId,
            isRecurring: true,
            recurrence: recurrence,
            recurrenceEndDate: new Date(recurrenceEndDate),
            attendees: {
              // Copy attendees
              create: (
                attendeeIds || currentEvent.attendees.map((a) => a.userId)
              ).map((uid) => ({ userId: uid })),
            },
          },
        });
      }
    }

    // START RECURRENCE LOGIC
    // If turning OFF recurring (was true, now false), delete FUTURE events in series
    if (
      currentEvent.isRecurring &&
      isRecurring === false &&
      currentEvent.seriesId
    ) {
      const futureEvents = await prisma.event.deleteMany({
        where: {
          seriesId: currentEvent.seriesId,
          scheduledDate: { gt: currentEvent.scheduledDate }, // Only future from THIS event
          id: { not: id }, // Sanity check
        },
      });

      if (futureEvents.count > 0) {
        await logAction({
          entityType: "EVENT",
          entityId: id,
          action: "DELETE_SERIES",
          userId: req.user.id,
          changes: {
            eventTitle: currentEvent.title,
            count: futureEvents.count,
            reason: "Recurrence disabled",
          },
        });
      }
    }
    // END RECURRENCE LOGIC

    await logAction({
      entityType: "EVENT",
      entityId: event.id,
      action: "UPDATE",
      userId: req.user.id,
      changes: {
        eventTitle: currentEvent.title,
        ...data,
      },
      entityTitle: title || currentEvent.title,
    });

    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: { title: true },
    });

    await prisma.event.delete({
      where: { id },
    });

    await logAction({
      entityType: "EVENT",
      entityId: id,
      action: "DELETE",
      userId: req.user.id,
      changes: {
        eventTitle: event?.title || "Unknown",
      },
      entityTitle: event?.title || "Unknown",
    });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
};
