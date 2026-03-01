import { getPool } from "./mysql.js";
import {
  buildCountQuery,
  buildGroupCountQuery,
  buildListQuery,
  buildSuggestionQuery,
} from "./sqlBuilder.js";

async function runQuery(sql, params) {
  const pool = getPool();
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function countInventories(plan) {
  const built = buildCountQuery(plan);
  const rows = await runQuery(built.sql, built.params);
  return {
    total: Number(rows?.[0]?.total || 0),
    meta: built.meta,
  };
}

export async function listInventories(plan) {
  const built = buildListQuery(plan);
  const rows = await runQuery(built.sql, built.params);
  return {
    rows,
    meta: built.meta,
  };
}

export async function groupCountInventories(plan) {
  const built = buildGroupCountQuery(plan);
  const rows = await runQuery(built.sql, built.params);
  return {
    rows,
    meta: built.meta,
  };
}

export async function suggestFilterValues(filter, limit = 5) {
  const built = buildSuggestionQuery(filter, limit);
  if (!built) return [];
  const rows = await runQuery(built.sql, built.params);
  return rows;
}
