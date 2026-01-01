import { DB } from "../config/dbNames.js";

const T = DB.tables;
const C = DB.cols;

function bt(name) {
  return `\`${name}\``;
}
function bc(table, col) {
  return `${bt(table)}.${bt(col)}`;
}

// Build SELECT with joins to provide human-friendly fields
export function baseFromJoins() {
  // Inventory -> Model -> Brand/Type, InventoryLocation, Invoice, PurchaseOrder
  return `
    FROM ${bt(T.inventory)} I
    JOIN ${bt(T.model)} M ON M.${bt(C.model.id)} = I.${bt(C.inventory.modelId)}
    JOIN ${bt(T.brand)} B ON B.${bt(C.brand.id)} = M.${bt(C.model.brandId)}
    JOIN ${bt(T.type)}  TY ON TY.${bt(C.type.id)} = M.${bt(C.model.typeId)}
    LEFT JOIN ${bt(T.location)} L ON L.${bt(C.location.id)} = I.${bt(
    C.inventory.locationId
  )}
    LEFT JOIN ${bt(T.invoice)} INV ON INV.${bt(C.invoice.id)} = I.${bt(
    C.inventory.invoiceId
  )}
    LEFT JOIN ${bt(T.purchaseOrder)} PO ON PO.${bt(
    C.purchaseOrder.id
  )} = I.${bt(C.inventory.purchaseOrderId)}
  `.trim();
}

export function buildWhere({ filters, missing }, params) {
  const where = [];

  // Default enabled=true
  const defaultOnlyEnabled = process.env.DEFAULT_ONLY_ENABLED === "true";
  if (defaultOnlyEnabled && typeof filters.enabled !== "boolean") {
    where.push(`I.${bt(C.inventory.enabled)} = ?`);
    params.push(1);
  }

  if (typeof filters.enabled === "boolean") {
    where.push(`I.${bt(C.inventory.enabled)} = ?`);
    params.push(filters.enabled ? 1 : 0);
  }

  if (filters.status) {
    where.push(`I.${bt(C.inventory.status)} = ?`);
    params.push(filters.status);
  }

  if (filters.brand) {
    where.push(`LOWER(B.${bt(C.brand.name)}) = LOWER(?)`);
    params.push(filters.brand);
  }

  // Multiple brands (OR condition)
  if (
    filters.brands &&
    Array.isArray(filters.brands) &&
    filters.brands.length > 0
  ) {
    const brandPlaceholders = filters.brands
      .map(() => `LOWER(B.${bt(C.brand.name)}) = LOWER(?)`)
      .join(" OR ");
    where.push(`(${brandPlaceholders})`);
    params.push(...filters.brands);
  }

  if (filters.type) {
    where.push(`LOWER(TY.${bt(C.type.name)}) = LOWER(?)`);
    params.push(filters.type);
  }

  if (filters.model) {
    where.push(`LOWER(M.${bt(C.model.name)}) LIKE LOWER(?)`);
    params.push(`%${filters.model}%`);
  }

  if (filters.serialNumber) {
    where.push(`LOWER(I.${bt(C.inventory.serialNumber)}) LIKE LOWER(?)`);
    params.push(`%${filters.serialNumber}%`);
  }

  if (filters.activeNumber) {
    where.push(`LOWER(I.${bt(C.inventory.activeNumber)}) LIKE LOWER(?)`);
    params.push(`%${filters.activeNumber}%`);
  }

  if (filters.location) {
    where.push(`LOWER(L.${bt(C.location.name)}) LIKE LOWER(?)`);
    params.push(`%${filters.location}%`);
  }

  if (typeof filters.hasInvoice === "boolean") {
    where.push(
      filters.hasInvoice
        ? `I.${bt(C.inventory.invoiceId)} IS NOT NULL`
        : `I.${bt(C.inventory.invoiceId)} IS NULL`
    );
  }

  if (typeof filters.hasPurchaseOrder === "boolean") {
    where.push(
      filters.hasPurchaseOrder
        ? `I.${bt(C.inventory.purchaseOrderId)} IS NOT NULL`
        : `I.${bt(C.inventory.purchaseOrderId)} IS NULL`
    );
  }

  // date range
  if (filters.from || filters.to) {
    const df = filters.dateField || "createdAt";
    // Use I alias since that's the inventory table alias in baseFromJoins
    const colMap = {
      createdAt: `I.${bt(C.inventory.createdAt)}`,
      receptionDate: `I.${bt(C.inventory.receptionDate)}`,
      altaDate: `I.${bt(C.inventory.altaDate)}`,
      bajaDate: `I.${bt(C.inventory.bajaDate)}`,
    };
    const dateCol = colMap[df] || colMap.createdAt;
    if (filters.from) {
      where.push(`${dateCol} >= ?`);
      params.push(filters.from);
    }
    if (filters.to) {
      where.push(`${dateCol} <= ?`);
      params.push(filters.to);
    }
  }

  // missing field / relation
  if (missing?.kind && missing?.field) {
    const f = missing.field;
    if (missing.kind === "field") {
      const fieldCols = {
        activeNumber: bc(T.inventory, C.inventory.activeNumber),
        serialNumber: bc(T.inventory, C.inventory.serialNumber),
        internalFolio: bc(T.inventory, C.inventory.internalFolio),
        receptionDate: bc(T.inventory, C.inventory.receptionDate),
        altaDate: bc(T.inventory, C.inventory.altaDate),
        bajaDate: bc(T.inventory, C.inventory.bajaDate),
      };
      const col = fieldCols[f];
      if (col) {
        // For strings: null or empty. For dates: null.
        if (["activeNumber", "serialNumber", "internalFolio"].includes(f)) {
          where.push(`(${col} IS NULL OR ${col} = '')`);
        } else {
          where.push(`${col} IS NULL`);
        }
      }
    } else if (missing.kind === "relation") {
      if (f === "location")
        where.push(`I.${bt(C.inventory.locationId)} IS NULL`);
      if (f === "invoice") where.push(`I.${bt(C.inventory.invoiceId)} IS NULL`);
      if (f === "purchaseOrder")
        where.push(`I.${bt(C.inventory.purchaseOrderId)} IS NULL`);
    }
  }

  return where.length ? `WHERE ${where.join(" AND ")}` : "";
}

