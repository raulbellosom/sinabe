import { z } from "zod";
import {
  findPathByHints,
  getReachablePaths,
  resolveRelationPath,
} from "./schemaMap.js";

const OPERATORS = ["eq", "contains", "in", "between", "isNull", "notNull"];
const STOP_WORDS = new Set([
  "inventario",
  "inventarios",
  "equipo",
  "equipos",
  "activos",
  "activo",
  "hay",
  "tengo",
  "tenemos",
  "de",
  "la",
  "el",
  "los",
  "las",
  "en",
  "por",
  "con",
  "sin",
  "para",
  "y",
  "o",
  "que",
  "cuantos",
  "cuantas",
  "cuanto",
  "cuanta",
  "total",
]);

const FilterSchema = z.object({
  path: z.string().min(3),
  op: z.enum(OPERATORS),
  value: z.any().optional(),
});

export const PlanSchema = z.object({
  entity: z.literal("Inventory"),
  action: z.enum(["list", "count", "group"]),
  filters: z.array(FilterSchema).default([]),
  groupBy: z.array(z.string()).default([]),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(500),
  }),
  sort: z
    .array(
      z.object({
        path: z.string().min(3),
        dir: z.enum(["asc", "desc"]),
      })
    )
    .default([{ path: "Inventory.createdAt", dir: "desc" }]),
});

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function singularize(word) {
  if (!word) return word;
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
}

function splitWords(value) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function cleanCapturedValue(value, stopWords = []) {
  if (!value) return null;
  const words = splitWords(value);
  const trailingStops = [
    "hay",
    "tengo",
    "tenemos",
    "tiene",
    "tienen",
    "inventario",
    "inventarios",
    "equipo",
    "equipos",
    "activo",
    "activos",
    "cuantos",
    "cuantas",
    "total",
  ];
  const stops = new Set([
    ...stopWords.map((x) => normalizeText(x)),
    ...trailingStops.map((x) => normalizeText(x)),
  ]);
  const kept = [];

  for (const word of words) {
    if (stops.has(word)) break;
    kept.push(word);
  }

  const joined = kept.join(" ").trim();
  return joined || null;
}

function makeNeedClarification(message, options = [], reason = "ambiguous") {
  return {
    type: "need_clarification",
    message,
    options,
    meta: {
      reason,
    },
  };
}

function buildDomainPaths() {
  const inventoryEnabledPath = resolveRelationPath("Inventory.enabled").ok
    ? "Inventory.enabled"
    : null;
  const inventoryStatusPath = resolveRelationPath("Inventory.status").ok
    ? "Inventory.status"
    : null;
  const inventoryCreatedAtPath = resolveRelationPath("Inventory.createdAt").ok
    ? "Inventory.createdAt"
    : null;

  const explicitCustodyPath = resolveRelationPath(
    "Inventory.custodyItems.custodyRecord.status"
  ).ok
    ? "Inventory.custodyItems.custodyRecord.status"
    : null;

  return {
    inventoryEnabledPath,
    inventoryStatusPath,
    inventoryCreatedAtPath,
    brandPath: findPathByHints(["brand"], {
      preferredFields: ["name", "code"],
    }),
    typePath: findPathByHints(["type"], {
      preferredFields: ["name", "code"],
    }),
    modelPath: findPathByHints(["model"], {
      preferredFields: ["name", "code"],
    }),
    conditionPath: findPathByHints(["condition"], {
      preferredFields: ["name", "code"],
    }),
    locationPath: findPathByHints(["location"], {
      preferredFields: ["name", "code"],
    }),
    custodyStatusPath:
      explicitCustodyPath ||
      findPathByHints(["custody", "status"], {
        preferredFields: ["status", "name"],
      }),
  };
}

