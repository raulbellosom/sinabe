import { getPool } from './mysql.js';
import { buildListQuery, buildCountQuery, buildGroupCountQuery, buildListByIdsQuery } from './sqlBuilder.js';

export async function listInventories({ filters, missing, page, limit, sort }) {
  const pool = getPool();
  const { sql, params } = buildListQuery({ filters, missing, page, limit, sort });
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function countInventories({ filters, missing }) {
  const pool = getPool();
  const { sql, params } = buildCountQuery({ filters, missing });
  const [rows] = await pool.query(sql, params);
  return Number(rows?.[0]?.total || 0);
}

export async function groupCountInventories({ filters, groupBy }) {
  const pool = getPool();
  const { sql, params } = buildGroupCountQuery({ filters, groupBy });
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function listInventoriesByIds({ ids, page, limit, sort }) {
  const pool = getPool();
  const { sql, params } = buildListByIdsQuery({ ids, page, limit, sort });
  const [rows] = await pool.query(sql, params);
  return rows;
}
