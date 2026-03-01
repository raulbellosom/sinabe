import { findPathByHints, getSchemaMap, resolveRelationPath } from "./schemaMap.js";

function bt(name) {
  return `\`${name}\``;
}

function col(alias, columnName) {
  return `${alias}.${bt(columnName)}`;
}

function jsonValue(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function makeContext(plan) {
  const map = getSchemaMap();
  const baseModel = map.models.Inventory;
  if (!baseModel) {
    throw new Error('Model "Inventory" does not exist in schema.prisma');
  }

  const ctx = {
    map,
    plan,
    baseAlias: "I",
    aliasCount: 1,
    joins: [],
    joinIndex: new Map(),
    where: [],
    params: [],
    appliedFilters: [],
    joinsUsed: [],
    modelAliases: new Map([["Inventory", new Set(["I"])]]),
    enabledAliasByModel: new Map([["Inventory", new Set(["I"])]]),
    explicitEnabledModels: new Set(),
    resolvedCache: new Map(),
  };

  return ctx;
}

function getResolvedPath(ctx, path) {
  if (ctx.resolvedCache.has(path)) return ctx.resolvedCache.get(path);
  const resolved = resolveRelationPath(path);
  if (!resolved?.ok) {
    throw new Error(resolved?.reason || `Invalid filter path: ${path}`);
  }
  if (resolved.ambiguous) {
    throw new Error(`Ambiguous relation path: ${path}`);
  }
  ctx.resolvedCache.set(path, resolved);
  return resolved;
}

function registerModelAlias(ctx, model, alias) {
  if (!ctx.modelAliases.has(model)) ctx.modelAliases.set(model, new Set());
  ctx.modelAliases.get(model).add(alias);
}

function markEnabledAlias(ctx, model, alias) {
  if (!ctx.enabledAliasByModel.has(model)) {
    ctx.enabledAliasByModel.set(model, new Set());
  }
  ctx.enabledAliasByModel.get(model).add(alias);
}

function ensureJoin(ctx, fromAlias, edge) {
  const key = [
    fromAlias,
    edge.fromModel,
    edge.toModel,
    edge.fromColumn,
    edge.toColumn,
    edge.relationName || "",
    edge.viaField || "",
  ].join("|");

  const existing = ctx.joinIndex.get(key);
  if (existing) return existing;

  const toAlias = `J${ctx.aliasCount++}`;
  const toModel = ctx.map.models[edge.toModel];
  if (!toModel) {
    throw new Error(`Unknown model in join: ${edge.toModel}`);
  }

  ctx.joins.push(
    `LEFT JOIN ${bt(toModel.table)} ${toAlias} ON ${col(
      fromAlias,
      edge.fromColumn
    )} = ${col(toAlias, edge.toColumn)}`
  );
  ctx.joinIndex.set(key, toAlias);

  ctx.joinsUsed.push({
    from: edge.fromModel,
    to: edge.toModel,
    fromAlias,
    toAlias,
    fromColumn: edge.fromColumn,
    toColumn: edge.toColumn,
    kind: edge.kind,
    viaField: edge.viaField || null,
  });

  registerModelAlias(ctx, edge.toModel, toAlias);
  return toAlias;
}

function ensurePathAlias(ctx, path, { markEnabled = false } = {}) {
  const resolved = getResolvedPath(ctx, path);
  let currentAlias = ctx.baseAlias;
  if (markEnabled) markEnabledAlias(ctx, "Inventory", ctx.baseAlias);

  for (const step of resolved.steps) {
    currentAlias = ensureJoin(ctx, currentAlias, step);
    if (markEnabled) {
      markEnabledAlias(ctx, step.toModel, currentAlias);
    }
  }

  return { alias: currentAlias, resolved };
}

function pushWhere(ctx, sql, ...params) {
  ctx.where.push(sql);
  if (params.length) ctx.params.push(...params);
}

function buildFilterSql(ctx, filter) {
  const { alias, resolved } = ensurePathAlias(ctx, filter.path, {
    markEnabled: true,
  });
  const field = resolved.field;
  const model = ctx.map.models[resolved.targetModel];
  const columnSql = col(alias, field.column);
  const op = filter.op;
  const value = filter.value;
  const isText = field.type === "String" || field.isEnum;

  if (field.name === "enabled") {
    ctx.explicitEnabledModels.add(resolved.targetModel);
  }

  if (op === "isNull") {
    pushWhere(ctx, `${columnSql} IS NULL`);
  } else if (op === "notNull") {
    pushWhere(ctx, `${columnSql} IS NOT NULL`);
  } else if (op === "eq") {
    if (isText) {
      pushWhere(ctx, `LOWER(${columnSql}) = LOWER(?)`, value);
    } else {
      pushWhere(ctx, `${columnSql} = ?`, value);
    }
  } else if (op === "contains") {
    if (!isText) throw new Error(`Operator contains is not valid for ${filter.path}`);
    pushWhere(ctx, `LOWER(${columnSql}) LIKE LOWER(?)`, `%${String(value || "").trim()}%`);
  } else if (op === "in") {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`Operator in requires a non-empty array for ${filter.path}`);
    }
    const placeholders = value.map(() => (isText ? "LOWER(?)" : "?")).join(", ");
    const expr = isText ? `LOWER(${columnSql}) IN (${placeholders})` : `${columnSql} IN (${placeholders})`;
    pushWhere(ctx, expr, ...value);
  } else if (op === "between") {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error(`Operator between requires [start, end] for ${filter.path}`);
    }
    pushWhere(ctx, `${columnSql} BETWEEN ? AND ?`, value[0], value[1]);
  } else {
    throw new Error(`Unsupported operator "${op}" in ${filter.path}`);
  }

  ctx.appliedFilters.push({
    path: filter.path,
    op: filter.op,
    value: filter.value,
    model: model.name,
    field: field.name,
  });
}

