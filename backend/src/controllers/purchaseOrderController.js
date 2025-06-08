import { db } from "../lib/db.js";

// 🔄 Obtener órdenes de compra de un proyecto
export const getPurchaseOrdersByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const orders = await db.purchaseOrder.findMany({
      where: {
        projectId: parseInt(projectId),
        enabled: true,
      },
      include: {
        invoices: true,
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
  const { code, supplier, description, amount, status, date } = req.body;

  try {
    const order = await db.purchaseOrder.create({
      data: {
        projectId: parseInt(projectId),
        code,
        supplier,
        description,
        amount: parseFloat(amount),
        status,
        date: new Date(date),
        enabled: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar orden
export const updatePurchaseOrder = async (req, res) => {
  const { id } = req.params;
  const { code, supplier, description, amount, status, date } = req.body;

  try {
    const order = await db.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: {
        code,
        supplier,
        description,
        amount: parseFloat(amount),
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

// ❌ Eliminación lógica
export const deletePurchaseOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await db.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: { enabled: false },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting purchase order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🧾 Agregar factura (PDF y XML) a una OC
export const addInvoiceToOrder = async (req, res) => {
  const { orderId } = req.params;
  const { code, concept, amount, status, date } = req.body;
  const { pdfUrl, xmlUrl } = req.invoiceData;

  try {
    const invoice = await db.invoice.create({
      data: {
        code,
        concept,
        amount: parseFloat(amount),
        status,
        date: new Date(date),
        pdfUrl,
        xmlUrl,
        purchaseOrderId: parseInt(orderId),
        enabled: true,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📄 Obtener facturas de una orden
export const getInvoicesByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    const invoices = await db.invoice.findMany({
      where: {
        purchaseOrderId: parseInt(orderId),
        enabled: true,
      },
    });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    res.status(500).json({ error: error.message });
  }
};
