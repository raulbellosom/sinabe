/**
 * Registro de Tipos de Reglas
 * Cada tipo de regla tiene su propia lógica de evaluación
 */
import { evaluateIncompleteInventory } from "./incompleteInventory.js";
import { evaluateDeadlineReminder } from "./deadlineReminder.js";
import { evaluateLowStockAlert } from "./lowStockAlert.js";
import { evaluateCustomQuery } from "./customQuery.js";

// Registro de evaluadores por tipo de regla
const ruleEvaluators = {
  INCOMPLETE_INVENTORY: evaluateIncompleteInventory,
  DEADLINE_REMINDER: evaluateDeadlineReminder,
  LOW_STOCK_ALERT: evaluateLowStockAlert,
  CUSTOM_QUERY: evaluateCustomQuery,
};

// Lista completa de campos y relaciones de Inventory
export const inventoryFieldsMeta = {
  // Campos directos
  status: {
    label: "Estado",
    type: "enum",
    values: ["ALTA", "BAJA", "PROPUESTA"],
  },
  activeNumber: { label: "Número de activo", type: "string" },
  serialNumber: { label: "Número de serie", type: "string" },
  comments: { label: "Comentarios", type: "text" },
  receptionDate: { label: "Fecha de recepción", type: "date" },
  altaDate: { label: "Fecha de alta", type: "date" },
  bajaDate: { label: "Fecha de baja", type: "date" },
  internalFolio: { label: "Folio interno", type: "string" },
  details: { label: "Detalles (JSON)", type: "json" },
  // Relaciones (IDs que pueden ser null)
  invoiceId: { label: "Factura", type: "relation", relationTo: "Invoice" },
  purchaseOrderId: {
    label: "Orden de compra",
    type: "relation",
    relationTo: "PurchaseOrder",
  },
  locationId: {
    label: "Ubicación",
    type: "relation",
    relationTo: "InventoryLocation",
  },
  modelId: { label: "Modelo", type: "relation", relationTo: "Model" },
  createdById: { label: "Creado por", type: "relation", relationTo: "User" },
  // Relaciones múltiples
  conditions: {
    label: "Condiciones",
    type: "relationMany",
    relationTo: "Condition",
  },
  files: { label: "Archivos", type: "relationMany", relationTo: "File" },
  images: { label: "Imágenes", type: "relationMany", relationTo: "Image" },
  custodyItems: {
    label: "Items de resguardo",
    type: "relationMany",
    relationTo: "CustodyItem",
  },
};

// Metadatos de los tipos de regla disponibles
export const ruleTypesMeta = {
  INCOMPLETE_INVENTORY: {
    name: "Inventarios Incompletos",
    description:
      "Detecta inventarios con información faltante (sin factura, orden de compra, ubicación, etc.)",
    paramsSchema: {
      lookbackDays: { type: "number", default: 30, label: "Días hacia atrás" },
      status: {
        type: "select",
        options: ["ALTA", "BAJA", "PROPUESTA"],
        default: "ALTA",
        label: "Estado",
      },
      missingFields: {
        type: "multiselect-dynamic",
        optionsSource: "inventoryFields", // Indicador para cargar campos dinámicamente
        default: ["purchaseOrderId", "invoiceId"],
        label: "Campos faltantes",
        description:
          "Selecciona los campos o relaciones que deben estar vacíos/null",
      },
      conditionNames: {
        type: "multiselect-dynamic",
        optionsSource: "conditions",
        optional: true,
        default: [],
        label: "Condición del inventario",
        description:
          "Filtra inventarios que tengan TODAS las condiciones seleccionadas",
      },
    },
  },
  DEADLINE_REMINDER: {
    name: "Recordatorio de Entregas",
    description: "Notifica sobre entregas próximas a vencer o vencidas",
    paramsSchema: {
      daysBeforeDue: {
        type: "number",
        default: 7,
        label: "Días antes del vencimiento",
      },
      includeOverdue: {
        type: "boolean",
        default: true,
        label: "Incluir vencidos",
      },
      statuses: {
        type: "multiselect",
        options: ["PENDIENTE", "EN_PROGRESO"],
        default: ["PENDIENTE", "EN_PROGRESO"],
        label: "Estados a incluir",
      },
    },
  },
  LOW_STOCK_ALERT: {
    name: "Alerta de Stock Bajo",
    description:
      "Notifica cuando el conteo de inventarios por tipo/modelo está bajo",
    paramsSchema: {
      threshold: { type: "number", default: 5, label: "Umbral mínimo" },
      groupBy: {
        type: "select",
        options: ["type", "model", "brand"],
        default: "model",
        label: "Agrupar por",
      },
    },
  },
  CUSTOM_QUERY: {
    name: "Consulta Personalizada",
    description:
      "Ejecuta una consulta personalizada (solo para administradores avanzados)",
    paramsSchema: {
      entity: {
        type: "select",
        options: [
          "inventory",
          "purchaseOrder",
          "invoice",
          "custodyRecord",
          "model",
          "vertical",
          "location",
        ],
        label: "Entidad",
        description: "Selecciona la entidad sobre la cual ejecutar la consulta",
      },
      filters: {
        type: "json",
        label: "Filtros (JSON)",
        description: "Filtros en formato JSON usando sintaxis de Prisma",
      },
    },
  },
};

/**
 * Evalúa una regla según su tipo
 */
export const evaluateRule = async (rule) => {
  const evaluator = ruleEvaluators[rule.ruleType];

  if (!evaluator) {
    console.warn(`[RuleTypes] Tipo de regla desconocido: ${rule.ruleType}`);
    return { matches: [], summary: { message: "Tipo de regla no soportado" } };
  }

  return await evaluator(rule);
};

/**
 * Obtiene los tipos de regla disponibles con sus metadatos
 */
export const getAvailableRuleTypes = () => {
  return Object.entries(ruleTypesMeta).map(([key, meta]) => ({
    type: key,
    ...meta,
  }));
};

/**
 * Obtiene los campos disponibles para el modelo Inventory
 */
export const getInventoryFields = () => {
  return Object.entries(inventoryFieldsMeta).map(([key, meta]) => ({
    value: key,
    label: meta.label,
    type: meta.type,
    relationTo: meta.relationTo,
  }));
};