function applyPlanFilters(ctx) {
  for (const filter of ctx.plan.filters || []) {
    buildFilterSql(ctx, filter);
  }
}

function applyDefaultEnabledFilters(ctx) {
  for (const [modelName, aliases] of ctx.enabledAliasByModel.entries()) {
    const model = ctx.map.models[modelName];
    if (!model?.hasEnabled) continue;
    if (ctx.explicitEnabledModels.has(modelName)) continue;

    const enabledField = model.fields.enabled;
    if (!enabledField) continue;

    for (const alias of aliases) {
      pushWhere(ctx, `${col(alias, enabledField.column)} = ?`, 1);
      ctx.appliedFilters.push({
        path: `${modelName}.enabled`,
        op: "eq",
        value: true,
        auto: true,
      });
    }
  }
}

function buildWhereClause(ctx) {
  return ctx.where.length ? `WHERE ${ctx.where.join(" AND ")}` : "";
}

function buildJoinsClause(ctx) {
  return ctx.joins.join("\n");
}

function buildOrderByClause(ctx, fallbackPath) {
  const orderItems = [];
  const sort = Array.isArray(ctx.plan.sort) ? ctx.plan.sort : [];

  for (const item of sort) {
    try {
      const sortPath = item?.path || fallbackPath;
      const { alias, resolved } = ensurePathAlias(ctx, sortPath);
      const dir = String(item?.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
      orderItems.push(`${col(alias, resolved.field.column)} ${dir}`);
    } catch {
      // Ignore invalid sort clause and continue
    }
  }

  if (orderItems.length === 0) {
    const { alias, resolved } = ensurePathAlias(ctx, fallbackPath);
    orderItems.push(`${col(alias, resolved.field.column)} DESC`);
  }

  return `ORDER BY ${orderItems.join(", ")}`;
}

function selectPreferredPath(ctx, path, aliasName, aggregate = "ANY_VALUE") {
  if (!path) return null;
  try {
    const { alias, resolved } = ensurePathAlias(ctx, path);
    return `${aggregate}(${col(alias, resolved.field.column)}) AS ${bt(aliasName)}`;
  } catch {
    return null;
  }
}

function buildListSelect(ctx) {
  const inventory = ctx.map.models.Inventory;
  const pickInventoryField = (name) => inventory.fields[name]?.column || null;

  const base = [];
  const idCol = pickInventoryField("id");
  if (!idCol) throw new Error("Inventory.id is required");

  base.push(`${col(ctx.baseAlias, idCol)} AS ${bt("id")}`);

  const inventoryFields = [
    "status",
    "activeNumber",
    "serialNumber",
    "internalFolio",
    "comments",
    "enabled",
    "createdAt",
    "receptionDate",
    "altaDate",
    "bajaDate",
  ];

  for (const fieldName of inventoryFields) {
    const columnName = pickInventoryField(fieldName);
    if (!columnName) continue;
    base.push(
      `ANY_VALUE(${col(ctx.baseAlias, columnName)}) AS ${bt(fieldName)}`
    );
  }

  const modelNamePath = findPathByHints(["model"], {
    preferredFields: ["name", "code"],
  });
  const brandNamePath = findPathByHints(["brand"], {
    preferredFields: ["name", "code"],
  });
  const typeNamePath = findPathByHints(["type"], {
    preferredFields: ["name", "code"],
  });
  const locationNamePath = findPathByHints(["location"], {
    preferredFields: ["name", "code"],
  });
  const invoiceCodePath = findPathByHints(["invoice"], {
    preferredFields: ["code", "name"],
  });
  const purchaseOrderCodePath = findPathByHints(["purchase", "order"], {
    preferredFields: ["code", "name"],
  });

  const extraColumns = [
    selectPreferredPath(ctx, modelNamePath, "modelName"),
    selectPreferredPath(ctx, brandNamePath, "brandName"),
    selectPreferredPath(ctx, typeNamePath, "typeName"),
    selectPreferredPath(ctx, locationNamePath, "locationName"),
    selectPreferredPath(ctx, invoiceCodePath, "invoiceCode"),
    selectPreferredPath(ctx, purchaseOrderCodePath, "purchaseOrderCode"),
  ].filter(Boolean);

  const conditionPath = findPathByHints(["condition"], {
    preferredFields: ["name", "code"],
  });
  if (conditionPath) {
    try {
      const { alias, resolved } = ensurePathAlias(ctx, conditionPath);
      extraColumns.push(
        `GROUP_CONCAT(DISTINCT ${col(alias, resolved.field.column)} ORDER BY ${col(
          alias,
          resolved.field.column
        )} SEPARATOR ' | ') AS ${bt("conditionNames")}`
      );
    } catch {
      // Optional relation, ignore if unresolved
    }
  }

  const customFieldNamePath = findPathByHints(["custom", "field"], {
    preferredFields: ["name"],
  });
  const customFieldValuePath = findPathByHints(["custom", "field", "value"], {
    preferredFields: ["value"],
  });

  if (customFieldNamePath && customFieldValuePath) {
    try {
      const nameRef = ensurePathAlias(ctx, customFieldNamePath);
      const valueRef = ensurePathAlias(ctx, customFieldValuePath);
      extraColumns.push(
        `GROUP_CONCAT(DISTINCT CONCAT(COALESCE(${col(
          nameRef.alias,
          nameRef.resolved.field.column
        )}, ''), ': ', COALESCE(${col(
          valueRef.alias,
          valueRef.resolved.field.column
        )}, '')) SEPARATOR ' | ') AS ${bt("customFieldsText")}`
      );
    } catch {
      // Optional relation, ignore if unresolved
    }
  }

  return [...base, ...extraColumns];
}

function buildMeta(ctx, sql) {
  return {
    sql,
    params: [...ctx.params],
    joinsUsed: ctx.joinsUsed,
    appliedFilters: ctx.appliedFilters,
  };
}

export function buildCountQuery(plan) {
  const ctx = makeContext(plan);
  applyPlanFilters(ctx);
  applyDefaultEnabledFilters(ctx);

  const inventoryIdColumn = ctx.map.models.Inventory.fields.id.column;
  const sql = `
    SELECT COUNT(DISTINCT ${col(ctx.baseAlias, inventoryIdColumn)}) AS total
    FROM ${bt(ctx.map.models.Inventory.table)} ${ctx.baseAlias}
    ${buildJoinsClause(ctx)}
    ${buildWhereClause(ctx)}
  `.trim();

  return {
    sql,
    params: ctx.params,
    meta: buildMeta(ctx, sql),
  };
}

export function buildGroupCountQuery(plan) {
  const ctx = makeContext(plan);
  const groupPath = plan.groupBy?.[0];
  if (!groupPath) throw new Error("group action requires groupBy[0]");

  const groupRef = ensurePathAlias(ctx, groupPath, { markEnabled: true });
  const groupExpr = col(groupRef.alias, groupRef.resolved.field.column);

  applyPlanFilters(ctx);
  applyDefaultEnabledFilters(ctx);

  const inventoryIdColumn = ctx.map.models.Inventory.fields.id.column;
  const sql = `
    SELECT ${groupExpr} AS ${bt("key")}, COUNT(DISTINCT ${col(
    ctx.baseAlias,
    inventoryIdColumn
  )}) AS ${bt("count")}
    FROM ${bt(ctx.map.models.Inventory.table)} ${ctx.baseAlias}
    ${buildJoinsClause(ctx)}
    ${buildWhereClause(ctx)}
    GROUP BY ${groupExpr}
    ORDER BY ${bt("count")} DESC
    LIMIT 500
  `.trim();

  return {
    sql,
    params: ctx.params,
    meta: buildMeta(ctx, sql),
  };
}

export function buildListQuery(plan) {
  const ctx = makeContext(plan);
  applyPlanFilters(ctx);

  const selectColumns = buildListSelect(ctx);
  applyDefaultEnabledFilters(ctx);

  const inventoryIdColumn = ctx.map.models.Inventory.fields.id.column;
  const orderBy = buildOrderByClause(ctx, "Inventory.createdAt");
  const page = Number(plan.pagination?.page || 1);
  const limit = Number(plan.pagination?.limit || 50);
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      ${selectColumns.join(",\n      ")}
    FROM ${bt(ctx.map.models.Inventory.table)} ${ctx.baseAlias}
    ${buildJoinsClause(ctx)}
    ${buildWhereClause(ctx)}
    GROUP BY ${col(ctx.baseAlias, inventoryIdColumn)}
    ${orderBy}
    LIMIT ? OFFSET ?
  `.trim();

  ctx.params.push(limit, offset);

  return {
    sql,
    params: ctx.params,
    meta: buildMeta(ctx, sql),
  };
}

export function buildSuggestionQuery(filter, limit = 5) {
  if (!filter?.path) return null;
  if (!["eq", "contains", "in"].includes(filter.op)) return null;

  const pathResolved = resolveRelationPath(filter.path);
  if (!pathResolved?.ok || pathResolved.ambiguous) return null;

  const field = pathResolved.field;
  if (!(field.type === "String" || field.isEnum)) return null;

  const model = getSchemaMap().models[pathResolved.targetModel];
  if (!model) return null;

  const rawValue = Array.isArray(filter.value) ? filter.value[0] : filter.value;
  const value = String(rawValue || "").trim();
  if (!value) return null;

  const where = [`LOWER(${bt(field.column)}) LIKE LOWER(?)`];
  const params = [`%${value}%`];

  if (model.hasEnabled && field.name !== "enabled" && model.fields.enabled) {
    where.push(`${bt(model.fields.enabled.column)} = ?`);
    params.push(1);
  }

  const sql = `
    SELECT DISTINCT ${bt(field.column)} AS ${bt("value")}
    FROM ${bt(model.table)}
    WHERE ${where.join(" AND ")}
    ORDER BY ${bt(field.column)} ASC
    LIMIT ?
  `.trim();

  params.push(Number(limit));

  return {
    sql,
    params,
    meta: {
      path: filter.path,
      requestedValue: value,
    },
  };
}

export function serializePlanForMeta(plan) {
  return {
    entity: plan.entity,
    action: plan.action,
    filters: plan.filters || [],
    groupBy: plan.groupBy || [],
    pagination: plan.pagination || null,
    sort: plan.sort || [],
    hash: jsonValue({
      action: plan.action,
      filters: plan.filters,
      groupBy: plan.groupBy,
    }),
  };
}
