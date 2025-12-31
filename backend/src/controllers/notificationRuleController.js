/**
 * Controlador de Reglas de Notificación
 * Gestiona las operaciones CRUD para las reglas
 */
import { db } from "../lib/db.js";
import { runRuleNow, calculateNextRun } from "../notifications/scheduler.js";
import { getRuleRunHistory } from "../notifications/engine.js";
import {
  getAvailableRuleTypes,
  getInventoryFields,
} from "../notifications/ruleTypes/index.js";

/**
 * Obtener todas las reglas de notificación
 * Incluye información de quién creó cada regla
 */
export const getAllRules = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserEmail = req.user.email;

    const rules = await db.notificationRule.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        channels: true,
        recipients: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { runs: true },
        },
      },
    });

    // Agregar metadatos de pertenencia para cada regla
    const rulesWithMeta = rules.map((rule) => {
      const isOwner = rule.createdById === currentUserId;

      // Verificar si el usuario actual está en los destinatarios
      const recipientEntry = rule.recipients.find(
        (r) =>
          (r.kind === "USER" && r.userId === currentUserId) ||
          (r.kind === "EMAIL" && r.email === currentUserEmail)
      );
      const isRecipient = !!recipientEntry;

      return {
        ...rule,
        _meta: {
          isOwner,
          isRecipient,
          canEdit: isOwner,
          canDelete: isOwner,
          canUnsubscribe: isRecipient && !isOwner,
          recipientId: recipientEntry?.id || null,
        },
      };
    });

    res.json(rulesWithMeta);
  } catch (error) {
    console.error("Error obteniendo reglas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener las reglas de notificación" });
  }
};

/**
 * Obtener una regla por ID
 */
export const getRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await db.notificationRule.findUnique({
      where: { id },
      include: {
        channels: true,
        recipients: true,
        runs: {
          orderBy: { startedAt: "desc" },
          take: 10,
          include: {
            deliveries: true,
          },
        },
      },
    });

    if (!rule) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    res.json(rule);
  } catch (error) {
    console.error("Error obteniendo regla:", error);
    res.status(500).json({ error: "Error al obtener la regla" });
  }
};

/**
 * Crear una nueva regla de notificación
 */