export function buildListQuery({ filters, missing, page, limit, sort }) {
  const params = [];
  const where = buildWhere({ filters, missing }, params);

  const offset = (page - 1) * limit;
  const order = sort?.[0] || { field: "createdAt", dir: "desc" };
  // Use I. alias instead of full table name
  const orderColMap = {
    createdAt: `I.${bt(C.inventory.createdAt)}`,
    receptionDate: `I.${bt(C.inventory.receptionDate)}`,
    altaDate: `I.${bt(C.inventory.altaDate)}`,
    bajaDate: `I.${bt(C.inventory.bajaDate)}`,
  };
  const orderCol = orderColMap[order.field] || orderColMap.createdAt;
  const dir = order.dir?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const sql = `
    SELECT
      I.${bt(C.inventory.id)}            AS id,
      I.${bt(C.inventory.status)}        AS status,
      I.${bt(C.inventory.activeNumber)}  AS activeNumber,
      I.${bt(C.inventory.serialNumber)}  AS serialNumber,
      I.${bt(C.inventory.internalFolio)} AS internalFolio,
      I.${bt(C.inventory.enabled)}       AS enabled,
      I.${bt(C.inventory.createdAt)}     AS createdAt,
      I.${bt(C.inventory.receptionDate)} AS receptionDate,
      I.${bt(C.inventory.altaDate)}      AS altaDate,
      I.${bt(C.inventory.bajaDate)}      AS bajaDate,
      M.${bt(C.model.id)}               AS modelId,
      M.${bt(C.model.name)}             AS modelName,
      B.${bt(C.brand.name)}             AS brandName,
      TY.${bt(C.type.name)}             AS typeName,
      L.${bt(C.location.name)}          AS locationName,
      INV.${bt(C.invoice.code)}         AS invoiceCode,
      PO.${bt(C.purchaseOrder.code)}    AS purchaseOrderCode
    ${baseFromJoins()}
    ${where}
    ORDER BY ${orderCol} ${dir}
    LIMIT ? OFFSET ?
  `.trim();

  params.push(limit, offset);
  return { sql, params };
}

