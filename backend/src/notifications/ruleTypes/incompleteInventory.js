/**
 * Regla: Inventarios Incompletos
 * Detecta inventarios con información faltante
 */
import { db } from "../../lib/db.js";
import { subDays } from "date-fns";
import { inventoryFieldsMeta } from "./index.js";

// Campos que pueden verificarse como null/vacío
const nullableFields = [
  "activeNumber",
  "serialNumber",
  "comments",
  "receptionDate",
  "altaDate",
  "bajaDate",
  "internalFolio",
  "details",
  "invoiceId",
  "purchaseOrderId",
  "locationId",
];

// Relaciones many que requieren verificación especial (none)
const manyRelationFields = ["conditions", "files", "images", "custodyItems"];

/**
 * Evalúa la regla de inventarios incompletos
 */
export const evaluateIncompleteInventory = async (rule) => {
  const params = rule.params || {};
  const {
    lookbackDays = 30,
    status = "ALTA",
    missingFields = ["purchaseOrderId", "invoiceId"],
    conditionNames = [],
  } = params;

  const since = subDays(new Date(), lookbackDays);

  // Construir filtro de campos faltantes dinámicamente
  const missingFieldsFilter = [];

  for (const field of missingFields) {
    if (nullableFields.includes(field)) {
      // Campos normales que pueden ser null
      missingFieldsFilter.push({ [field]: null });
    } else if (manyRelationFields.includes(field)) {
      // Relaciones many: verificar que no tenga ninguno
      missingFieldsFilter.push({ [field]: { none: {} } });
    }
  }

  // Construir query
  const whereClause = {
    enabled: true,
    status: status,
    createdAt: { gte: since },
    OR: missingFieldsFilter.length > 0 ? missingFieldsFilter : undefined,
  };

  // Si se especifican condiciones, el inventario debe tener TODAS las seleccionadas
  // Usamos AND para que tenga cada una de las condiciones especificadas
  if (conditionNames && conditionNames.length > 0) {
    whereClause.AND = conditionNames.map((condName) => ({
      conditions: {
        some: {
          condition: {
            name: condName,
          },
        },
      },
    }));
  }

  const inventories = await db.inventory.findMany({
    where: whereClause,
    include: {
      model: {
        include: {
          type: true,
          brand: true,
        },
      },
      location: true,
      conditions: {
        include: {
          condition: true,
        },
      },
      _count: {
        select: {
          files: true,
          images: true,
          custodyItems: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limitar para evitar emails muy largos
  });

  // Formatear coincidencias para el reporte
  const matches = inventories.map((inv) => ({
    id: inv.id,
    serialNumber: inv.serialNumber || "N/A",
    activeNumber: inv.activeNumber || "N/A",
    type: inv.model?.type?.name || "N/A",
    brand: inv.model?.brand?.name || "N/A",
    model: inv.model?.name || "N/A",
    location: inv.location?.name || "Sin ubicación",
    condition: inv.conditions.map((c) => c.condition.name).join(", ") || "N/A",
    missingInfo: getMissingInfo(inv, missingFields),
    createdAt: inv.createdAt,
  }));

  // Generar link con los IDs de los inventarios encontrados
  const inventoryIds = matches.map((m) => m.id).join(",");
  const link = inventoryIds
    ? `/inventories?ids=${inventoryIds}&pageSize=100`
    : `/inventories?status=${status}`;

  const summary = {
    columns: [
      { key: "serialNumber", label: "Serie" },
      { key: "model", label: "Modelo" },
      { key: "brand", label: "Marca" },
      { key: "type", label: "Tipo" },
      { key: "location", label: "Ubicación" },
      { key: "missingInfo", label: "Información Faltante" },
    ],
    link,
    message: `Inventarios en estado ${status} con información incompleta`,
  };

  return { matches, summary };
};

/**
 * Determina qué información falta en un inventario basándose en los campos seleccionados
 */
const getMissingInfo = (inventory, selectedFields) => {
  const missing = [];

  // Mapeo de campos a labels legibles
  const fieldLabels = {
    purchaseOrderId: "Orden de Compra",
    invoiceId: "Factura",
    locationId: "Ubicación",
    activeNumber: "Número de Activo",
    serialNumber: "Número de Serie",
    comments: "Comentarios",
    receptionDate: "Fecha de Recepción",
    altaDate: "Fecha de Alta",
    bajaDate: "Fecha de Baja",
    internalFolio: "Folio Interno",
    details: "Detalles",
    modelId: "Modelo",
    createdById: "Creado por",
    conditions: "Condiciones",
    files: "Archivos",
    images: "Imágenes",
    custodyItems: "Resguardos",
  };

  for (const field of selectedFields) {
    if (nullableFields.includes(field)) {
      if (!inventory[field]) {
        missing.push(fieldLabels[field] || field);
      }
    } else if (manyRelationFields.includes(field)) {
      // Para relaciones many, verificar el count
      const countKey = field;
      if (inventory._count && inventory._count[countKey] === 0) {
        missing.push(fieldLabels[field] || field);
      } else if (
        field === "conditions" &&
        (!inventory.conditions || inventory.conditions.length === 0)
      ) {
        missing.push(fieldLabels[field] || field);
      }
    }
  }

  return missing.join(", ") || "Ninguna";
};
