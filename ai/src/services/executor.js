import {
  listInventories,
  countInventories,
  groupCountInventories,
  listInventoriesByIds,
} from "./inventoryRepo.js";
import { semanticCandidateIds } from "./semantic.js";

/**
 * Execute plan and return results with proper type annotations for frontend
 * @param {Object} plan - The execution plan from planner
 * @returns {Object} Result with type indicator
 */
export async function executePlan(plan) {
  const { intent, filters, pagination, sort, groupBy, missing } = plan;
  const { page, limit } = pagination;

  try {
    // COUNT: Simple total count
    if (intent === "count_inventories") {
      const total = await countInventories({ filters, missing: null });
      return {
        type: "aggregation",
        metric: "count",
        total,
        message: `Total: ${total} inventarios`,
      };
    }

    // GROUP COUNT: Counts grouped by field
    if (intent === "group_count_inventories") {
      const groupField = groupBy || "location";
      const rows = await groupCountInventories({
        filters,
        groupBy: groupField,
      });
      const total = rows.reduce((sum, r) => sum + Number(r.count || 0), 0);
      return {
        type: "aggregation",
        metric: "count",
        groupBy: groupField,
        rows,
        total,
        message: `${rows.length} grupos encontrados, ${total} inventarios en total`,
      };
    }

    // MISSING: List items with missing field/relation
    if (intent === "missing_inventories") {
      const total = await countInventories({ filters, missing });
      const items = await listInventories({
        filters,
        missing,
        page,
        limit,
        sort,
      });
      return {
        type: "mixed",
        total,
        items,
        page,
        limit,
        hasMore: total > page * limit,
        message: `${total} inventarios sin ${
          missing?.field || "campo especificado"
        }`,
      };
    }

    // SEMANTIC SEARCH: Vector similarity search
    if (intent === "search_inventories") {
      const ids = await semanticCandidateIds(plan);
      if (ids.length === 0) {
        return {
          type: "list",
          total: 0,
          items: [],
          page,
          limit,
          hasMore: false,
          message: "No se encontraron resultados semánticos",
        };
      }
      const items = await listInventoriesByIds({ ids, page, limit, sort });
      return {
        type: "list",
        total: ids.length,
        items,
        page,
        limit,
        hasMore: ids.length > page * limit,
        message: `${ids.length} inventarios encontrados por similitud`,
      };
    }

    // LIST: Default list with filters
    const total = await countInventories({ filters, missing: null });
    const items = await listInventories({
      filters,
      missing: null,
      page,
      limit,
      sort,
    });
    return {
      type: "list",
      total,
      items,
      page,
      limit,
      hasMore: total > page * limit,
      message: `${total} inventarios encontrados`,
    };
  } catch (error) {
    console.error("[Executor Error]", error);
    throw new Error(`Error ejecutando consulta: ${error.message}`);
  }
}
