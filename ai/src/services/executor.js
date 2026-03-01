import { getPool } from "./mysql.js";
import {
  buildCountQuery,
  buildGroupCountQuery,
  buildListQuery,
  buildSuggestionQuery,
  serializePlanForMeta,
} from "./sqlBuilder.js";

const INCLUDE_SQL_META = process.env.AI_INCLUDE_SQL_META !== "false";

async function queryRows(pool, built) {
  const [rows] = await pool.query(built.sql, built.params);
  return rows;
}

function buildMeta(plan, builtMeta, extra = {}) {
  const meta = {
    plan: serializePlanForMeta(plan),
    appliedFilters: builtMeta.appliedFilters || [],
    joinsUsed: builtMeta.joinsUsed || [],
    ...extra,
  };

  if (INCLUDE_SQL_META) {
    meta.sql = builtMeta.sql;
    meta.params = builtMeta.params;
  }

  return meta;
}

function normalizeSuggestionRows(rows) {
  return (rows || [])
    .map((row) => String(row.value || "").trim())
    .filter(Boolean)
    .filter((value, idx, arr) => arr.indexOf(value) === idx);
}

async function getSuggestionsForZeroResult(pool, plan, maxFilters = 2) {
  const suggestions = [];

  for (const filter of plan.filters || []) {
    if (suggestions.length >= maxFilters) break;

    const built = buildSuggestionQuery(filter, 8);
    if (!built) continue;

    const rows = await queryRows(pool, built);
    const values = normalizeSuggestionRows(rows).slice(0, 5);
    if (!values.length) continue;

    suggestions.push({
      path: filter.path,
      requestedValue: filter.value,
      options: values,
    });
  }

  return suggestions;
}

function asNeedClarification(message, suggestions, meta) {
  const options = suggestions.flatMap((item) =>
    item.options.map((option) => `${item.path}: ${option}`)
  );

  return {
    type: "need_clarification",
    message,
    options,
    suggestions,
    meta,
  };
}

export async function executePlan(plan) {
  const pool = getPool();
  const page = Number(plan.pagination?.page || 1);
  const limit = Number(plan.pagination?.limit || 50);

  try {
    if (plan.action === "count") {
      const built = buildCountQuery(plan);
      const rows = await queryRows(pool, built);
      const total = Number(rows?.[0]?.total || 0);
      const meta = buildMeta(plan, built.meta);

      if (total === 0) {
        const suggestions = await getSuggestionsForZeroResult(pool, plan);
        if (suggestions.length > 0) {
          return asNeedClarification(
            "No encontré resultados exactos. ¿Quizá quisiste alguno de estos valores?",
            suggestions,
            meta
          );
        }
      }

      return {
        type: "aggregation",
        metric: "count",
        total,
        message: `Total: ${total} inventarios`,
        meta,
      };
    }

    if (plan.action === "group") {
      const built = buildGroupCountQuery(plan);
      const rows = await queryRows(pool, built);
      const total = rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
      const groupBy = plan.groupBy?.[0] || null;
      const meta = buildMeta(plan, built.meta);

      if (rows.length === 0) {
        const suggestions = await getSuggestionsForZeroResult(pool, plan);
        if (suggestions.length > 0) {
          return asNeedClarification(
            "No encontré grupos con esos filtros. Revisa estos valores parecidos:",
            suggestions,
            meta
          );
        }
      }

      return {
        type: "aggregation",
        metric: "count",
        groupBy,
        rows,
        total,
        message: `${rows.length} grupos encontrados`,
        meta,
      };
    }

    const countBuilt = buildCountQuery(plan);
    const listBuilt = buildListQuery(plan);
    const [countRows, items] = await Promise.all([
      queryRows(pool, countBuilt),
      queryRows(pool, listBuilt),
    ]);
    const total = Number(countRows?.[0]?.total || 0);

    const meta = buildMeta(plan, {
      ...listBuilt.meta,
      sql: INCLUDE_SQL_META
        ? {
            list: listBuilt.meta.sql,
            count: countBuilt.meta.sql,
          }
        : undefined,
      params: INCLUDE_SQL_META
        ? {
            list: listBuilt.meta.params,
            count: countBuilt.meta.params,
          }
        : undefined,
    });

    if (total === 0) {
      const suggestions = await getSuggestionsForZeroResult(pool, plan);
      if (suggestions.length > 0) {
        return asNeedClarification(
          "No encontré resultados exactos. ¿Te refieres a alguno de estos valores?",
          suggestions,
          meta
        );
      }
    }

    return {
      type: "list",
      total,
      items,
      page,
      limit,
      hasMore: total > page * limit,
      message: `${total} inventarios encontrados`,
      meta,
    };
  } catch (error) {
    console.error("[Executor Error]", error);
    throw new Error(`Error ejecutando consulta: ${error.message}`);
  }
}