function detectAction(normalizedQuestion) {
  const hasCountWords = /\b(cuant\w*|total|conteo|cantidad|numero)\b/.test(
    normalizedQuestion
  );
  const hasGroupWords = /\bpor\b/.test(normalizedQuestion);

  if (hasCountWords && hasGroupWords) return "group";
  if (hasCountWords) return "count";
  if (/\b(lista|listar|muestr|dame|mostrar|ensename)\b/.test(normalizedQuestion))
    return "list";
  return "list";
}

function resolveGroupPath(normalizedQuestion, domain) {
  const aliases = [
    {
      terms: ["condicion", "estado fisico"],
      path: domain.conditionPath,
    },
    {
      terms: ["marca", "brand"],
      path: domain.brandPath,
    },
    {
      terms: ["tipo", "category", "clase"],
      path: domain.typePath,
    },
    {
      terms: ["modelo", "model"],
      path: domain.modelPath,
    },
    {
      terms: ["ubicacion", "area", "lugar", "zona", "terminal"],
      path: domain.locationPath,
    },
    {
      terms: ["status", "estado"],
      path: domain.inventoryStatusPath,
    },
    {
      terms: ["resguardo", "custodia"],
      path: domain.custodyStatusPath,
    },
  ];

  for (const alias of aliases) {
    if (!alias.path) continue;
    const found = alias.terms.some((term) =>
      normalizedQuestion.includes(normalizeText(term))
    );
    if (found) return alias.path;
  }

  const excerpt = normalizedQuestion.match(
    /\bpor\s+([a-z0-9\s]{1,40})(?:$|[,.!?])/
  )?.[1];

  if (excerpt) {
    const terms = splitWords(excerpt).slice(0, 3);
    for (const term of terms) {
      const guessed =
        findPathByHints([term], { preferredFields: ["name", "status", "code"] }) ||
        null;
      if (guessed) return guessed;
    }
  }

  return null;
}

function pushFilter(filters, path, op, value) {
  if (!path) return false;
  const resolved = resolveRelationPath(path);
  if (!resolved.ok || resolved.ambiguous) return false;

  const key = `${path}|${op}|${JSON.stringify(value ?? null)}`;
  if (filters.__seen.has(key)) return true;

  filters.__seen.add(key);
  filters.items.push({
    path,
    op,
    ...(value !== undefined ? { value } : {}),
  });
  return true;
}

function extractAfterKeyword(normalizedQuestion, keywordRegex, stopWords = []) {
  const match = normalizedQuestion.match(
    new RegExp(`${keywordRegex}\\s+([a-z0-9\\s\\-]{1,50})`, "i")
  );
  if (!match?.[1]) return null;
  return cleanCapturedValue(match[1], stopWords);
}

function resolveEnumValue(path, wantedTokens = []) {
  const resolved = resolveRelationPath(path);
  if (!resolved.ok || !resolved.field?.isEnum) return null;
  const enumValues = resolved.field.enumValues || [];
  if (!enumValues.length) return null;

  const wanted = wantedTokens.map((x) => normalizeText(x));
  for (const item of enumValues) {
    const norm = normalizeText(item);
    if (wanted.includes(norm)) return item;
  }

  if (wanted.includes("activo")) {
    const preferred = enumValues.find((x) =>
      ["ACTIVO", "COMPLETADO", "ALTA"].includes(x)
    );
    if (preferred) return preferred;
  }

  return null;
}