export const createRule = async (req, res) => {
  try {
    const {
      name,
      description,
      ruleType,
      params,
      enabled = true,
      scheduleType = "INTERVAL",
      intervalMinutes,
      cronExpression,
      channels = [],
      recipients = [],
    } = req.body;

    // Validaciones básicas
    if (!name || !ruleType) {
      return res
        .status(400)
        .json({ error: "Nombre y tipo de regla son requeridos" });
    }

    // Calcular próxima ejecución
    const nextRunAt = enabled
      ? calculateNextRun({
          scheduleType,
          intervalMinutes,
          cronExpression,
        })
      : null;

    const rule = await db.notificationRule.create({
      data: {
        name,
        description,
        ruleType,
        params,
        enabled,
        scheduleType,
        intervalMinutes,
        cronExpression,
        nextRunAt,
        createdById: req.user.id,
        channels: {
          create: channels.map((ch) => ({
            channel: ch.channel,
            enabled: ch.enabled ?? true,
          })),
        },
        recipients: {
          create: recipients.map((r) => ({
            kind: r.kind,
            userId: r.kind === "USER" ? r.userId : null,
            email: r.kind === "EMAIL" ? r.email : null,
            emailRole: r.emailRole || "TO",
          })),
        },
      },
      include: {
        channels: true,
        recipients: true,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creando regla:", error);
    res.status(500).json({ error: "Error al crear la regla de notificación" });
  }
};

/**
 * Actualizar una regla existente
 * Solo el creador puede editar la regla
 */
export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const {
      name,
      description,
      ruleType,
      params,
      enabled,
      scheduleType,
      intervalMinutes,
      cronExpression,
      channels,
      recipients,
    } = req.body;

    // Verificar que existe
    const existing = await db.notificationRule.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    // Verificar que el usuario es el propietario
    if (existing.createdById !== currentUserId) {
      return res.status(403).json({
        error:
          "No tienes permiso para editar esta regla. Solo el creador puede modificarla.",
      });
    }

    // Determinar si cambió la configuración del schedule
    const scheduleChanged =
      (scheduleType !== undefined && scheduleType !== existing.scheduleType) ||
      (intervalMinutes !== undefined &&
        intervalMinutes !== existing.intervalMinutes) ||
      (cronExpression !== undefined &&
        cronExpression !== existing.cronExpression);

    // Calcular próxima ejecución:
    // - Si enabled es false, nextRunAt = null
    // - Si enabled es true y scheduleChanged, recalcular
    // - Si enabled es true y se estaba deshabilitado antes, recalcular
    let nextRunAt = existing.nextRunAt;
    const willBeEnabled = enabled !== undefined ? enabled : existing.enabled;

    if (!willBeEnabled) {
      // Si está deshabilitado, no hay próxima ejecución
      nextRunAt = null;
    } else if (scheduleChanged || !existing.enabled) {
      // Recalcular si cambió el schedule o si se está habilitando
      nextRunAt = calculateNextRun({
        scheduleType: scheduleType ?? existing.scheduleType,
        intervalMinutes: intervalMinutes ?? existing.intervalMinutes,
        cronExpression: cronExpression ?? existing.cronExpression,
      });
      console.log(
        `[updateRule] Recalculando nextRunAt para regla ${id}: ${nextRunAt?.toISOString()}`
      );
    }

    // Actualizar regla
    const rule = await db.notificationRule.update({
      where: { id },
      data: {
        name,
        description,
        ruleType,
        params,
        enabled,
        scheduleType,
        intervalMinutes,
        cronExpression,
        nextRunAt,
      },
    });

    // Actualizar canales si se proporcionan
    if (channels) {
      // Eliminar canales existentes y crear nuevos
      await db.notificationRuleChannel.deleteMany({
        where: { ruleId: id },
      });

      await db.notificationRuleChannel.createMany({
        data: channels.map((ch) => ({
          ruleId: id,
          channel: ch.channel,
          enabled: ch.enabled ?? true,
        })),
      });
    }

    // Actualizar destinatarios si se proporcionan
    if (recipients) {
      await db.notificationRuleRecipient.deleteMany({
        where: { ruleId: id },
      });

      await db.notificationRuleRecipient.createMany({
        data: recipients.map((r) => ({
          ruleId: id,
          kind: r.kind,
          userId: r.kind === "USER" ? r.userId : null,
          email: r.kind === "EMAIL" ? r.email : null,
          emailRole: r.emailRole || "TO",
        })),
      });
    }

    // Obtener regla actualizada con relaciones
    const updatedRule = await db.notificationRule.findUnique({
      where: { id },
      include: {
        channels: true,
        recipients: true,
      },
    });

    res.json(updatedRule);
  } catch (error) {
    console.error("Error actualizando regla:", error);
    res.status(500).json({ error: "Error al actualizar la regla" });
  }
};

/**
 * Eliminar una regla (soft delete cambiando enabled a false)
 * Solo el creador puede eliminar la regla
 */
export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    const currentUserId = req.user.id;

    const existing = await db.notificationRule.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    // Verificar que el usuario es el propietario
    if (existing.createdById !== currentUserId) {
      return res.status(403).json({
        error:
          "No tienes permiso para eliminar esta regla. Solo el creador puede eliminarla.",
      });
    }

    if (permanent === "true") {
      // Eliminación permanente
      await db.notificationRule.delete({
        where: { id },
      });
      res.json({ message: "Regla eliminada permanentemente" });
    } else {
      // Soft delete
      await db.notificationRule.update({
        where: { id },
        data: { enabled: false, nextRunAt: null },
      });
      res.json({ message: "Regla deshabilitada" });
    }
  } catch (error) {
    console.error("Error eliminando regla:", error);
    res.status(500).json({ error: "Error al eliminar la regla" });
  }
};

