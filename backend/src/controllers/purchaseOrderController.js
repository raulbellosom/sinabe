// controllers/purchaseOrderController.js
import { db } from "../lib/db.js";

// 🔄 Obtener órdenes de compra de un proyecto (con facturas e inventarios relacionados)
export const getPurchaseOrdersByProjectId = async (req, res) => {
  const { projectId } = req.params;
  try {
    const orders = await db.purchaseOrder.findMany({
      where: {
        projectId,
        enabled: true,
      },
      include: {
        invoices: {
          where: { enabled: true },
          include: { inventories: true },
        },
        inventories: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error getting purchase orders:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear orden de compra
export const createPurchaseOrder = async (req, res) => {
  const { projectId } = req.params;
  const { code, supplier, description } = req.body;

  try {
    const order = await db.purchaseOrder.create({
      data: {
        projectId,
        code,
        supplier,
        description,
        enabled: true,
        createdById: req.user.id,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear orden de compra sin proyecto asignado
export const createPurchaseOrderWithoutProject = async (req, res) => {
  const { code, supplier, description } = req.body;

  try {
    const order = await db.purchaseOrder.create({
      data: {
        projectId: null, // Sin proyecto asignado
        code,
        supplier,
        description,
        enabled: true,
        createdById: req.user.id,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(
      "Error creating purchase order without project:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar orden de compra
export const updatePurchaseOrder = async (req, res) => {
  const { id } = req.params;
  const { code, supplier, description } = req.body;

  try {
    const order = await db.purchaseOrder.update({
      where: { id },
      data: {
        code,
        supplier,
        description,
      },
    });

    res.json(order);
  } catch (error) {
    console.error("Error updating purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminación lógica de orden de compra
export const deletePurchaseOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await db.purchaseOrder.update({
      where: { id },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔎 Buscador de órdenes de compra (incluye facturas e inventarios relacionados)
export const searchPurchaseOrders = async (req, res) => {
  const { projectId } = req.params;
  const {
    searchTerm = "",
    statuses = [],
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    pageSize = 10,
  } = req.query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedPageSize = parseInt(pageSize, 10) || 10;
  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  const parsedStatuses = Array.isArray(statuses)
    ? statuses
    : statuses.split?.(",") || [];

  const where = {
    enabled: true,
    ...(projectId && { projectId }),
    OR: [
      { code: { contains: searchTerm } },
      { supplier: { contains: searchTerm } },
      { description: { contains: searchTerm } },
      {
        invoices: {
          some: {
            OR: [
              { code: { contains: searchTerm } },
              { concept: { contains: searchTerm } },
              {
                inventories: {
                  some: {
                    OR: [
                      { serialNumber: { contains: searchTerm } },
                      { internalFolio: { contains: searchTerm } },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    ],
  };

  // Validar sortBy para evitar errores
  const validSortFields = ["createdAt", "updatedAt", "code", "supplier"];
  const validSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  try {
    const [data, totalRecords] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        include: {
          project: true,
          invoices: {
            include: {
              inventories: true,
            },
          },
          inventories: true, // Incluir inventarios directos
        },
        skip,
        take,
        orderBy: { [validSortBy]: order },
      }),
      db.purchaseOrder.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        currentPage: parsedPage,
        pageSize: take,
      },
    });
  } catch (error) {
    console.error("Error searching purchase orders:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔗 Asignar una orden de compra existente a un proyecto
export const assignPurchaseOrderToProject = async (req, res) => {
  const { projectId, orderId } = req.params;

  try {
    // Verificar que el proyecto existe y está habilitado
    const project = await db.project.findUnique({
      where: { id: projectId, enabled: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Verificar que la orden de compra existe y está habilitada
    const order = await db.purchaseOrder.findUnique({
      where: { id: orderId, enabled: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Orden de compra no encontrada" });
    }

    // Verificar que la orden no esté ya asignada a otro proyecto
    if (order.projectId && order.projectId !== projectId) {
      return res.status(400).json({
        message: "La orden de compra ya está asignada a otro proyecto",
      });
    }

    // Asignar la orden al proyecto
    const updatedOrder = await db.purchaseOrder.update({
      where: { id: orderId },
      data: { projectId },
      include: {
        invoices: {
          include: { inventories: true },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error assigning purchase order to project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔓 Remover una orden de compra de un proyecto
export const removePurchaseOrderFromProject = async (req, res) => {
  const { projectId, orderId } = req.params;

  try {
    // Verificar que la orden existe y pertenece al proyecto
    const order = await db.purchaseOrder.findUnique({
      where: {
        id: orderId,
        projectId: projectId,
        enabled: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Orden de compra no encontrada en este proyecto",
      });
    }

    // Remover la asignación del proyecto (setear projectId a null)
    const updatedOrder = await db.purchaseOrder.update({
      where: { id: orderId },
      data: { projectId: null },
    });

    res.json({
      message: "Orden de compra removida del proyecto correctamente",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error removing purchase order from project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔄 Obtener órdenes de compra sin proyecto asignado
export const getUnassignedPurchaseOrders = async (req, res) => {
  try {
    const orders = await db.purchaseOrder.findMany({
      where: {
        projectId: null,
        enabled: true,
      },
      include: {
        invoices: {
          include: { inventories: true },
        },
        inventories: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error getting unassigned purchase orders:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// controllers/purchaseOrderController.js
export const searchUnassignedPurchaseOrders = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ message: "Parámetro de búsqueda requerido" });
    }

    const orders = await db.purchaseOrder.findMany({
      where: {
        enabled: true,
        projectId: null,
        OR: [
          {
            code: {
              contains: query,
            },
          },
          {
            invoices: {
              some: {
                OR: [
                  {
                    code: {
                      contains: query,
                    },
                  },
                  {
                    concept: {
                      contains: query,
                    },
                  },
                  {
                    inventories: {
                      some: {
                        OR: [
                          { serialNumber: { contains: query } },
                          { internalFolio: { contains: query } },
                          { comments: { contains: query } },
                          {
                            model: {
                              name: {
                                contains: query,
                              },
                            },
                          },
                          {
                            model: {
                              brand: {
                                name: {
                                  contains: query,
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        invoices: {
          include: {
            inventories: {
              include: {
                model: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
        inventories: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error searching unassigned purchase orders:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📦 Obtener inventarios asociados a una orden de compra
export const getInventoriesByPurchaseOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const inventories = await db.inventory.findMany({
      where: {
        purchaseOrderId: orderId,
        enabled: true,
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
        images: {
          where: { enabled: true },
        },
        files: {
          where: { enabled: true },
        },
      },
    });

    res.json(inventories);
  } catch (error) {
    console.error(
      "Error getting inventories by purchase order:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// ⚙️ Asignar inventarios a orden de compra (bulk)
export const assignInventoriesToPurchaseOrder = async (req, res) => {
  const { orderId } = req.params;
  const { inventoryIds } = req.body;

  try {
    const updated = await db.inventory.updateMany({
      where: { id: { in: inventoryIds } },
      data: { purchaseOrderId: orderId },
    });

    res.json({
      message: `${updated.count} inventarios asignados a la orden de compra`,
      count: updated.count,
    });
  } catch (error) {
    console.error(
      "Error assigning inventories to purchase order:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// 🛠️ Desasignar un inventario de la orden de compra
export const removeInventoryFromPurchaseOrder = async (req, res) => {
  const { inventoryId } = req.params;

  try {
    await db.inventory.update({
      where: { id: inventoryId },
      data: { purchaseOrderId: null },
    });

    res.status(204).end();
  } catch (error) {
    console.error(
      "Error removing inventory from purchase order:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};

// 📦 Obtener todos los inventarios relacionados a una orden de compra (directos + de facturas)
export const getAllInventoriesByPurchaseOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id: orderId },
      include: {
        // Inventarios directamente asignados a la OC
        inventories: {
          where: { enabled: true },
          include: {
            model: {
              include: {
                type: true,
                brand: true,
              },
            },
            images: true,
            customField: {
              include: {
                customField: true,
              },
            },
          },
        },
        // Facturas asignadas a la OC
        invoices: {
          where: { enabled: true },
          include: {
            // Inventarios de cada factura
            inventories: {
              where: { enabled: true },
              include: {
                model: {
                  include: {
                    type: true,
                    brand: true,
                  },
                },
                images: true,
                customField: {
                  include: {
                    customField: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    // Combinar inventarios directos + inventarios de facturas
    const directInventories = purchaseOrder.inventories || [];
    const invoiceInventories = purchaseOrder.invoices.flatMap(
      (invoice) => invoice.inventories || []
    );

    // Evitar duplicados por si un inventario está tanto directo como en factura
    const allInventoriesMap = new Map();

    [...directInventories, ...invoiceInventories].forEach((inventory) => {
      if (!allInventoriesMap.has(inventory.id)) {
        allInventoriesMap.set(inventory.id, {
          ...inventory,
          source: directInventories.find((inv) => inv.id === inventory.id)
            ? "direct"
            : "invoice",
        });
      }
    });

    const allInventories = Array.from(allInventoriesMap.values());

    res.json({
      purchaseOrder: {
        id: purchaseOrder.id,
        code: purchaseOrder.code,
        supplier: purchaseOrder.supplier,
        description: purchaseOrder.description,
      },
      inventories: allInventories,
      summary: {
        directInventories: directInventories.length,
        invoiceInventories: invoiceInventories.length,
        totalInventories: allInventories.length,
      },
    });
  } catch (error) {
    console.error(
      "Error getting all inventories by purchase order:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};
