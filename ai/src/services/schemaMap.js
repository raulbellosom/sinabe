import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCALAR_TYPES = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
]);

const DEFAULT_SCHEMA_CANDIDATES = (() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return [
    process.env.PRISMA_SCHEMA_PATH,
    path.resolve(process.cwd(), "prisma/schema.prisma"),
    path.resolve(process.cwd(), "schema.prisma"),
    path.resolve(process.cwd(), "../backend/prisma/schema.prisma"),
    path.resolve(process.cwd(), "../prisma/schema.prisma"),
    path.resolve(__dirname, "../../../backend/prisma/schema.prisma"),
  ].filter(Boolean);
})();

let cache = null;

function splitWords(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseList(raw) {
  return String(raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseRelationArgs(attrs) {
  const relationMatch = attrs.match(/@relation\(([^)]*)\)/);
  if (!relationMatch) return null;
  const body = relationMatch[1];
  const nameMatch = body.match(/name:\s*"([^"]+)"/);
  const fieldsMatch = body.match(/fields:\s*\[([^\]]*)\]/);
  const refsMatch = body.match(/references:\s*\[([^\]]*)\]/);

  return {
    name: nameMatch?.[1] || null,
    fields: parseList(fieldsMatch?.[1] || ""),
    references: parseList(refsMatch?.[1] || ""),
  };
}

function parseEnumBlocks(schemaText) {
  const enums = {};
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let enumMatch;

  while ((enumMatch = enumRegex.exec(schemaText)) !== null) {
    const [, enumName, body] = enumMatch;
    const values = body
      .split(/\r?\n/)
      .map((line) => line.replace(/\/\/.*$/, "").trim())
      .filter((line) => line && !line.startsWith("@@") && !line.startsWith("@"))
      .map((line) => line.split(/\s+/)[0])
      .filter(Boolean);
    enums[enumName] = values;
  }

  return enums;
}

function parseModelBlocks(schemaText, enums) {
  const models = {};
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let modelMatch;

  while ((modelMatch = modelRegex.exec(schemaText)) !== null) {
    const [, modelName, body] = modelMatch;
    const model = {
      name: modelName,
      table: modelName,
      fields: {},
      fieldList: [],
      relations: {},
      hasEnabled: false,
      uniqueSingle: new Set(),
      uniqueComposite: [],
      tokens: splitWords(modelName),
    };

    const lines = body.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.replace(/\/\/.*$/, "").trim();
      if (!line) continue;

      if (line.startsWith("@@map(")) {
        const mapMatch = line.match(/@@map\("([^"]+)"\)/);
        if (mapMatch) model.table = mapMatch[1];
        continue;
      }

      if (line.startsWith("@@unique(")) {
        const uniqueMatch = line.match(/@@unique\(\[([^\]]+)\]/);
        if (uniqueMatch) {
          const fields = parseList(uniqueMatch[1]);
          if (fields.length === 1) model.uniqueSingle.add(fields[0]);
          if (fields.length > 1) model.uniqueComposite.push(fields);
        }
        continue;
      }

      if (line.startsWith("@@") || line.startsWith("@")) continue;

      const fieldMatch = line.match(/^(\w+)\s+([^\s]+)(?:\s+(.*))?$/);
      if (!fieldMatch) continue;

      const [, fieldName, fieldTypeRaw, attrsRaw = ""] = fieldMatch;
      const isList = fieldTypeRaw.endsWith("[]");
      const isOptional = fieldTypeRaw.endsWith("?");
      const baseType = fieldTypeRaw.replace(/\[\]|\?/g, "");
      const dbMapMatch = attrsRaw.match(/@map\("([^"]+)"\)/);
      const defaultMatch = attrsRaw.match(/@default\(([^)]+)\)/);
      const relation = parseRelationArgs(attrsRaw);
      const isId = /(^|\s)@id(\s|$)/.test(attrsRaw);
      const isUnique = /(^|\s)@unique(\s|$)/.test(attrsRaw);

      if (isUnique) model.uniqueSingle.add(fieldName);

      const field = {
        name: fieldName,
        column: dbMapMatch?.[1] || fieldName,
        type: baseType,
        isList,
        isOptional,
        isRelation: false,
        isScalar: false,
        isEnum: false,
        relation,
        attrsRaw,
        isId,
        isUnique,
        defaultExpr: defaultMatch?.[1] || null,
        enumValues: [],
        tokens: splitWords(fieldName),
      };

      if (baseType === "Boolean" && fieldName === "enabled") {
        model.hasEnabled = true;
      }

      field.isEnum = Boolean(enums[baseType]);
      field.isScalar = SCALAR_TYPES.has(baseType) || field.isEnum;
      if (field.isEnum) field.enumValues = enums[baseType] || [];

      model.fields[fieldName] = field;
      model.fieldList.push(fieldName);
    }

    models[modelName] = model;
  }

  const modelNames = new Set(Object.keys(models));
  for (const model of Object.values(models)) {
    for (const field of Object.values(model.fields)) {
      if (!field.isScalar && modelNames.has(field.type)) {
        field.isRelation = true;
      }
    }
  }

  return models;
}