/**
 * Ejecutar una regla manualmente (test-run)
 */
export const testRunRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendNotifications = false } = req.body;

    const rule = await db.notificationRule.findUnique({
      where: { id },
      include: {
        channels: true,
        recipients: true,
      },
    });

    if (!rule) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    if (sendNotifications) {
      // Ejecutar completamente
      const result = await runRuleNow(id);
      res.json({
        message: "Regla ejecutada",
        ...result,
      });
    } else {
      // Solo previsualizar (evaluar sin enviar)
      const { evaluateRule } = await import(
        "../notifications/ruleTypes/index.js"
      );
      const { matches, summary } = await evaluateRule(rule);

      res.json({
        message: "Previsualización de regla",
        matchCount: matches.length,
        matches: matches.slice(0, 20), // Limitar para respuesta
        summary,
      });
    }
  } catch (error) {
    console.error("Error ejecutando test-run:", error);
    res.status(500).json({ error: "Error al ejecutar la regla" });
  }
};

/**
 * Obtener historial de ejecuciones de una regla
 */
export const getRuleHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const history = await getRuleRunHistory(id, parseInt(limit));
    res.json(history);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener el historial" });
  }
};

/**
 * Obtener tipos de regla disponibles
 */
export const getRuleTypes = async (req, res) => {
  try {
    const types = getAvailableRuleTypes();
    res.json(types);
  } catch (error) {
    console.error("Error obteniendo tipos de regla:", error);
    res.status(500).json({ error: "Error al obtener los tipos de regla" });
  }
};

/**
 * Obtener campos disponibles para el modelo Inventory
 * Usado para el multiselect dinámico de campos faltantes
 */
export const getInventoryFieldsEndpoint = async (req, res) => {
  try {
    const fields = getInventoryFields();
    res.json(fields);
  } catch (error) {
    console.error("Error obteniendo campos de inventario:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los campos de inventario" });
  }
};

/**
 * Obtener condiciones disponibles del catálogo
 * Usado para el multiselect de condiciones en reglas de notificación
 */