function buildFilters(question, normalizedQuestion, action, domain) {
  const filters = { items: [], __seen: new Set() };

  const hasDisabledWords =
    /\b(deshabilitad\w*|archivad\w*|eliminad\w*|borrad[oa]?\s+logico\w*|eliminado\s+logico)\b/.test(
      normalizedQuestion
    );

  if (domain.inventoryEnabledPath) {
    pushFilter(
      filters,
      domain.inventoryEnabledPath,
      "eq",
      hasDisabledWords ? false : true
    );
  }

  if (
    /\bsin usar\b/.test(normalizedQuestion) &&
    !/\b(condicion|estado fisico)\b/.test(normalizedQuestion) &&
    domain.conditionPath &&
    domain.inventoryStatusPath
  ) {
    return makeNeedClarification(
      'La frase "sin usar" puede ser condición física o status.',
      [
        "Interpretar como Condition.name = 'sin usar'",
        "Interpretar como Inventory.status = 'SIN_USAR'",
      ],
      "ambiguous_term"
    );
  }

  const statusMap = [
    { token: "alta", value: "ALTA" },
    { token: "baja", value: "BAJA" },
    { token: "propuesta", value: "PROPUESTA" },
  ];
  if (domain.inventoryStatusPath) {
    for (const item of statusMap) {
      if (
        new RegExp(`\\b(${item.token})\\b`, "i").test(normalizedQuestion) &&
        !normalizedQuestion.includes("por estado") &&
        !normalizedQuestion.includes("por status")
      ) {
        pushFilter(filters, domain.inventoryStatusPath, "eq", item.value);
        break;
      }
    }
  }

  const brandValue = extractAfterKeyword(normalizedQuestion, "(?:marca|brand)", [
    "con",
    "sin",
    "por",
    "y",
    "en",
  ]);
  if (brandValue && domain.brandPath) {
    pushFilter(filters, domain.brandPath, "contains", brandValue);
  }

  const typeValue = extractAfterKeyword(normalizedQuestion, "(?:tipo|clase)", [
    "con",
    "sin",
    "por",
    "y",
    "en",
    "marca",
  ]);
  if (typeValue && domain.typePath) {
    pushFilter(filters, domain.typePath, "contains", singularize(typeValue));
  }

  const modelValue = extractAfterKeyword(normalizedQuestion, "(?:modelo)", [
    "con",
    "sin",
    "por",
    "y",
    "en",
    "marca",
    "tipo",
  ]);
  if (modelValue && domain.modelPath) {
    pushFilter(filters, domain.modelPath, "contains", modelValue);
  }

  const conditionValue = extractAfterKeyword(
    normalizedQuestion,
    "(?:condicion|estado fisico)",
    ["con", "por", "y", "en", "marca", "tipo", "modelo"]
  );
  if (conditionValue && domain.conditionPath) {
    pushFilter(filters, domain.conditionPath, "contains", conditionValue);
  } else if (
    domain.conditionPath &&
    /\b(desuso|sin uso)\b/.test(normalizedQuestion)
  ) {
    pushFilter(filters, domain.conditionPath, "contains", "sin usar");
  }

  const locationValue =
    extractAfterKeyword(normalizedQuestion, "(?:ubicacion|area|zona|lugar)", [
      "con",
      "sin",
      "por",
      "y",
      "marca",
      "tipo",
      "modelo",
    ]) ||
    normalizedQuestion.match(/\ben\s+([a-z]\d{1,3})\b/i)?.[1] ||
    null;
  if (locationValue && domain.locationPath) {
    pushFilter(filters, domain.locationPath, "contains", locationValue);
  }

  if (
    domain.custodyStatusPath &&
    /\b(resguardo|custodia|entrega|recepcion)\b/.test(normalizedQuestion)
  ) {
    if (/\b(activo|activa|vigente)\b/.test(normalizedQuestion)) {
      const enumValue = resolveEnumValue(domain.custodyStatusPath, ["activo"]);
      if (enumValue) {
        pushFilter(filters, domain.custodyStatusPath, "eq", enumValue);
      }
    } else if (/\bborrador\b/.test(normalizedQuestion)) {
      const enumValue = resolveEnumValue(domain.custodyStatusPath, ["borrador"]);
      if (enumValue) {
        pushFilter(filters, domain.custodyStatusPath, "eq", enumValue);
      }
    }
  }

  // Handle "cuántos switches ..." style intent with implicit type token
  if (
    !brandValue &&
    !typeValue &&
    !modelValue &&
    action !== "group" &&
    domain.typePath
  ) {
    const noun = normalizedQuestion.match(
      /\bcuant(?:o|a|os|as)\s+([a-z0-9\-]{2,30})\b/
    )?.[1];
    if (noun && !STOP_WORDS.has(noun)) {
      const normalizedNoun = singularize(noun);
      if (!STOP_WORDS.has(normalizedNoun)) {
        pushFilter(filters, domain.typePath, "contains", normalizedNoun);
      }
    }
  }

  // Generic "sin X" support for nullable fields inferred from schema
  const missingToken = normalizedQuestion.match(/\bsin\s+([a-z0-9_]{2,30})\b/)?.[1];
  if (missingToken) {
    const reachable = getReachablePaths({ maxDepth: 2 }).filter(
      (entry) =>
        ["serialnumber", "activenumber", "internalfolio", "location", "invoice", "purchaseorder"].includes(
          normalizeText(entry.field)
        ) ||
        normalizeText(entry.model).includes(normalizeText(missingToken)) ||
        normalizeText(entry.field).includes(normalizeText(missingToken))
    );

    if (reachable.length === 1) {
      pushFilter(filters, reachable[0].path, "isNull");
    }
  }

  delete filters.__seen;
  return filters.items;
}