function makeEdgeKey(edge) {
  return [
    edge.fromModel,
    edge.toModel,
    edge.fromColumn,
    edge.toColumn,
    edge.viaField || "",
    edge.relationName || "",
  ].join("|");
}

function buildGraph(models) {
  const edges = [];
  const bySource = {};
  const edgeSeen = new Set();

  const addEdge = (edge) => {
    const key = makeEdgeKey(edge);
    if (edgeSeen.has(key)) return;
    edgeSeen.add(key);
    edges.push(edge);
    if (!bySource[edge.fromModel]) bySource[edge.fromModel] = [];
    bySource[edge.fromModel].push(edge);
  };

  for (const model of Object.values(models)) {
    for (const field of Object.values(model.fields)) {
      if (!field.isRelation) continue;
      const relation = field.relation;
      if (!relation?.fields?.length || !relation?.references?.length) continue;

      const sourceModel = model.name;
      const targetModel = field.type;
      const sourceFk = relation.fields[0];
      const targetRef = relation.references[0];
      const sourceField = model.fields[sourceFk];
      const targetField = models[targetModel]?.fields[targetRef];

      if (!sourceField || !targetField) continue;

      const isOneToOne = model.uniqueSingle.has(sourceFk);
      const relationName = relation.name || null;

      const forwardKind = isOneToOne ? "one-to-one" : "many-to-one";
      const reverseKind = isOneToOne ? "one-to-one" : "one-to-many";

      addEdge({
        fromModel: sourceModel,
        toModel: targetModel,
        fromColumn: sourceField.column,
        toColumn: targetField.column,
        viaField: field.name,
        relationName,
        kind: forwardKind,
        through: null,
      });

      addEdge({
        fromModel: targetModel,
        toModel: sourceModel,
        fromColumn: targetField.column,
        toColumn: sourceField.column,
        viaField: field.name,
        relationName,
        kind: reverseKind,
        through: null,
      });
    }
  }

  // Build relation summaries with graceful inference for list side fields
  for (const model of Object.values(models)) {
    for (const field of Object.values(model.fields)) {
      if (!field.isRelation) continue;
      const targetModel = field.type;
      const relation = field.relation;

      const matchingEdges =
        bySource[model.name]?.filter((edge) => {
          if (edge.toModel !== targetModel) return false;
          if (relation?.name && edge.relationName !== relation.name) return false;
          if (relation?.fields?.length && edge.viaField !== field.name) return false;
          return true;
        }) || [];

      if (matchingEdges.length > 0) {
        const picked = matchingEdges[0];
        model.relations[field.name] = {
          model: targetModel,
          kind: picked.kind,
          fk: relation?.fields || [],
          references: relation?.references || [],
          through: null,
        };
      }
    }
  }

  // Detect simple join tables and expose virtual many-to-many relations
  for (const joinModel of Object.values(models)) {
    const owningRelations = Object.values(joinModel.fields).filter(
      (field) =>
        field.isRelation &&
        field.relation?.fields?.length &&
        field.relation?.references?.length
    );

    if (owningRelations.length !== 2) continue;
    const [leftRel, rightRel] = owningRelations;
    if (leftRel.type === rightRel.type) continue;

    const uniquePairExists = joinModel.uniqueComposite.some((pair) => {
      const leftFk = leftRel.relation.fields[0];
      const rightFk = rightRel.relation.fields[0];
      return pair.includes(leftFk) && pair.includes(rightFk);
    });

    if (!uniquePairExists) continue;

    const leftModel = models[leftRel.type];
    const rightModel = models[rightRel.type];
    if (!leftModel || !rightModel) continue;

    const leftListField = Object.values(leftModel.fields).find(
      (field) => field.isRelation && field.isList && field.type === joinModel.name
    );
    const rightListField = Object.values(rightModel.fields).find(
      (field) => field.isRelation && field.isList && field.type === joinModel.name
    );

    if (leftListField) {
      leftModel.relations[leftListField.name] = {
        model: rightModel.name,
        kind: "many-to-many",
        fk: [],
        references: [],
        through: joinModel.name,
      };
    }

    if (rightListField) {
      rightModel.relations[rightListField.name] = {
        model: leftModel.name,
        kind: "many-to-many",
        fk: [],
        references: [],
        through: joinModel.name,
      };
    }
  }

  return { edges, bySource };
}