export function buildCountQuery({ filters, missing }) {
  const params = [];
  const where = buildWhere({ filters, missing }, params);

  const sql = `
    SELECT COUNT(*) AS total
    ${baseFromJoins()}
    ${where}
  `.trim();

  return { sql, params };
}

export function buildGroupCountQuery({ filters, groupBy }) {
  const params = [];
  const where = buildWhere({ filters, missing: null }, params);

  const groupMap = {
    brand: `B.${bt(C.brand.name)}`,
    type: `TY.${bt(C.type.name)}`,
    model: `M.${bt(C.model.name)}`,
    location: `L.${bt(C.location.name)}`,
    status: `I.${bt(C.inventory.status)}`,
  };

  const keyExpr = groupMap[groupBy] || groupMap.location;

  const sql = `
    SELECT ${keyExpr} AS \`key\`, COUNT(*) AS \`count\`
    ${baseFromJoins()}
    ${where}
    GROUP BY ${keyExpr}
    ORDER BY \`count\` DESC
    LIMIT 500
  `.trim();

  return { sql, params };
}

export function buildListByIdsQuery({ ids, page, limit, sort }) {
  const safeIds = (ids || []).filter(Boolean);
  if (safeIds.length === 0) return { sql: "SELECT 0 WHERE 1=0", params: [] };

  const params = [];
  const placeholders = safeIds.map(() => "?").join(",");
  safeIds.forEach((id) => params.push(id));

  const offset = (page - 1) * limit;
  const order = sort?.[0] || { field: "createdAt", dir: "desc" };

  // Use I. alias instead of full table name
  const orderColMap = {
    createdAt: `I.${bt(C.inventory.createdAt)}`,
    receptionDate: `I.${bt(C.inventory.receptionDate)}`,
    altaDate: `I.${bt(C.inventory.altaDate)}`,
    bajaDate: `I.${bt(C.inventory.bajaDate)}`,
  };
  const orderCol = orderColMap[order.field] || orderColMap.createdAt;
  const dir = order.dir?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const sql = `
    SELECT
      I.${bt(C.inventory.id)}            AS id,
      I.${bt(C.inventory.status)}        AS status,
      I.${bt(C.inventory.activeNumber)}  AS activeNumber,
      I.${bt(C.inventory.serialNumber)}  AS serialNumber,
      I.${bt(C.inventory.internalFolio)} AS internalFolio,
      I.${bt(C.inventory.enabled)}       AS enabled,
      I.${bt(C.inventory.createdAt)}     AS createdAt,
      I.${bt(C.inventory.receptionDate)} AS receptionDate,
      I.${bt(C.inventory.altaDate)}      AS altaDate,
      I.${bt(C.inventory.bajaDate)}      AS bajaDate,
      M.${bt(C.model.name)}             AS modelName,
      B.${bt(C.brand.name)}             AS brandName,
      TY.${bt(C.type.name)}             AS typeName,
      L.${bt(C.location.name)}          AS locationName,
      INV.${bt(C.invoice.code)}         AS invoiceCode,
      PO.${bt(C.purchaseOrder.code)}    AS purchaseOrderCode
    ${baseFromJoins()}
    WHERE I.${bt(C.inventory.id)} IN (${placeholders})
    ORDER BY ${orderCol} ${dir}
    LIMIT ? OFFSET ?
  `.trim();

  params.push(limit, offset);
  return { sql, params };
}
