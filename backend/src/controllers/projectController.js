import { db } from "../lib/db.js";

// Utilidad opcional para validación de permisos
// const getUserPermissions = async (userId) => {
//   const user = await db.user.findUnique({
//     where: { id: userId },
//     include: {
//       role: {
//         include: {
//           permissions: {
//             include: { permission: true },
//           },
//         },
//       },
//     },
//   });

//   if (!user) return [];
//   return user.role.permissions.map((p) => p.permission.name);
// };

// 🔍 Buscar proyectos (nombre, código, proveedor, vertical, inventarios, OCs, facturas)
export const searchProjects = async (req, res) => {
  const { searchTerm = "" } = req.query;

  try {
    const baseInclude = {
      verticals: true,
      deadlines: true,
      purchaseOrders: { include: { invoices: true } },
      inventories: {
        include: { model: { include: { brand: true, type: true } } },
      },
      teamMembers: true,
      documents: true,
    };

    // Si no hay término de búsqueda, retorna todos
    if (!searchTerm || searchTerm.trim() === "") {
      const allProjects = await db.project.findMany({
        where: { enabled: true },
        include: baseInclude,
      });
      return res.json(allProjects);
    }

    // Si sí hay término, aplica búsqueda profunda
    const projects = await db.project.findMany({
      where: {
        enabled: true,
        OR: [
          { name: { contains: searchTerm } },
          { code: { contains: searchTerm } },
          { provider: { contains: searchTerm } },
          { verticals: { some: { name: { contains: searchTerm } } } }, // CORREGIDO: vertical es objeto
          {
            purchaseOrders: {
              some: { description: { contains: searchTerm } },
            },
          },
          {
            purchaseOrders: {
              some: {
                invoices: {
                  some: { code: { contains: searchTerm } },
                },
              },
            },
          },
          {
            inventories: {
              some: { serialNumber: { contains: searchTerm } },
            },
          },
          {
            inventories: {
              some: { internalFolio: { contains: searchTerm } },
            },
          },
          {
            teamMembers: {
              some: { name: { contains: searchTerm } },
            },
          },
        ],
      },
      include: baseInclude,
    });

    res.json(projects);
  } catch (error) {
    console.error("Error searching projects:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Obtener todos los proyectos activos
export const getProjects = async (req, res) => {
  try {
    const projects = await db.project.findMany({
      where: { enabled: true },
      include: {
        verticals: true,
        deadlines: true,
        purchaseOrders: { include: { invoices: true } },
        inventories: {
          include: { model: { include: { brand: true, type: true } } },
        },
        teamMembers: true,
        documents: true,
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Obtener uno por ID
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await db.project.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        verticals: true,
        deadlines: true,
        purchaseOrders: { include: { invoices: true } },
        inventories: {
          include: { model: { include: { brand: true, type: true } } },
        },
        teamMembers: true,
        documents: true,
      },
    });

    if (!project || !project.enabled) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear nuevo proyecto
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      provider,
      verticalIds,
      status = "Planificación", // default value
      budgetTotal,
      startDate,
      endDate,
    } = req.body;

    // Validar fechas
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        error: "La fecha de inicio no puede ser posterior a la fecha de fin.",
      });
    }

    // Generar código único
    const lastProject = await db.project.findFirst({
      orderBy: { id: "desc" },
    });

    const nextId = (lastProject?.id || 0) + 1;
    const code = `PROJ-${String(nextId).padStart(3, "0")}`;

    const project = await db.project.create({
      data: {
        code,
        name,
        description,
        provider,
        verticals: {
          connect: verticalIds.map((id) => ({ id })),
        },
        status,
        budgetTotal: parseFloat(budgetTotal),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        enabled: true,
        createdById: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar proyecto
export const updateProject = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      name,
      description,
      provider,
      verticalIds,
      status,
      budgetTotal,
      startDate,
      endDate,
    } = req.body;

    const project = await db.project.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        description,
        provider,
        verticals: {
          set: verticalIds.map((id) => ({ id })),
        },
        status,
        budgetTotal: parseFloat(budgetTotal),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminación lógica
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    await db.project.update({
      where: { id: parseInt(id, 10) },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getProjectSummary = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await db.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        verticals: true,
        deadlines: {
          include: {
            inventoryAssignments: {
              include: {
                inventory: {
                  include: { model: { include: { brand: true, type: true } } },
                },
              },
            },
            tasks: true,
          },
        },
        purchaseOrders: {
          include: {
            invoices: true,
          },
        },
        inventories: {
          include: { model: { include: { brand: true, type: true } } },
        },
        documents: true,
        teamMembers: true,
      },
    });

    if (!project || !project.enabled) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project summary:", error.message);
    res.status(500).json({ error: error.message });
  }
};