function findShortestModelPaths(graph, fromModel, toModel, maxDepth = 4) {
  if (fromModel === toModel) return { paths: [[]], ambiguous: false };
  const queue = [{ model: fromModel, steps: [] }];
  const seenDepth = new Map([[fromModel, 0]]);
  const found = [];
  let bestLength = null;

  while (queue.length > 0) {
    const current = queue.shift();
    const depth = current.steps.length;
    if (bestLength != null && depth > bestLength) continue;
    if (depth >= maxDepth) continue;

    const edges = graph.bySource[current.model] || [];
    for (const edge of edges) {
      const nextSteps = [...current.steps, edge];
      const nextDepth = nextSteps.length;

      if (nextDepth > maxDepth) continue;
      if (edge.toModel === toModel) {
        if (bestLength == null || nextDepth < bestLength) {
          bestLength = nextDepth;
          found.length = 0;
        }
        if (nextDepth === bestLength) found.push(nextSteps);
        continue;
      }

      const prevDepth = seenDepth.get(edge.toModel);
      if (prevDepth == null || nextDepth <= prevDepth) {
        seenDepth.set(edge.toModel, nextDepth);
        queue.push({ model: edge.toModel, steps: nextSteps });
      }
    }
  }

  if (found.length === 0) return { paths: [], ambiguous: false };
  return { paths: found, ambiguous: found.length > 1 };
}

function resolveByModelField(map, pathExpr, baseModel = "Inventory", maxDepth = 4) {
  const [targetModel, targetField] = pathExpr.split(".");
  const model = map.models[targetModel];
  if (!model) {
    return { ok: false, reason: `Model "${targetModel}" does not exist` };
  }

  const field = model.fields[targetField];
  if (!field || !field.isScalar) {
    return {
      ok: false,
      reason: `Field "${targetModel}.${targetField}" is not a scalar field`,
    };
  }

  const { paths, ambiguous } = findShortestModelPaths(
    map.graph,
    baseModel,
    targetModel,
    maxDepth
  );

  if (paths.length === 0) {
    return {
      ok: false,
      reason: `No relation path from ${baseModel} to ${targetModel}`,
    };
  }

  return {
    ok: true,
    ambiguous,
    steps: paths[0],
    alternatives: paths.slice(1),
    targetModel,
    targetField,
    field,
    expression: pathExpr,
  };
}

