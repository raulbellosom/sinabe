import { Router } from "express";
import { z } from "zod";
import { buildPlanFromQuestion } from "../services/planner.js";
import { executePlan } from "../services/executor.js";
import { getKnowledgeMap, getReachablePaths } from "../services/schemaMap.js";

export const aiRouter = Router();

function toLegacyPlan(plan) {
  if (!plan || typeof plan !== "object") return plan;

  const legacy = {
    intent:
      plan.action === "count"
        ? "count_inventories"
        : plan.action === "group"
        ? "group_count_inventories"
        : "list_inventories",
    filters: {},
    missing: null,
    groupBy: null,
    pagination: plan.pagination || null,
    sort: Array.isArray(plan.sort)
      ? plan.sort.map((item) => ({
          field: String(item.path || "Inventory.createdAt").split(".").pop(),
          dir: item.dir || "desc",
        }))
      : [{ field: "createdAt", dir: "desc" }],
  };

  const groupPath = Array.isArray(plan.groupBy) ? plan.groupBy[0] : null;
  if (groupPath) {
    const map = {
      "InventoryBrand.name": "brand",
      "InventoryType.name": "type",
      "Model.name": "model",
      "InventoryLocation.name": "location",
      "Inventory.status": "status",
      "Condition.name": "condition",
    };
    legacy.groupBy = map[groupPath] || groupPath;
  }

  for (const filter of plan.filters || []) {
    const path = filter.path;
    if (!path) continue;

    if (path === "Inventory.enabled" && filter.op === "eq") {
      legacy.filters.enabled = filter.value;
      continue;
    }
    if (path === "Inventory.status" && ["eq", "contains"].includes(filter.op)) {
      legacy.filters.status = filter.value;
      continue;
    }
    if (
      path === "InventoryBrand.name" &&
      ["eq", "contains"].includes(filter.op)
    ) {
      legacy.filters.brand = filter.value;
      continue;
    }
    if (
      path === "InventoryType.name" &&
      ["eq", "contains"].includes(filter.op)
    ) {
      legacy.filters.type = filter.value;
      continue;
    }
    if (path === "Model.name" && ["eq", "contains"].includes(filter.op)) {
      legacy.filters.model = filter.value;
      continue;
    }
    if (
      path === "InventoryLocation.name" &&
      ["eq", "contains"].includes(filter.op)
    ) {
      legacy.filters.location = filter.value;
      continue;
    }
    if (path === "Condition.name" && ["eq", "contains"].includes(filter.op)) {
      legacy.filters.condition = filter.value;
      continue;
    }
  }

  return legacy;
}

const QueryBodySchema = z.object({
  q: z.string().min(1).max(3000),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
});

/**
 * POST /ai/query
 * Main endpoint - natural language query for inventories
 *
 * Response types:
 * - list: { type: 'list', total: number, items: Inventory[], page, limit }
 * - aggregation: { type: 'aggregation', metric: 'count', total: number }
 * - aggregation grouped: { type: 'aggregation', metric: 'count', groupBy: string, rows: [{key, count}] }
 * - mixed (missing): { type: 'mixed', total: number, items: Inventory[] }
 */
aiRouter.post("/query", async (req, res) => {
  const startTime = Date.now();

  try {
    const parsed = QueryBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: "Invalid body",
        details: parsed.error.flatten(),
      });
    }

    const { q, page = 1 } = parsed.data;
    const limit = Math.min(
      parsed.data.limit ?? Number(process.env.DEFAULT_LIMIT || 50),
      Number(process.env.MAX_LIMIT || 200)
    );

    const planOrClarification = await buildPlanFromQuestion(q, { page, limit });
    const elapsed = Date.now() - startTime;

    if (planOrClarification?.type === "need_clarification") {
      return res.json({
        ok: true,
        query: q,
        plan: null,
        pagination: { page, limit },
        elapsed: `${elapsed}ms`,
        ...planOrClarification,
      });
    }

    const result = await executePlan(planOrClarification);
    const resultPlan = result?.meta?.plan || planOrClarification;
    const legacyPlan = toLegacyPlan(resultPlan);

    // Keep top-level `plan` for frontend compatibility, but authoritative plan is in result.meta.plan
    const payload = {
      ok: true,
      query: q,
      plan: legacyPlan,
      pagination: { page, limit },
      elapsed: `${elapsed}ms`,
      ...result,
    };

    res.json(payload);
  } catch (error) {
    console.error("[AI Query Error]", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Internal server error",
      elapsed: `${Date.now() - startTime}ms`,
    });
  }
});

/**
 * GET /ai/config
 * Returns current AI service configuration (useful for frontend)
 */
aiRouter.get("/config", (req, res) => {
  const knowledge = getKnowledgeMap();
  const reachablePaths = getReachablePaths({ maxDepth: 3 });

  const groupable = reachablePaths
    .filter((entry) => ["name", "status", "code", "type"].includes(entry.field))
    .map((entry) => entry.path)
    .slice(0, 30);
  const statusOptions =
    reachablePaths.find((entry) => entry.path === "Inventory.status")
      ?.enumValues || [];

  res.json({
    ok: true,
    features: {
      ollama: process.env.USE_OLLAMA === "true",
      qdrant: process.env.ENABLE_QDRANT === "true",
      schemaDriven: true,
    },
    limits: {
      maxLimit: Number(process.env.MAX_LIMIT || 200),
      defaultLimit: Number(process.env.DEFAULT_LIMIT || 50),
    },
    intents: [
      "list_inventories",
      "count_inventories",
      "group_count_inventories",
    ],
    actions: ["list", "count", "group"],
    operators: ["eq", "contains", "in", "between", "isNull", "notNull"],
    groupByOptions: groupable,
    statusOptions,
    schema: {
      modelCount: Object.keys(knowledge.models || {}).length,
      schemaPath: knowledge.schemaPath,
      inventoryReachableFields: reachablePaths.length,
      inventoryReachableFieldPaths: reachablePaths.map((x) => x.path),
    },
    examples: [
      "cuántos switches tengo en condición sin usar",
      "cuántos inventarios por condición",
      "cuántos inventarios en resguardo activo",
      "lista inventarios en T2 con marca Cisco",
      "cuántos inventarios deshabilitados",
    ],
  });
});

/**
 * GET /ai/suggestions
 * Returns example queries for the UI
 */
aiRouter.get("/suggestions", (req, res) => {
  res.json({
    ok: true,
    suggestions: [
      {
        category: "Conteos",
        examples: [
          "Cuántos inventarios hay",
          "Cuántos inventarios deshabilitados",
          "Cuántos switches tengo en condición sin usar",
        ],
      },
      {
        category: "Agrupaciones",
        examples: [
          "Cuántos inventarios por condición",
          "Cuántos inventarios por marca",
          "Cuántos inventarios por ubicación",
        ],
      },
      {
        category: "Relaciones",
        examples: [
          "Cuántos inventarios en resguardo activo",
          "Lista inventarios en T2 con marca Cisco",
          "Lista inventarios con condición sin usar",
        ],
      },
    ],
  });
});
