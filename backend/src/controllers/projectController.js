import { db } from "../lib/db.js";

export const searchProjects = async (req, res) => {
  const {
    searchTerm = "",
    statuses = [],
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    pageSize = 10,
  } = req.query;
  try {
    const baseInclude = {
      deadlines: true,
      purchaseOrders: { include: { invoices: true } },

      teamMembers: true,
      documents: true,
    };

    const parsedStatuses = Array.isArray(statuses)
      ? statuses.filter((s) => !!s)
      : typeof statuses === "string" && statuses.length > 0
      ? statuses.split(",").filter((s) => !!s)
      : [];

    const where = {
      enabled: true,
      ...(parsedStatuses.length > 0 && { status: { in: parsedStatuses } }),
      OR: [
        { name: { contains: searchTerm } },
        { code: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { provider: { contains: searchTerm } },
        { purchaseOrders: { some: { description: { contains: searchTerm } } } },
        {
          purchaseOrders: {
            some: {
              invoices: {
                some: {
                  code: { contains: searchTerm },
                  inventories: {
                    some: {
                      OR: [
                        { serialNumber: { contains: searchTerm } },
                        { internalFolio: { contains: searchTerm } },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        {
          deadlines: {
            some: {
              inventoryAssignments: {
                some: {
                  inventory: {
                    OR: [
                      { serialNumber: { contains: searchTerm } },
                      { internalFolio: { contains: searchTerm } },
                    ],
                  },
                },
              },
            },
          },
        },
        { teamMembers: { some: { name: { contains: searchTerm } } } },
      ],
    };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        include: baseInclude,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      db.project.count({ where }),
    ]);

    res.json({ projects, total });
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
        deadlines: true,
        purchaseOrders: {
          include: {
            invoices: {
              include: {
                inventories: {
                  include: { model: { include: { brand: true, type: true } } },
                },
              },
            },
          },
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
      where: { id }, // <-- ya no se hace parseInt
      include: {
        deadlines: true,
        purchaseOrders: {
          include: {
            invoices: {
              include: {
                inventories: {
                  include: { model: { include: { brand: true, type: true } } },
                },
              },
            },
          },
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
      status = "PLANIFICACION", // default value
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
    const allProjects = await db.project.findMany({
      where: {
        code: { startsWith: "PROJ-" },
      },
      select: { code: true },
    });

    let maxNumber = 0;
    for (const p of allProjects) {
      const match = p.code.match(/^PROJ-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
    const nextNumber = maxNumber + 1;
    const code = `PROJ-${String(nextNumber).padStart(3, "0")}`;

    const project = await db.project.create({
      data: {
        code,
        name,
        description,
        provider,

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
      status,
      budgetTotal,
      startDate,
      endDate,
    } = req.body;

    const project = await db.project.update({
      where: { id },
      data: {
        name,
        description,
        provider,

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
      where: { id },
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
      where: { id },
      include: {
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
            invoices: {
              include: {
                inventories: {
                  include: { model: { include: { brand: true, type: true } } },
                },
              },
            },
          },
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
