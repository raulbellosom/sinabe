/**
 * Regla: Consulta Personalizada
 * Permite ejecutar consultas personalizadas (uso avanzado)
 */
import { db } from "../../lib/db.js";

/**
 * Evalúa una consulta personalizada
 */
export const evaluateCustomQuery = async (rule) => {
  const params = rule.params || {};
  const { entity = "inventory", filters = {} } = params;

  let matches = [];
  let summary = {};

  try {
    switch (entity) {
      case "inventory":
        matches = await evaluateInventoryQuery(filters);
        const invIds = matches.map((m) => m.id).join(",");
        summary = {
          columns: [
            { key: "serialNumber", label: "Serie" },
            { key: "model", label: "Modelo" },
            { key: "status", label: "Estado" },
          ],
          link: invIds
            ? `/inventories?ids=${invIds}&pageSize=100`
            : "/inventories",
          message: "Consulta personalizada de inventarios",
        };
        break;

      case "purchaseOrder":
        matches = await evaluatePurchaseOrderQuery(filters);
        summary = {
          columns: [
            { key: "code", label: "Código" },
            { key: "supplier", label: "Proveedor" },
            { key: "project", label: "Proyecto" },
          ],
          link: "/purchase-orders",
          message: "Consulta personalizada de órdenes de compra",
        };
        break;

      case "invoice":
        matches = await evaluateInvoiceQuery(filters);
        summary = {
          columns: [
            { key: "code", label: "Código" },
            { key: "concept", label: "Concepto" },
            { key: "supplier", label: "Proveedor" },
          ],
          link: "/invoices",
          message: "Consulta personalizada de facturas",
        };
        break;

      case "custodyRecord":
        matches = await evaluateCustodyRecordQuery(filters);
        summary = {
          columns: [
            { key: "code", label: "Código" },
            { key: "receiver", label: "Receptor" },
            { key: "status", label: "Estado" },
          ],
          link: "/custody",
          message: "Consulta personalizada de resguardos",
        };
        break;

      case "model":
        matches = await evaluateModelQuery(filters);
        summary = {
          columns: [
            { key: "name", label: "Nombre" },
            { key: "brand", label: "Marca" },
            { key: "type", label: "Tipo" },
          ],
          link: "/catalogs/models",
          message: "Consulta personalizada de modelos",
        };
        break;

      case "vertical":
        matches = await evaluateVerticalQuery(filters);
        summary = {
          columns: [
            { key: "name", label: "Nombre" },
            { key: "description", label: "Descripción" },
          ],
          link: "/catalogs/verticals",
          message: "Consulta personalizada de verticales",
        };
        break;

      case "location":
        matches = await evaluateLocationQuery(filters);
        summary = {
          columns: [
            { key: "name", label: "Nombre" },
            { key: "inventoryCount", label: "Inventarios" },
          ],
          link: "/catalogs/locations",
          message: "Consulta personalizada de ubicaciones",
        };
        break;

      default:
        console.warn(`[CustomQuery] Entidad no soportada: ${entity}`);
        summary = { message: "Entidad no soportada" };
    }
  } catch (error) {
    console.error(`[CustomQuery] Error ejecutando consulta:`, error);
    summary = { message: `Error: ${error.message}` };
  }

  return { matches, summary };
};

/**
 * Ejecuta consulta personalizada de inventarios
 */
const evaluateInventoryQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const inventories = await db.inventory.findMany({
    where: whereClause,
    include: {
      model: {
        include: {
          type: true,
          brand: true,
        },
      },
    },
    take: 100,
  });

  return inventories.map((inv) => ({
    id: inv.id,
    serialNumber: inv.serialNumber || "N/A",
    model: inv.model?.name || "N/A",
    brand: inv.model?.brand?.name || "N/A",
    type: inv.model?.type?.name || "N/A",
    status: inv.status,
  }));
};

/**
 * Ejecuta consulta personalizada de órdenes de compra
 */
const evaluatePurchaseOrderQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);

  const purchaseOrders = await db.purchaseOrder.findMany({
    where: whereClause,
    include: {
      project: {
        select: { name: true },
      },
    },
    take: 100,
  });

  return purchaseOrders.map((po) => ({
    id: po.id,
    code: po.code,
    supplier: po.supplier || "N/A",
    project: po.project?.name || "Sin proyecto",
    description: po.description || "",
  }));
};

/**
 * Ejecuta consulta personalizada de facturas
 */
const evaluateInvoiceQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);

  const invoices = await db.invoice.findMany({
    where: whereClause,
    include: {
      purchaseOrder: {
        select: { code: true },
      },
    },
    take: 100,
  });

  return invoices.map((inv) => ({
    id: inv.id,
    code: inv.code,
    concept: inv.concept,
    supplier: inv.supplier || "N/A",
    purchaseOrder: inv.purchaseOrder?.code || "Sin OC",
  }));
};

/**
 * Ejecuta consulta personalizada de resguardos
 */
const evaluateCustodyRecordQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const custodyRecords = await db.custodyRecord.findMany({
    where: whereClause,
    include: {
      receiver: {
        select: { firstName: true, lastName: true },
      },
      deliverer: {
        select: { firstName: true, lastName: true },
      },
      _count: {
        select: { items: true },
      },
    },
    take: 100,
  });

  return custodyRecords.map((cr) => ({
    id: cr.id,
    code: cr.code || "Sin código",
    receiver: cr.receiver
      ? `${cr.receiver.firstName} ${cr.receiver.lastName}`
      : "N/A",
    deliverer: cr.deliverer
      ? `${cr.deliverer.firstName} ${cr.deliverer.lastName}`
      : "N/A",
    status: cr.status,
    itemCount: cr._count.items,
    date: cr.date,
  }));
};

/**
 * Ejecuta consulta personalizada de modelos
 */
const evaluateModelQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const models = await db.model.findMany({
    where: whereClause,
    include: {
      brand: {
        select: { name: true },
      },
      type: {
        select: { name: true },
      },
      _count: {
        select: { inventories: true },
      },
    },
    take: 100,
  });

  return models.map((m) => ({
    id: m.id,
    name: m.name,
    brand: m.brand?.name || "N/A",
    type: m.type?.name || "N/A",
    inventoryCount: m._count.inventories,
  }));
};

/**
 * Ejecuta consulta personalizada de verticales
 */
const evaluateVerticalQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const verticals = await db.vertical.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { ModelVertical: true },
      },
    },
    take: 100,
  });

  return verticals.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description || "",
    modelCount: v._count.ModelVertical,
  }));
};

/**
 * Ejecuta consulta personalizada de ubicaciones
 */
const evaluateLocationQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const locations = await db.inventoryLocation.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { inventories: true },
      },
    },
    take: 100,
  });

  return locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    inventoryCount: loc._count.inventories,
  }));
};

/**
 * Ejecuta consulta personalizada de proyectos (mantenido para compatibilidad)
 */
const evaluateProjectQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const projects = await db.project.findMany({
    where: whereClause,
    take: 100,
  });

  return projects.map((project) => ({
    id: project.id,
    code: project.code,
    name: project.name,
    status: project.status,
  }));
};

/**
 * Ejecuta consulta personalizada de deadlines (mantenido para compatibilidad)
 */
const evaluateDeadlineQuery = async (filters) => {
  const whereClause = buildWhereClause(filters);
  whereClause.enabled = true;

  const deadlines = await db.deadline.findMany({
    where: whereClause,
    include: {
      project: {
        select: { name: true },
      },
    },
    take: 100,
  });

  return deadlines.map((deadline) => ({
    id: deadline.id,
    name: deadline.name,
    project: deadline.project?.name || "Sin proyecto",
    status: deadline.status,
  }));
};

/**
 * Construye la cláusula WHERE a partir de filtros JSON
 * Solo permite operadores seguros para evitar inyecciones
 */
const buildWhereClause = (filters) => {
  const allowedOperators = [
    "equals",
    "contains",
    "startsWith",
    "endsWith",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "notIn",
  ];
  const where = {};

  for (const [field, value] of Object.entries(filters)) {
    // Validación básica de seguridad
    if (
      typeof field !== "string" ||
      field.includes("$") ||
      field.includes(".")
    ) {
      continue;
    }

    if (typeof value === "object" && value !== null) {
      // Filtrar solo operadores permitidos
      const safeValue = {};
      for (const [op, opValue] of Object.entries(value)) {
        if (allowedOperators.includes(op)) {
          safeValue[op] = opValue;
        }
      }
      if (Object.keys(safeValue).length > 0) {
        where[field] = safeValue;
      }
    } else {
      // Valor directo (equals implícito)
      where[field] = value;
    }
  }

  return where;
};
