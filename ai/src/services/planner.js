import { z } from "zod";
import { DB } from "../config/dbNames.js";
import { ollamaChat } from "./ollama.js";
import { heuristicPlan } from "./planner_heuristic.js";

const DateField = z.enum([
  "createdAt",
  "receptionDate",
  "altaDate",
  "bajaDate",
]);

export const PlanSchema = z.object({
  intent: z.enum([
    "list_inventories",
    "count_inventories",
    "group_count_inventories",
    "missing_inventories",
    "search_inventories",
  ]),
  filters: z
    .object({
      // Campos directos del inventario
      brand: z.string().nullable().optional(),
      brands: z.array(z.string()).nullable().optional(), // Multiple brands (OR)
      type: z.string().nullable().optional(),
      model: z.string().nullable().optional(),
      serialNumber: z.string().nullable().optional(),
      activeNumber: z.string().nullable().optional(),
      status: z.enum(DB.enums.Status).nullable().optional(),
      enabled: z.boolean().nullable().optional(),
      // Relaciones
      location: z.string().nullable().optional(),
      hasInvoice: z.boolean().nullable().optional(),
      hasPurchaseOrder: z.boolean().nullable().optional(),
      // Fechas
      dateField: DateField.nullable().optional(),
      from: z.string().nullable().optional(), // YYYY-MM-DD
      to: z.string().nullable().optional(),
    })
    .default({}),
  missing: z
    .object({
      kind: z.enum(["field", "relation"]),
      field: z.enum([
        "activeNumber",
        "serialNumber",
        "internalFolio",
        "location",
        "invoice",
        "purchaseOrder",
        "receptionDate",
        "altaDate",
        "bajaDate",
      ]),
    })
    .nullable()
    .optional(),
  groupBy: z
    .enum(["brand", "type", "model", "location", "status"])
    .nullable()
    .optional(),
  semantic: z
    .object({
      query: z.string().nullable().optional(),
      topK: z.number().int().min(1).max(200).optional(),
    })
    .nullable()
    .optional(),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(500),
  }),
  sort: z
    .array(
      z.object({
        field: z.enum(["createdAt", "receptionDate", "altaDate", "bajaDate"]),
        dir: z.enum(["asc", "desc"]),
      })
    )
    .default([{ field: "createdAt", dir: "desc" }]),
});