function resolveByRelationChain(
  map,
  segments,
  baseModel = "Inventory",
  maxDepth = 4
) {
  const leafField = segments[segments.length - 1];
  const relationTokens = segments.slice(1, -1);
  let currentModel = baseModel;
  const allSteps = [];

  for (const relToken of relationTokens) {
    const relation = map.models[currentModel]?.relations?.[relToken];
    if (!relation) {
      return {
        ok: false,
        reason: `Relation "${currentModel}.${relToken}" was not found`,
      };
    }

    if (relation.kind === "many-to-many" && relation.through) {
      const toThrough = findShortestModelPaths(
        map.graph,
        currentModel,
        relation.through,
        2
      );
      const toTarget = findShortestModelPaths(
        map.graph,
        relation.through,
        relation.model,
        2
      );
      if (!toThrough.paths.length || !toTarget.paths.length) {
        return {
          ok: false,
          reason: `Cannot resolve many-to-many relation "${currentModel}.${relToken}"`,
        };
      }
      allSteps.push(...toThrough.paths[0], ...toTarget.paths[0]);
      currentModel = relation.model;
      continue;
    }

    const directCandidates =
      map.graph.bySource[currentModel]?.filter(
        (edge) => edge.toModel === relation.model
      ) || [];
    if (directCandidates.length === 0) {
      const fallback = findShortestModelPaths(
        map.graph,
        currentModel,
        relation.model,
        2
      );
      if (!fallback.paths.length) {
        return {
          ok: false,
          reason: `Cannot resolve relation path "${currentModel}.${relToken}"`,
        };
      }
      allSteps.push(...fallback.paths[0]);
    } else {
      allSteps.push(directCandidates[0]);
    }

    currentModel = relation.model;
  }

  const directField = map.models[currentModel]?.fields?.[leafField];
  if (directField?.isScalar) {
    return {
      ok: true,
      ambiguous: false,
      steps: allSteps,
      alternatives: [],
      targetModel: currentModel,
      targetField: leafField,
      field: directField,
      expression: segments.join("."),
    };
  }

  // Fallback for shorthand joins (e.g. Inventory.conditions.name)
  const candidates = [];
  for (const model of Object.values(map.models)) {
    const field = model.fields[leafField];
    if (!field?.isScalar) continue;
    const route = findShortestModelPaths(map.graph, currentModel, model.name, 2);
    if (!route.paths.length) continue;
    candidates.push({
      model: model.name,
      field,
      path: route.paths[0],
      depth: route.paths[0].length,
    });
  }

  if (candidates.length === 0) {
    return {
      ok: false,
      reason: `Field "${leafField}" not found after "${segments.join(".")}"`,
    };
  }

  candidates.sort((a, b) => a.depth - b.depth || a.model.localeCompare(b.model));
  const bestDepth = candidates[0].depth;
  const top = candidates.filter((c) => c.depth === bestDepth);
  const picked = top[0];

  return {
    ok: true,
    ambiguous: top.length > 1,
    steps: [...allSteps, ...picked.path],
    alternatives: top.slice(1).map((c) => [...allSteps, ...c.path]),
    targetModel: picked.model,
    targetField: leafField,
    field: picked.field,
    expression: segments.join("."),
  };
}

function resolveRelationPathInternal(
  map,
  pathExpr,
  { baseModel = "Inventory", maxDepth = 4 } = {}
) {
  const normalized = String(pathExpr || "").trim();
  if (!normalized.includes(".")) {
    return {
      ok: false,
      reason: `Invalid path "${pathExpr}". Expected "Model.field"`,
    };
  }

  const segments = normalized.split(".").filter(Boolean);
  if (segments.length < 2) {
    return {
      ok: false,
      reason: `Invalid path "${pathExpr}"`,
    };
  }

  if (segments.length === 2) {
    return resolveByModelField(map, normalized, baseModel, maxDepth);
  }

  if (segments[0] !== baseModel) {
    return {
      ok: false,
      reason: `Paths with 3+ segments must start with "${baseModel}"`,
    };
  }

  return resolveByRelationChain(map, segments, baseModel, maxDepth);
}

function listReachableModels(map, baseModel = "Inventory", maxDepth = 3) {
  const results = [];
  const queue = [{ model: baseModel, depth: 0 }];
  const seen = new Map([[baseModel, 0]]);

  while (queue.length > 0) {
    const current = queue.shift();
    results.push({ model: current.model, depth: current.depth });
    if (current.depth >= maxDepth) continue;

    const edges = map.graph.bySource[current.model] || [];
    for (const edge of edges) {
      const nextDepth = current.depth + 1;
      const prevDepth = seen.get(edge.toModel);
      if (prevDepth == null || nextDepth < prevDepth) {
        seen.set(edge.toModel, nextDepth);
        queue.push({ model: edge.toModel, depth: nextDepth });
      }
    }
  }

  return results;
}

