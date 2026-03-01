import "dotenv/config";
import { buildPlanFromQuestion } from "../services/planner.js";
import { executePlan } from "../services/executor.js";
import {
  buildCountQuery,
  buildGroupCountQuery,
  buildListQuery,
} from "../services/sqlBuilder.js";

const TEST_QUERIES = [
  "cuántos switches tengo en condición sin usar",
  "cuántos inventarios por condición",
  "cuántos inventarios en resguardo activo",
  "lista inventarios en T2 con marca Cisco",
  "cuántos inventarios deshabilitados",
];

async function runOne(question) {
  const page = 1;
  const limit = 25;
  const planned = await buildPlanFromQuestion(question, { page, limit });

  if (planned?.type === "need_clarification") {
    return {
      query: question,
      type: planned.type,
      message: planned.message,
      options: planned.options || [],
      meta: planned.meta || {},
    };
  }

  let preview = null;
  try {
    if (planned.action === "count") {
      const built = buildCountQuery(planned);
      preview = {
        sql: built.sql,
        params: built.params,
        joinsUsed: built.meta?.joinsUsed || [],
      };
    } else if (planned.action === "group") {
      const built = buildGroupCountQuery(planned);
      preview = {
        sql: built.sql,
        params: built.params,
        joinsUsed: built.meta?.joinsUsed || [],
      };
    } else {
      const built = buildListQuery(planned);
      preview = {
        sql: built.sql,
        params: built.params,
        joinsUsed: built.meta?.joinsUsed || [],
      };
    }
  } catch (error) {
    preview = { error: error.message };
  }

  const result = await executePlan(planned);
  return {
    query: question,
    type: result.type,
    plan: planned,
    joinsUsed: result.meta?.joinsUsed || preview?.joinsUsed || [],
    appliedFilters: result.meta?.appliedFilters || [],
    sql: result.meta?.sql || preview?.sql || null,
    params: result.meta?.params || preview?.params || null,
    summary: {
      total: result.total ?? null,
      rows: Array.isArray(result.rows) ? result.rows.length : null,
      items: Array.isArray(result.items) ? result.items.length : null,
    },
    result:
      result.type === "list"
        ? { ...result, items: (result.items || []).slice(0, 3) }
        : result,
  };
}

async function main() {
  for (const query of TEST_QUERIES) {
    console.log("\n============================================================");
    console.log(`Query: ${query}`);
    console.log("------------------------------------------------------------");

    try {
      const output = await runOne(query);
      console.log(JSON.stringify(output, null, 2));
    } catch (error) {
      let plan = null;
      let sql = null;
      let params = null;
      let joinsUsed = [];

      try {
        const planned = await buildPlanFromQuestion(query, { page: 1, limit: 25 });
        if (!planned?.type) {
          plan = planned;
          const built =
            planned.action === "count"
              ? buildCountQuery(planned)
              : planned.action === "group"
              ? buildGroupCountQuery(planned)
              : buildListQuery(planned);
          sql = built.sql;
          params = built.params;
          joinsUsed = built.meta?.joinsUsed || [];
        }
      } catch {
        // Keep original execution error payload.
      }

      console.error(
        JSON.stringify(
          {
            query,
            plan,
            joinsUsed,
            sql,
            params,
            error: error.message,
          },
          null,
          2
        )
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