export async function buildPlanFromQuestion(question, { page, limit }) {
  if (process.env.USE_OLLAMA !== "true") {
    return PlanSchema.parse(heuristicPlan(question, { page, limit }));
  }

  const chatModel = process.env.OLLAMA_CHAT_MODEL || "llama3.2:3b";
  const year = new Date().getFullYear();

  const system = `Eres un parser de consultas de inventario. Convierte preguntas en español a JSON.
RESPONDE SOLO JSON VÁLIDO. SIN MARKDOWN. SIN EXPLICACIONES. NO USES COMENTARIOS.

"Sinabe" es el nombre del SISTEMA, NO una marca/tipo/modelo. Ignóralo.

MARCAS CONOCIDAS (ejemplos): HP, Dell, Lenovo, Cisco, Avigilon, Apple, Samsung, LG, Bosch, Axis, Hikvision, Ubiquiti, Meraki, Fortinet, Juniper, Aruba.

INTENTS:
- list_inventories: listar inventarios (muéstrame, lista, dame)
- count_inventories: contar total (cuántos hay, total de)
- group_count_inventories: agrupar conteo (cuántos por, gráfica de, distribución)
- missing_inventories: faltantes (sin ubicación, sin factura)
- search_inventories: búsqueda semántica

REGLAS CRÍTICAS:
1. "gráfica de pie por marca" => groupBy: "brand", sin filtros de marca
2. "gráfica de modelos de HP" o "modelos HP" => groupBy: "model", filters: {brand: "HP"}
   - "modelos de X" significa agrupar por modelo FILTRANDO por marca X
   - HP, Dell, Avigilon, Cisco son MARCAS (brand), no modelos ni tipos
3. "gráfica con modelos de HP y Avigilon" => groupBy: "model", filters: {brands: ["HP", "Avigilon"]}
   - Cuando hay MÚLTIPLES marcas, usa el array "brands" (no "brand")
4. "cuántos por tipo" => groupBy: "type"
5. "laptops HP" => filters: {type: "laptop", brand: "HP"}
6. Para UNA sola marca usa "brand" (string). Para MÚLTIPLES marcas usa "brands" (array).
7. enabled: SIEMPRE debe ser true (excluir eliminados) a menos que explícitamente pidan "incluir eliminados".

FILTROS:
- brand: UN string (ej: "HP") - para una sola marca
- brands: array de strings (ej: ["HP", "Avigilon"]) - para múltiples marcas
- type: UN string (ej: "laptop")
- model: UN string (ej: "EliteBook")
- location: UN string
- status: "ALTA" o "BAJA" o "PROPUESTA"
- enabled: true (SIEMPRE por defecto)

JSON OBLIGATORIO (copia esta estructura):
{
  "intent": "group_count_inventories",
  "filters": {"enabled": true},
  "missing": null,
  "groupBy": "brand",
  "semantic": {"query": null, "topK": 60},
  "pagination": {"page": ${page}, "limit": ${limit}},
  "sort": [{"field": "createdAt", "dir": "desc"}]
}`;

  const resp = await ollamaChat({
    model: chatModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: question },
    ],
  });

  const raw = resp?.message?.content?.trim() ?? "";
  let obj;

  try {
    obj = JSON.parse(raw);
  } catch (e1) {
    // Try extracting first JSON object
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        obj = JSON.parse(raw.slice(first, last + 1));
      } catch (e2) {
        // JSON is malformed, try to clean common LLM issues
        let cleaned = raw.slice(first, last + 1);
        // Remove trailing commas before } or ]
        cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
        // Remove JavaScript-style comments
        cleaned = cleaned.replace(/\/\/[^\n]*/g, "");
        // Try to fix unquoted keys
        cleaned = cleaned.replace(
          /(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
          '$1"$2":'
        );

        try {
          obj = JSON.parse(cleaned);
        } catch (e3) {
          // All JSON parsing attempts failed, use heuristic
          console.log(
            "[Planner] JSON parsing failed, falling back to heuristic. Raw:",
            raw.substring(0, 200)
          );
          obj = heuristicPlan(question, { page, limit });
        }
      }
    } else {
      obj = heuristicPlan(question, { page, limit });
    }
  }

  // Request is authoritative on pagination
  obj.pagination = { page, limit };

  // Ensure filters object exists
  if (!obj.filters) obj.filters = {};

  // IMPORTANT: Default enabled to true (exclude logically deleted records)
  // Only include disabled records if explicitly requested
  if (obj.filters.enabled === undefined || obj.filters.enabled === null) {
    obj.filters.enabled = true;
  }

  // Normalize filter values (LLM may return objects, arrays, or null)
  if (obj.filters) {
    // String fields (single values)
    for (const key of ["brand", "type", "model", "location"]) {
      const val = obj.filters[key];
      if (val === null || val === undefined || val === "") {
        delete obj.filters[key];
      } else if (Array.isArray(val)) {
        // If brand is an array, move it to brands
        if (key === "brand" && val.length > 1) {
          obj.filters.brands = val.map((v) => String(v).trim()).filter(Boolean);
          delete obj.filters[key];
        } else {
          // Take first element if array
          obj.filters[key] = val[0] ? String(val[0]) : undefined;
          if (!obj.filters[key]) delete obj.filters[key];
        }
      } else if (typeof val === "object") {
        // Extract string from object (e.g., {name: "HP"} -> "HP")
        const extracted =
          val.name ||
          val.value ||
          val.id ||
          String(Object.values(val)[0] || "");
        if (extracted) {
          obj.filters[key] = extracted;
        } else {
          delete obj.filters[key];
        }
      }
    }

    // Status field - must be ALTA, BAJA or PROPUESTA
    if (obj.filters.status) {
      let status = obj.filters.status;
      if (Array.isArray(status)) {
        status = status[0];
      }
      if (typeof status === "object") {
        status = status.value || status.name || Object.values(status)[0];
      }
      if (typeof status === "string") {
        status = status.toUpperCase().trim();
        if (!["ALTA", "BAJA", "PROPUESTA"].includes(status)) {
          delete obj.filters.status;
        } else {
          obj.filters.status = status;
        }
      } else {
        delete obj.filters.status;
      }
    }

    // Normalize brands array
    if (obj.filters.brands) {
      if (Array.isArray(obj.filters.brands)) {
        obj.filters.brands = obj.filters.brands
          .map((b) => (typeof b === "string" ? b.trim() : String(b)))
          .filter(Boolean);
        if (obj.filters.brands.length === 0) {
          delete obj.filters.brands;
        } else if (obj.filters.brands.length === 1) {
          // Convert single-element array to brand string
          obj.filters.brand = obj.filters.brands[0];
          delete obj.filters.brands;
        }
      } else {
        delete obj.filters.brands;
      }
    }

    // Boolean fields
    for (const key of ["enabled", "hasInvoice", "hasPurchaseOrder"]) {
      if (obj.filters[key] === null || obj.filters[key] === undefined) {
        delete obj.filters[key];
      } else if (typeof obj.filters[key] !== "boolean") {
        // Try to convert string to boolean
        const val = String(obj.filters[key]).toLowerCase();
        if (val === "true" || val === "1") {
          obj.filters[key] = true;
        } else if (val === "false" || val === "0") {
          obj.filters[key] = false;
        } else {
          delete obj.filters[key];
        }
      }
    }

    // Date fields
    if (obj.filters.dateField) {
      const validDateFields = [
        "createdAt",
        "receptionDate",
        "altaDate",
        "bajaDate",
      ];
      if (!validDateFields.includes(obj.filters.dateField)) {
        obj.filters.dateField = "createdAt"; // Default
      }
    }

    // Clean null/empty dates
    for (const key of ["dateField", "from", "to"]) {
      if (
        obj.filters[key] === null ||
        obj.filters[key] === undefined ||
        obj.filters[key] === ""
      ) {
        delete obj.filters[key];
      }
    }
  }

  // Defaults
  if (!obj.semantic)
    obj.semantic = { query: null, topK: Number(process.env.QDRANT_TOPK || 60) };
  if (obj.semantic && obj.semantic.topK == null)
    obj.semantic.topK = Number(process.env.QDRANT_TOPK || 60);

  return PlanSchema.parse(obj);
}
