/**
 * Regla: Recordatorio de Entregas (Deadlines)
 * Notifica sobre entregas próximas a vencer o vencidas
 */
import { db } from "../../lib/db.js";
import { addDays, isPast, format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Evalúa la regla de recordatorio de entregas
 */
export const evaluateDeadlineReminder = async (rule) => {
  const params = rule.params || {};
  const {
    daysBeforeDue = 7,
    includeOverdue = true,
    statuses = ["PENDIENTE", "EN_PROGRESO"],
  } = params;

  const now = new Date();
  const futureLimit = addDays(now, daysBeforeDue);

  // Construir filtro de estados
  const statusFilter = statuses.map((s) => ({ status: s }));

  // Construir condiciones para fechas
  const dateConditions = [
    // Próximos a vencer
    {
      dueDate: {
        gte: now,
        lte: futureLimit,
      },
    },
  ];

  // Incluir vencidos si está habilitado
  if (includeOverdue) {
    dateConditions.push({
      dueDate: {
        lt: now,
      },
    });
  }

  const deadlines = await db.deadline.findMany({
    where: {
      enabled: true,
      OR: statusFilter,
      AND: [
        {
          OR: dateConditions,
        },
      ],
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      tasks: {
        where: { enabled: true },
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  // Formatear coincidencias
  const matches = deadlines.map((deadline) => {
    const isOverdue = isPast(deadline.dueDate);
    const daysRemaining = Math.ceil(
      (deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: deadline.id,
      name: deadline.name,
      project: deadline.project?.name || "Sin proyecto",
      projectCode: deadline.project?.code || "N/A",
      dueDate: format(deadline.dueDate, "dd/MM/yyyy", { locale: es }),
      status: deadline.status,
      statusLabel: getStatusLabel(deadline.status),
      isOverdue,
      daysRemaining: isOverdue
        ? `Vencido hace ${Math.abs(daysRemaining)} días`
        : `${daysRemaining} días restantes`,
      assignedTo:
        deadline.users.map((u) => `${u.firstName} ${u.lastName}`).join(", ") ||
        "Sin asignar",
      tasksCount: deadline.tasks.length,
      completedTasks: deadline.tasks.filter((t) => t.status === "COMPLETADO")
        .length,
    };
  });

  // Generar link con IDs de proyectos afectados (únicos)
  const projectIds = [
    ...new Set(deadlines.map((d) => d.project?.id).filter(Boolean)),
  ];
  const link =
    projectIds.length > 0
      ? `/projects?ids=${projectIds.join(",")}`
      : "/projects";

  const summary = {
    columns: [
      { key: "name", label: "Entrega" },
      { key: "project", label: "Proyecto" },
      { key: "dueDate", label: "Fecha Límite" },
      { key: "statusLabel", label: "Estado" },
      { key: "daysRemaining", label: "Tiempo" },
      { key: "assignedTo", label: "Asignado a" },
    ],
    link,
    message: `Entregas próximas a vencer o vencidas`,
  };

  return { matches, summary };
};

/**
 * Obtiene la etiqueta legible del estado
 */
const getStatusLabel = (status) => {
  const labels = {
    PENDIENTE: "Pendiente",
    EN_PROGRESO: "En Progreso",
    EN_REVISION: "En Revisión",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
    BLOQUEADO: "Bloqueado",
  };
  return labels[status] || status;
};
