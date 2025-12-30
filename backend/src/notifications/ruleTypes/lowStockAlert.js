/**
 * Regla: Alerta de Stock Bajo
 * Notifica cuando el conteo de inventarios está bajo cierto umbral
 */
import { db } from "../../lib/db.js";

/**
 * Evalúa la regla de stock bajo
 */
export const evaluateLowStockAlert = async (rule) => {
  const params = rule.params || {};
  const { threshold = 5, groupBy = "model" } = params;

  let matches = [];
  let summary = {};

  switch (groupBy) {
    case "type":
      matches = await evaluateByType(threshold);
      summary = {
        columns: [
          { key: "name", label: "Tipo" },
          { key: "count", label: "Cantidad" },
          { key: "threshold", label: "Umbral" },
        ],
        link:
          matches.length > 0
            ? `/inventories?typeName=${matches
                .map((m) => encodeURIComponent(m.name))
                .join("&typeName=")}`
            : "/inventories",
        message: `Tipos de inventario con stock bajo (< ${threshold} unidades)`,
      };
      break;

    case "brand":
      matches = await evaluateByBrand(threshold);
      summary = {
        columns: [
          { key: "name", label: "Marca" },
          { key: "count", label: "Cantidad" },
          { key: "threshold", label: "Umbral" },
        ],
        link:
          matches.length > 0
            ? `/inventories?brandName=${matches
                .map((m) => encodeURIComponent(m.name))
                .join("&brandName=")}`
            : "/inventories",
        message: `Marcas con stock bajo (< ${threshold} unidades)`,
      };
      break;

    case "model":
    default:
      matches = await evaluateByModel(threshold);
      summary = {
        columns: [
          { key: "name", label: "Modelo" },
          { key: "brand", label: "Marca" },
          { key: "type", label: "Tipo" },
          { key: "count", label: "Cantidad" },
          { key: "threshold", label: "Umbral" },
        ],
        link:
          matches.length > 0
            ? `/inventories?modelName=${matches
                .map((m) => encodeURIComponent(m.name))
                .join("&modelName=")}`
            : "/inventories",
        message: `Modelos con stock bajo (< ${threshold} unidades)`,
      };
      break;
  }

  return { matches, summary };
};

/**
 * Evalúa stock bajo agrupado por tipo
 */
const evaluateByType = async (threshold) => {
  const types = await db.inventoryType.findMany({
    where: { enabled: true },
    include: {
      models: {
        include: {
          inventories: {
            where: { enabled: true, status: "ALTA" },
          },
        },
      },
    },
  });

  const results = types
    .map((type) => {
      const count = type.models.reduce(
        (sum, model) => sum + model.inventories.length,
        0
      );
      return {
        id: type.id,
        name: type.name,
        count,
        threshold,
      };
    })
    .filter((item) => item.count < threshold);

  return results;
};

/**
 * Evalúa stock bajo agrupado por marca
 */
const evaluateByBrand = async (threshold) => {
  const brands = await db.inventoryBrand.findMany({
    where: { enabled: true },
    include: {
      models: {
        include: {
          inventories: {
            where: { enabled: true, status: "ALTA" },
          },
        },
      },
    },
  });

  const results = brands
    .map((brand) => {
      const count = brand.models.reduce(
        (sum, model) => sum + model.inventories.length,
        0
      );
      return {
        id: brand.id,
        name: brand.name,
        count,
        threshold,
      };
    })
    .filter((item) => item.count < threshold);

  return results;
};

/**
 * Evalúa stock bajo agrupado por modelo
 */
const evaluateByModel = async (threshold) => {
  const models = await db.model.findMany({
    where: { enabled: true },
    include: {
      type: true,
      brand: true,
      inventories: {
        where: { enabled: true, status: "ALTA" },
      },
    },
  });

  const results = models
    .map((model) => ({
      id: model.id,
      name: model.name,
      brand: model.brand?.name || "N/A",
      type: model.type?.name || "N/A",
      count: model.inventories.length,
      threshold,
    }))
    .filter((item) => item.count < threshold);

  return results;
};