function buildReachableFieldPaths(map, baseModel = "Inventory", maxDepth = 3) {
  const models = listReachableModels(map, baseModel, maxDepth);
  const paths = [];

  for (const item of models) {
    const model = map.models[item.model];
    if (!model) continue;
    for (const field of Object.values(model.fields)) {
      if (!field.isScalar) continue;
      paths.push({
        path: `${model.name}.${field.name}`,
        model: model.name,
        field: field.name,
        depth: item.depth,
        type: field.type,
        isEnum: field.isEnum,
        enumValues: field.isEnum ? map.enums[field.type] || [] : [],
        fieldTokens: field.tokens,
        modelTokens: model.tokens,
      });
    }
  }

  return paths;
}

function choosePathByHints(map, hints, options = {}) {
  const normalizedHints = (hints || []).map(normalizeText).filter(Boolean);
  if (normalizedHints.length === 0) return null;

  const preferredFields = options.preferredFields || [];
  const exactField = options.exactField || null;
  const candidates = map.reachablePaths
    .filter((entry) => {
      const words = new Set([...entry.modelTokens, ...entry.fieldTokens]);
      return normalizedHints.every((hint) => words.has(hint));
    })
    .sort((a, b) => a.depth - b.depth || a.path.localeCompare(b.path));

  if (!candidates.length) return null;

  if (exactField) {
    const exact = candidates.find(
      (entry) => normalizeText(entry.field) === normalizeText(exactField)
    );
    if (exact) return exact.path;
  }

  if (preferredFields.length) {
    for (const pref of preferredFields) {
      const found = candidates.find(
        (entry) => normalizeText(entry.field) === normalizeText(pref)
      );
      if (found) return found.path;
    }
  }

  return candidates[0].path;
}

function buildMap(schemaPath, schemaText) {
  const enums = parseEnumBlocks(schemaText);
  const models = parseModelBlocks(schemaText, enums);
  const graph = buildGraph(models);

  const map = {
    schemaPath,
    enums,
    models,
    graph,
  };

  map.reachablePaths = buildReachableFieldPaths(map, "Inventory", 3);

  return map;
}

function toKnowledgeMap(map) {
  const models = {};

  for (const model of Object.values(map.models)) {
    const relations = {};
    for (const [name, rel] of Object.entries(model.relations)) {
      relations[name] = {
        model: rel.model,
        kind: rel.kind,
        fk: rel.fk || [],
        references: rel.references || [],
        through: rel.through || null,
      };
    }

    models[model.name] = {
      table: model.table,
      fields: model.fieldList,
      hasEnabled: model.hasEnabled,
      relations,
    };
  }

  return {
    schemaPath: map.schemaPath,
    models,
  };
}

function discoverSchemaPath() {
  for (const candidate of DEFAULT_SCHEMA_CANDIDATES) {
    if (!candidate) continue;
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `schema.prisma not found. Set PRISMA_SCHEMA_PATH or provide one of: ${DEFAULT_SCHEMA_CANDIDATES.join(
      ", "
    )}`
  );
}

export function getSchemaMap({ forceReload = false } = {}) {
  if (cache && !forceReload) return cache;
  const schemaPath = discoverSchemaPath();
  const schemaText = fs.readFileSync(schemaPath, "utf8");
  cache = buildMap(schemaPath, schemaText);
  return cache;
}

export function getKnowledgeMap({ forceReload = false } = {}) {
  return toKnowledgeMap(getSchemaMap({ forceReload }));
}

export function getInventoryGraph({ maxDepth = 3 } = {}) {
  const map = getSchemaMap();
  return listReachableModels(map, "Inventory", maxDepth);
}

export function resolveRelationPath(pathExpr, options = {}) {
  const map = getSchemaMap();
  return resolveRelationPathInternal(map, pathExpr, options);
}

export function isValidPath(pathExpr) {
  const resolved = resolveRelationPath(pathExpr);
  return Boolean(resolved?.ok);
}

export function getReachablePaths({ maxDepth = 3 } = {}) {
  const map = getSchemaMap();
  if (maxDepth === 3) return map.reachablePaths;
  return buildReachableFieldPaths(map, "Inventory", maxDepth);
}

export function findPathByHints(hints, options = {}) {
  const map = getSchemaMap();
  return choosePathByHints(map, hints, options);
}

export function getModelField(modelName, fieldName) {
  const map = getSchemaMap();
  return map.models?.[modelName]?.fields?.[fieldName] || null;
}

export function hasEnabledField(modelName) {
  const map = getSchemaMap();
  return Boolean(map.models?.[modelName]?.hasEnabled);
}
