// controllers/invoiceController.js
import { db } from "../lib/db.js";

// Función removida: updatePurchaseOrderAmount
// Ya no necesitamos calcular montos en las órdenes de compra

// 📄 Obtener facturas de una orden de compra
export const getInvoicesByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    const invoices = await db.invoice.findMany({
      where: {
        purchaseOrderId: orderId,
      },
      include: { inventories: true, purchaseOrder: true },
    });
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices by order ID:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Obtener detalle de factura (incluye inventarios y orden)
export const getInvoiceById = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        inventories: true,
        purchaseOrder: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear nueva factura (con PDF y XML opcionales)
export const createInvoice = async (req, res) => {
  const { orderId } = req.params;
  const { code, concept, supplier } = req.body;
  const { pdfUrl: fileUrl = null, xmlUrl = null } = req.invoiceData || {};

  try {
    const invoice = await db.invoice.create({
      data: {
        code,
        concept,
        supplier: supplier || null,
        fileUrl,
        xmlUrl,
        purchaseOrderId: orderId || null, // Hacer opcional
        createdById: req.user.id,
      },
      include: {
        inventories: true,
        purchaseOrder: true,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar factura (campos y archivos)
export const updateInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const { code, concept, supplier } = req.body;
  const { pdfUrl: fileUrl, xmlUrl } = req.invoiceData || {};

  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        code,
        concept,
        ...(supplier !== undefined && { supplier: supplier || null }),
        ...(fileUrl && { fileUrl }),
        ...(xmlUrl && { xmlUrl }),
      },
      include: {
        inventories: true,
        purchaseOrder: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Eliminación lógica de factura
export const deleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    // 🔄 Desasignar todos los inventarios de esta factura
    await db.inventory.updateMany({
      where: { invoiceId },
      data: {
        invoiceId: null,
        // Si el inventario estaba en una OC a través de la factura, mantenerlo en la OC
        // (no tocamos purchaseOrderId)
      },
    });

    // 🗑️ Eliminar físicamente la factura
    await db.invoice.delete({
      where: { id: invoiceId },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📄 Listar inventarios asociados a una factura
export const getInventoriesByInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const inventories = await db.inventory.findMany({
      where: {
        invoiceId,
      },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });

    res.json(inventories);
  } catch (error) {
    console.error("Error fetching inventories for invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ⚙️ Asignar inventarios a factura (bulk)
export const assignInventoriesToInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const { inventoryIds } = req.body;

  try {
    // 🔍 Validar que los inventarios no estén ya asignados a otra factura
    const inventoriesWithInvoice = await db.inventory.findMany({
      where: {
        id: { in: inventoryIds },
        invoiceId: { not: null },
        invoiceId: { not: invoiceId }, // Excluir si ya está asignado a esta misma factura
      },
      select: {
        id: true,
        internalFolio: true,
        invoice: {
          select: {
            code: true,
          },
        },
      },
    });

    if (inventoriesWithInvoice.length > 0) {
      const conflicts = inventoriesWithInvoice.map(
        (inv) => `${inv.internalFolio} (Factura: ${inv.invoice.code})`
      );
      return res.status(400).json({
        error: "Algunos inventarios ya están asignados a otras facturas",
        conflicts,
      });
    }

    // ✅ Si todo está bien, asignar los inventarios
    const updated = await db.inventory.updateMany({
      where: { id: { in: inventoryIds } },
      data: { invoiceId },
    });
    res.json(updated);
  } catch (error) {
    console.error("Error assigning inventories:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🛠️ Desasignar un inventario de la factura
export const removeInventoryFromInvoice = async (req, res) => {
  const { inventoryId } = req.params;

  try {
    await db.inventory.update({
      where: { id: inventoryId },
      data: { invoiceId: null },
    });
    res.status(204).end();
  } catch (error) {
    console.error("Error removing inventory from invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const searchInvoicesByOrderId = async (req, res) => {
  const { orderId } = req.params;
  const {
    searchTerm = "",
    page = 1,
    pageSize = 10,
    sortBy = "createdAt", // 👈 corregido
    order = "desc", // 👈 nuevo
  } = req.query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedPageSize = parseInt(pageSize, 10) || 10;
  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  const where = {
    purchaseOrderId: orderId,

    OR: [
      { code: { contains: searchTerm } },
      { concept: { contains: searchTerm } },
      { supplier: { contains: searchTerm } },
      {
        inventories: {
          some: {
            OR: [
              { serialNumber: { contains: searchTerm } },
              { internalFolio: { contains: searchTerm } },
              { activeNumber: { contains: searchTerm } },
              { model: { name: { contains: searchTerm } } },
              { model: { brand: { name: { contains: searchTerm } } } },
              { model: { type: { name: { contains: searchTerm } } } },
            ],
          },
        },
      },
    ],
  };

  // Validar sortBy y order por seguridad
  const validSortFields = ["createdAt", "updatedAt", "code", "concept"];
  const validOrders = ["asc", "desc"];

  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = validOrders.includes(order.toLowerCase())
    ? order.toLowerCase()
    : "desc";

  try {
    const [data, totalRecords] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          inventories: {
            include: {
              model: {
                include: { brand: true, type: true },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          [sortField]: sortOrder,
        },
      }),
      db.invoice.count({ where }),
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
    console.error("Error searching invoices:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Crear factura independiente (sin orden de compra)
export const createIndependentInvoice = async (req, res) => {
  const { code, concept, supplier } = req.body;

  try {
    const invoice = await db.invoice.create({
      data: {
        code,
        concept,
        supplier: supplier || null,
        purchaseOrderId: null, // Factura independiente
        fileUrl: req.processedFiles?.factura?.[0]?.url || null,
        xmlUrl: req.processedFiles?.xml?.[0]?.url || null,

        createdById: req.user.id,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating independent invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Obtener todas las facturas independientes (sin orden de compra)
export const getIndependentInvoices = async (req, res) => {
  try {
    const invoices = await db.invoice.findMany({
      where: {
        purchaseOrderId: null, // Solo facturas independientes
      },
      include: {
        inventories: {
          include: {
            model: {
              include: {
                brand: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(invoices);
  } catch (error) {
    console.error("Error getting independent invoices:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔎 Buscar facturas independientes
export const searchIndependentInvoices = async (req, res) => {
  const {
    searchTerm = "",
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedPageSize = parseInt(pageSize, 10) || 10;
  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  const where = {
    purchaseOrderId: null, // Solo facturas independientes

    ...(searchTerm && {
      OR: [
        { code: { contains: searchTerm } },
        { concept: { contains: searchTerm } },
        { supplier: { contains: searchTerm } },
      ],
    }),
  };

  try {
    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          inventories: {
            include: {
              model: {
                include: {
                  brand: true,
                  type: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      db.invoice.count({ where }),
    ]);

    res.json({
      data: invoices,
      pagination: {
        currentPage: parsedPage,
        totalPages: Math.ceil(totalCount / take),
        totalRecords: totalCount,
        pageSize: take,
      },
    });
  } catch (error) {
    console.error("Error searching independent invoices:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Buscar TODAS las facturas (independientes + con orden de compra)
export const searchAllInvoices = async (req, res) => {
  const {
    searchTerm = "",
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedPageSize = parseInt(pageSize, 10) || 10;
  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  const where = {
    // Buscar todas las facturas habilitadas (con y sin OC)
    ...(searchTerm && {
      OR: [
        { code: { contains: searchTerm } },
        { concept: { contains: searchTerm } },
        { supplier: { contains: searchTerm } },
        { purchaseOrder: { code: { contains: searchTerm } } }, // También buscar por código de OC
      ],
    }),
  };

  try {
    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          inventories: {
            include: {
              model: {
                include: {
                  brand: true,
                  type: true,
                },
              },
            },
          },
          purchaseOrder: true, // Incluir la orden de compra si existe
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      db.invoice.count({ where }),
    ]);

    res.json({
      data: invoices,
      pagination: {
        currentPage: parsedPage,
        totalPages: Math.ceil(totalCount / take),
        totalRecords: totalCount,
        pageSize: take,
      },
    });
  } catch (error) {
    console.error("Error searching all invoices:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔗 Asignar factura existente a una orden de compra
export const assignInvoiceToPurchaseOrder = async (req, res) => {
  const { invoiceId } = req.params;
  const { purchaseOrderId } = req.body;

  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: { purchaseOrderId },
      include: {
        inventories: true,
        purchaseOrder: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error("Error assigning invoice to purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔓 Remover factura de orden de compra
export const removeInvoiceFromPurchaseOrder = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: { purchaseOrderId: null },
      include: {
        inventories: true,
        purchaseOrder: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error("Error removing invoice from purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};
