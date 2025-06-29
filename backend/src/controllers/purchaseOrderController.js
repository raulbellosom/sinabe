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
          include: { inventories: true },
        },
      },
      orderBy: { date: "desc" },
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
  const { code, supplier, description, status, date } = req.body;

  try {
    const order = await db.purchaseOrder.create({
      data: {
        projectId,
        code,
        supplier,
        description,
        amount: 0,
        status,
        date: new Date(date),
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

// ✏️ Actualizar orden de compra
export const updatePurchaseOrder = async (req, res) => {
  const { id } = req.params;
  const { code, supplier, description, status, date } = req.body;

  try {
    const order = await db.purchaseOrder.update({
      where: { id },
      data: {
        code,
        supplier,
        description,
        status,
        date: new Date(date),
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
    sortBy = "date",
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
    projectId,
    enabled: true,
    ...(parsedStatuses.length > 0 && { status: { in: parsedStatuses } }),
    OR: [
      { code: { contains: searchTerm, mode: "insensitive" } },
      { supplier: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      {
        invoices: {
          some: {
            OR: [
              { code: { contains: searchTerm, mode: "insensitive" } },
              { concept: { contains: searchTerm, mode: "insensitive" } },
              {
                inventories: {
                  some: {
                    OR: [
                      {
                        serialNumber: {
                          contains: searchTerm,
                          mode: "insensitive",
                        },
                      },
                      {
                        internalFolio: {
                          contains: searchTerm,
                          mode: "insensitive",
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
  };

  try {
    const [data, totalRecords] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        include: { invoices: { include: { inventories: true } } },
        skip,
        take,
        orderBy: { [sortBy]: order },
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