export const getConditionsEndpoint = async (req, res) => {
  try {
    const conditions = await db.condition.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    // Formatear para el frontend (value/label)
    const formatted = conditions.map((c) => ({
      value: c.name,
      label: c.name,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error obteniendo condiciones:", error);
    res.status(500).json({ error: "Error al obtener las condiciones" });
  }
};

/**
 * Obtener usuarios para selección de destinatarios
 */
export const getAvailableRecipients = async (req, res) => {
  try {
    const users = await db.user.findMany({
      where: { enabled: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: { name: true },
        },
        photo: {
          where: { enabled: true },
          select: {
            url: true,
            thumbnail: true,
          },
          take: 1,
        },
      },
      orderBy: { firstName: "asc" },
    });

    // Aplanar la foto (tomar la primera si existe)
    const usersWithPhoto = users.map((user) => ({
      ...user,
      photoUrl: user.photo?.[0]?.thumbnail || user.photo?.[0]?.url || null,
      photo: undefined, // Limpiar el array original
    }));

    res.json(usersWithPhoto);
  } catch (error) {
    console.error("Error obteniendo destinatarios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los usuarios disponibles" });
  }
};

/**
 * Desuscribirse de una regla de notificación
 * Permite a un usuario quitarse como destinatario de una regla que no creó
 */
export const unsubscribeFromRule = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserEmail = req.user.email;

    // Verificar que la regla existe
    const rule = await db.notificationRule.findUnique({
      where: { id },
      include: {
        recipients: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!rule) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    // No permitir desuscribirse de reglas propias (debe eliminarla si quiere)
    if (rule.createdById === currentUserId) {
      return res.status(400).json({
        error:
          "No puedes desuscribirte de una regla que tú creaste. Si deseas eliminarla, usa la opción de eliminar.",
      });
    }

    // Buscar el registro de destinatario del usuario actual
    const recipientEntry = rule.recipients.find(
      (r) =>
        (r.kind === "USER" && r.userId === currentUserId) ||
        (r.kind === "EMAIL" && r.email === currentUserEmail)
    );

    if (!recipientEntry) {
      return res.status(400).json({
        error: "No estás registrado como destinatario de esta regla.",
      });
    }

    // Eliminar al usuario de los destinatarios
    await db.notificationRuleRecipient.delete({
      where: { id: recipientEntry.id },
    });

    res.json({
      message: `Te has desuscrito de la regla "${rule.name}" creada por ${rule.createdBy.firstName} ${rule.createdBy.lastName}.`,
      ruleId: id,
    });
  } catch (error) {
    console.error("Error desuscribiendo de regla:", error);
    res.status(500).json({ error: "Error al desuscribirse de la regla" });
  }
};

/**
 * Obtener estado de lectura de las notificaciones generadas por una regla
 * Solo el creador de la regla puede ver esta información
 */
export const getRuleReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Verificar que la regla existe
    const rule = await db.notificationRule.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdById: true,
      },
    });

    if (!rule) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    // Verificar que el usuario es el propietario de la regla
    if (rule.createdById !== currentUserId) {
      return res.status(403).json({
        error:
          "Solo el creador de la regla puede ver el estado de lectura de las notificaciones.",
      });
    }

    // Obtener todas las notificaciones in-app generadas por esta regla
    // agrupadas por usuario con su estado de lectura
    const notifications = await db.inAppNotification.findMany({
      where: {
        ruleRunId: {
          in: (
            await db.notificationRuleRun.findMany({
              where: { ruleId: id },
              select: { id: true },
            })
          ).map((r) => r.id),
        },
      },
      select: {
        id: true,
        userId: true,
        title: true,
        isRead: true,
        readAt: true,
        createdAt: true,
        ruleRunId: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Obtener información de los usuarios
    const userIds = [...new Set(notifications.map((n) => n.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        photo: {
          where: { enabled: true },
          select: { thumbnail: true, url: true },
          take: 1,
        },
      },
    });

    // Crear mapa de usuarios
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photoUrl: user.photo?.[0]?.thumbnail || user.photo?.[0]?.url || null,
      };
      return acc;
    }, {});

    // Agrupar notificaciones por usuario con resumen
    const userSummary = userIds.map((userId) => {
      const userNotifications = notifications.filter(
        (n) => n.userId === userId
      );
      const totalNotifications = userNotifications.length;
      const readNotifications = userNotifications.filter(
        (n) => n.isRead
      ).length;
      const unreadNotifications = totalNotifications - readNotifications;
      const lastReadAt = userNotifications
        .filter((n) => n.readAt)
        .sort((a, b) => new Date(b.readAt) - new Date(a.readAt))[0]?.readAt;

      return {
        user: userMap[userId] || {
          id: userId,
          firstName: "Usuario",
          lastName: "Desconocido",
        },
        totalNotifications,
        readNotifications,
        unreadNotifications,
        readPercentage:
          totalNotifications > 0
            ? Math.round((readNotifications / totalNotifications) * 100)
            : 0,
        lastReadAt,
      };
    });

    // Estadísticas generales
    const totalNotifications = notifications.length;
    const totalRead = notifications.filter((n) => n.isRead).length;
    const totalUnread = totalNotifications - totalRead;

    res.json({
      ruleName: rule.name,
      summary: {
        totalNotifications,
        totalRead,
        totalUnread,
        readPercentage:
          totalNotifications > 0
            ? Math.round((totalRead / totalNotifications) * 100)
            : 0,
        recipientsCount: userIds.length,
      },
      recipients: userSummary.sort(
        (a, b) => b.readNotifications - a.readNotifications
      ),
      // Últimas 50 notificaciones con detalle
      recentNotifications: notifications.slice(0, 50).map((n) => ({
        ...n,
        user: userMap[n.userId],
      })),
    });
  } catch (error) {
    console.error("Error obteniendo estado de lectura:", error);
    res.status(500).json({ error: "Error al obtener el estado de lectura" });
  }
};
