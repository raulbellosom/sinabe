import { Router } from "express";
import { z } from "zod";
import { buildPlanFromQuestion } from "../services/planner.js";
import { executePlan } from "../services/executor.js";

export const aiRouter = Router();

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

    const plan = await buildPlanFromQuestion(q, { page, limit });
    const result = await executePlan(plan);

    const elapsed = Date.now() - startTime;

    res.json({
      ok: true,
      query: q,
      plan,
      pagination: { page, limit },
      elapsed: `${elapsed}ms`,
      ...result,
    });
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
  res.json({
    ok: true,
    features: {
      ollama: process.env.USE_OLLAMA === "true",
      qdrant: process.env.ENABLE_QDRANT === "true",
      semantic:
        process.env.USE_OLLAMA === "true" &&
        process.env.ENABLE_QDRANT === "true",
    },
    limits: {
      maxLimit: Number(process.env.MAX_LIMIT || 200),
      defaultLimit: Number(process.env.DEFAULT_LIMIT || 50),
    },
    intents: [
      "list_inventories",
      "count_inventories",
      "group_count_inventories",
      "missing_inventories",
      "search_inventories",
    ],
    groupByOptions: ["brand", "type", "model", "location", "status"],
    missingFields: [
      "activeNumber",
      "serialNumber",
      "internalFolio",
      "location",
      "invoice",
      "purchaseOrder",
      "receptionDate",
      "altaDate",
      "bajaDate",
    ],
    statusOptions: ["ALTA", "BAJA", "PROPUESTA"],
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
        category: "Listas",
        examples: [
          "Lista inventarios Avigilon creados entre octubre y noviembre",
          "Inventarios ALTA en ubicación CCTV",
          "Muéstrame inventarios con factura pero sin orden de compra",
        ],
      },
      {
        category: "Conteos",
        examples: [
          "Cuántos inventarios hay de la marca Avigilon",
          "Total de inventarios BAJA",
          "Cuántos inventarios no tienen número de serie",
        ],
      },
      {
        category: "Agrupaciones",
        examples: [
          "Cuántos inventarios hay por ubicación",
          "Conteo por marca (solo ALTA)",
          "Cuántos por tipo de inventario",
        ],
      },
      {
        category: "Faltantes",
        examples: [
          "Lista inventarios sin ubicación",
          "Inventarios sin factura",
          "Inventarios sin número de activo",
        ],
      },
    ],
  });
});
