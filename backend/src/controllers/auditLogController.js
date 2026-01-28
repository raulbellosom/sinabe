import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAuditLogs = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      userId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    // User Filter
    if (userId) where.userId = userId;

    // Entity Type Filter
    if (entityType) where.entityType = entityType;

    // Entity ID Filter
    if (entityId) where.entityId = String(entityId);

    // Date Range Filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Search Filter (Entity Title)
    if (search) {
      where.OR = [
        { entityTitle: { contains: search } },
        { changes: { contains: search } },
      ];
    }

    // Special Vertical-Event logic (preserved)
    if (entityType === "VERTICAL" && entityId) {
      const relatedEvents = await prisma.event.findMany({
        where: { verticalId: parseInt(entityId, 10) },
        select: { id: true },
      });

      const relatedEventIds = relatedEvents.map((e) => e.id);

      // If we have a specific vertical search, combine with existing filters
      // This is a complex OR, might need adjustment but sticking to simple override for now if vertical context is primary
      where.OR = [
        { entityType: "VERTICAL", entityId: String(entityId) },
        { entityType: "EVENT", entityId: { in: relatedEventIds } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photo: {
                select: { url: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};