function validatePlanPaths(plan) {
  for (const filter of plan.filters) {
    const resolved = resolveRelationPath(filter.path);
    if (!resolved.ok) {
      return makeNeedClarification(
        `No pude validar el filtro "${filter.path}".`,
        [],
        "unknown_filter_path"
      );
    }
    if (resolved.ambiguous) {
      return makeNeedClarification(
        `El filtro "${filter.path}" tiene múltiples rutas relacionales posibles.`,
        [],
        "ambiguous_filter_path"
      );
    }
  }

  for (const groupPath of plan.groupBy) {
    const resolved = resolveRelationPath(groupPath);
    if (!resolved.ok) {
      return makeNeedClarification(
        `No pude validar el agrupamiento "${groupPath}".`,
        [],
        "unknown_group_path"
      );
    }
    if (resolved.ambiguous) {
      return makeNeedClarification(
        `El agrupamiento "${groupPath}" tiene múltiples rutas relacionales posibles.`,
        [],
        "ambiguous_group_path"
      );
    }
  }

  return null;
}

export async function buildPlanFromQuestion(question, { page, limit }) {
  const normalizedQuestion = normalizeText(question);
  const domain = buildDomainPaths();
  const action = detectAction(normalizedQuestion);

  const filters = buildFilters(question, normalizedQuestion, action, domain);
  if (filters?.type === "need_clarification") return filters;

  const groupBy = [];
  if (action === "group") {
    const groupPath = resolveGroupPath(normalizedQuestion, domain);
    if (!groupPath) {
      const options = [
        domain.conditionPath,
        domain.brandPath,
        domain.typePath,
        domain.modelPath,
        domain.locationPath,
        domain.inventoryStatusPath,
      ]
        .filter(Boolean)
        .map((x) => `Agrupar por ${x}`)
        .slice(0, 6);

      return makeNeedClarification(
        "No pude identificar por qué dimensión agrupar.",
        options,
        "missing_group_by"
      );
    }
    groupBy.push(groupPath);
  }

  const sortPath = domain.inventoryCreatedAtPath || "Inventory.createdAt";
  const plan = {
    entity: "Inventory",
    action,
    filters,
    groupBy,
    pagination: { page, limit },
    sort: [{ path: sortPath, dir: "desc" }],
  };

  const validated = PlanSchema.safeParse(plan);
  if (!validated.success) {
    return makeNeedClarification(
      "No pude construir un plan válido para esa consulta.",
      [],
      "invalid_plan_shape"
    );
  }

  const pathValidation = validatePlanPaths(validated.data);
  if (pathValidation) return pathValidation;

  return validated.data;
}
