import { db } from "../lib/db.js";
import {
  subDays,
  subMonths,
  format,
  startOfDay,
  isAfter,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

// 🔔 Obtener notificaciones del usuario
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 20, unreadOnly = false } = req.query;

    const skip = (page - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const whereConditions = {
      userId,
      ...(unreadOnly === "true" && { read: false }),
    };

    const notifications = await db.notification.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    const totalRecords = await db.notification.count({
      where: whereConditions,
    });

    const unreadCount = await db.notification.count({
      where: { userId, read: false },
    });

    res.json({
      data: notifications,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        currentPage: parseInt(page),
        pageSize: take,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Marcar notificación como leída
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    res.json(notification);
  } catch (error) {
    console.error("Error marcando notificación como leída:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Marcar todas las notificaciones del usuario como leídas
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error(
      "Error marcando todas las notificaciones como leídas:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Eliminar notificación
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.notification.delete({
      where: { id: notificationId },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando notificación:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📊 Obtener estadísticas de notificaciones
export const getNotificationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.notification.groupBy({
      by: ["read"],
      where: { userId },
      _count: { _all: true },
    });

    const result = {
      total: stats.reduce((acc, stat) => acc + stat._count._all, 0),
      read: stats.find((s) => s.read === true)?._count._all || 0,
      unread: stats.find((s) => s.read === false)?._count._all || 0,
    };

    res.json(result);
  } catch (error) {
    console.error(
      "Error obteniendo estadísticas de notificaciones:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Análisis de inventarios para notificaciones automáticas
export const analyzeInventoriesForNotifications = async (req, res) => {
  try {
    const results = await runInventoryAnalysis();
    res.json({
      message: "Análisis completado",
      results,
    });
  } catch (error) {
    console.error("Error en análisis de inventarios:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📧 Función principal para analizar inventarios y generar notificaciones
export const runInventoryAnalysis = async () => {
  const results = {
    newInventoriesWithoutAssignment: 0,
    inventoriesWithoutUse: 0,
    inventoriesInDeadlineNotUsed: 0,
    notificationsSent: 0,
    emailsSent: 0,
  };

  try {
    // 1. Inventarios nuevos sin asignar (>2 meses)
    const twoMonthsAgo = subMonths(new Date(), 2);
    const newUnassignedInventories = await findNewUnassignedInventories(
      twoMonthsAgo
    );
    results.newInventoriesWithoutAssignment = newUnassignedInventories.length;

    if (newUnassignedInventories.length > 0) {
      await createNotificationsForAdmins(
        "Inventarios nuevos sin asignar",
        `Se encontraron ${newUnassignedInventories.length} inventarios nuevos sin asignar desde hace más de 2 meses`,
        {
          type: "NEW_INVENTORIES_UNASSIGNED",
          count: newUnassignedInventories.length,
          inventories: newUnassignedInventories.map((inv) => ({
            id: inv.id,
            serialNumber: inv.serialNumber,
            model: inv.model?.name,
            receptionDate: inv.receptionDate,
          })),
        }
      );
      results.notificationsSent++;
    }

    // 2. Inventarios sin uso >6 meses
    const sixMonthsAgo = subMonths(new Date(), 6);
    const unusedInventories = await findUnusedInventories(sixMonthsAgo);
    results.inventoriesWithoutUse = unusedInventories.length;

    if (unusedInventories.length > 0) {
      await createNotificationsForInventoryManagers(
        "Inventarios sin uso prolongado",
        `Se encontraron ${unusedInventories.length} inventarios sin uso desde hace más de 6 meses`,
        {
          type: "INVENTORIES_UNUSED_LONG_TIME",
          count: unusedInventories.length,
          inventories: unusedInventories.map((inv) => ({
            id: inv.id,
            serialNumber: inv.serialNumber,
            model: inv.model?.name,
            lastUsed: inv.receptionDate,
          })),
        }
      );
      results.notificationsSent++;
    }

    // 3. Inventarios en deadline pero no usados
    const sevenDaysAgo = subDays(new Date(), 7);
    const deadlineUnusedInventories = await findDeadlineUnusedInventories(
      sevenDaysAgo
    );
    results.inventoriesInDeadlineNotUsed = deadlineUnusedInventories.length;

    if (deadlineUnusedInventories.length > 0) {
      await createNotificationsForProjectMembers(
        deadlineUnusedInventories,
        "Inventarios asignados a deadline sin uso",
        "Hay inventarios asignados a sus deadlines que no han sido marcados como 'En uso'",
        {
          type: "DEADLINE_INVENTORIES_NOT_USED",
          count: deadlineUnusedInventories.length,
        }
      );
      results.notificationsSent++;
    }

    return results;
  } catch (error) {
    console.error("Error en runInventoryAnalysis:", error);
    throw error;
  }
};

// 🔍 Buscar inventarios nuevos sin asignar
const findNewUnassignedInventories = async (cutoffDate) => {
  return await db.inventory.findMany({
    where: {
      enabled: true,
      status: "ALTA",
      receptionDate: {
        lt: cutoffDate,
      },
      InventoryDeadline: {
        none: {},
      },
      // Inventarios con condición "nuevo" o "sin usar"
      conditions: {
        some: {
          condition: {
            name: {
              in: ["Nuevo", "Sin usar", "Sin uso"],
            },
          },
        },
      },
    },
    include: {
      model: {
        include: {
          brand: true,
          type: true,
        },
      },
      conditions: {
        include: {
          condition: true,
        },
      },
    },
  });
};

// 🔍 Buscar inventarios sin uso >6 meses
const findUnusedInventories = async (cutoffDate) => {
  return await db.inventory.findMany({
    where: {
      enabled: true,
      status: "ALTA",
      receptionDate: {
        lt: cutoffDate,
      },
      InventoryDeadline: {
        none: {},
      },
      // Sin condición "En uso"
      NOT: {
        conditions: {
          some: {
            condition: {
              name: {
                in: ["En uso", "En funcionamiento", "Activo"],
              },
            },
          },
        },
      },
    },
    include: {
      model: {
        include: {
          brand: true,
          type: true,
        },
      },
      conditions: {
        include: {
          condition: true,
        },
      },
    },
  });
};

// 🔍 Buscar inventarios en deadline pero no usados
const findDeadlineUnusedInventories = async (cutoffDate) => {
  return await db.inventory.findMany({
    where: {
      enabled: true,
      status: "ALTA",
      InventoryDeadline: {
        some: {
          deadline: {
            enabled: true,
            createdAt: {
              lt: cutoffDate,
            },
          },
        },
      },
      // Sin condición "En uso"
      NOT: {
        conditions: {
          some: {
            condition: {
              name: {
                in: ["En uso", "En funcionamiento", "Activo"],
              },
            },
          },
        },
      },
    },
    include: {
      model: {
        include: {
          brand: true,
          type: true,
        },
      },
      InventoryDeadline: {
        include: {
          deadline: {
            include: {
              project: true,
              users: true,
            },
          },
        },
      },
    },
  });
};

// 📧 Crear notificaciones para administradores
const createNotificationsForAdmins = async (title, body, metadata) => {
  // Buscar usuarios con roles de administrador
  const adminUsers = await db.user.findMany({
    where: {
      enabled: true,
      role: {
        name: {
          in: ["Administrador", "Admin", "Root"], // Ajusta según tus roles
        },
      },
    },
  });

  const notifications = adminUsers.map((user) => ({
    userId: user.id,
    title,
    body,
    metadata,
  }));

  if (notifications.length > 0) {
    await db.notification.createMany({
      data: notifications,
    });
  }

  return notifications.length;
};

// 📧 Crear notificaciones para gestores de inventario
const createNotificationsForInventoryManagers = async (
  title,
  body,
  metadata
) => {
  // Buscar usuarios con permisos de inventario
  const inventoryUsers = await db.user.findMany({
    where: {
      enabled: true,
      role: {
        permissions: {
          some: {
            permission: {
              name: {
                in: ["view_inventory", "manage_inventory"], // Ajusta según tus permisos
              },
            },
          },
        },
      },
    },
  });

  const notifications = inventoryUsers.map((user) => ({
    userId: user.id,
    title,
    body,
    metadata,
  }));

  if (notifications.length > 0) {
    await db.notification.createMany({
      data: notifications,
    });
  }

  return notifications.length;
};

// 📧 Crear notificaciones para miembros de proyecto
const createNotificationsForProjectMembers = async (
  inventories,
  title,
  body,
  metadata
) => {
  const userNotifications = new Map();

  // Agrupar por usuarios únicos de todos los proyectos
  for (const inventory of inventories) {
    for (const invDeadline of inventory.InventoryDeadline) {
      for (const user of invDeadline.deadline.users) {
        if (user.enabled) {
          const key = user.id;
          if (!userNotifications.has(key)) {
            userNotifications.set(key, {
              userId: user.id,
              title,
              body,
              metadata: {
                ...metadata,
                projectsAffected: [],
                inventoriesAffected: [],
              },
            });
          }

          const notification = userNotifications.get(key);

          // Agregar proyecto si no existe
          const projectExists = notification.metadata.projectsAffected.some(
            (p) => p.id === invDeadline.deadline.project.id
          );
          if (!projectExists) {
            notification.metadata.projectsAffected.push({
              id: invDeadline.deadline.project.id,
              name: invDeadline.deadline.project.name,
            });
          }

          // Agregar inventario
          notification.metadata.inventoriesAffected.push({
            id: inventory.id,
            serialNumber: inventory.serialNumber,
            model: inventory.model?.name,
          });
        }
      }
    }
  }

  if (userNotifications.size > 0) {
    await db.notification.createMany({
      data: Array.from(userNotifications.values()),
    });
  }

  return userNotifications.size;
};
