# TASK: Make Sinabe AI understand ALL DB relations (schema-driven) and answer inventory questions deterministically

You are a senior backend/AI engineer working on a local AI service for “Sinabe”.
This service receives Spanish questions and answers with real numbers and lists from MySQL via Prisma schema relations.

## Inputs (repository files)

- The project codebase (zip already present in the workspace).
- Prisma schema file: `schema.prisma` (source of truth for tables/relations).
- Existing Node.js stack: Express + MySQL2 + Zod + planner -> sqlBuilder -> executor.

## Current Problem

The assistant often returns random counts because:

- The planner JSON schema supports only a limited set of filters.
- SQL builder joins only a subset of relations.
- Some joins inflate counts (duplicate rows) due to many-to-many relations.
  We must eliminate hallucinations and enable multi-table reasoning.

## Primary Goal

Make the AI **schema-driven**:

1. Read `schema.prisma` and auto-build a “Knowledge Map” of:
   - Models (tables)
   - Fields
   - Relations (1-1, 1-N, N-N via join tables)
   - “Enabled” soft-delete patterns (enabled=true)
2. Extend the planner to support filters/grouping across **all relevant related tables**, not only Inventory core.
3. Ensure SQL execution is always correct:
   - `COUNT(DISTINCT I.id)` for counts when joins can duplicate rows.
   - `GROUP_CONCAT(DISTINCT ...)` for multi-valued relations where appropriate.
4. Responses must be deterministic and explainable:
   - No guessing. If data is missing/ambiguous, return `need_clarification`.
   - Always include `meta.plan`, `meta.appliedFilters`, `meta.joinsUsed`.
   - Optionally `meta.sql` and `meta.params` (safe).

## Required Capabilities (what users will ask)

The assistant must be able to answer queries involving Inventory and any tables related in Prisma, including (but not limited to):

- Type, Brand, Model
- Condition
- Location / Place / Area (whatever exists in schema)
- Custody / Resguardos (who has the device, status, dates, codes)
- Custom fields (dynamic fields attached to inventory)
- Files / Images attached to inventory
- Users (createdBy, assignedTo, receiver/deliverer)
- Any other entity that is connected to Inventory in the schema

IMPORTANT: Do not hardcode table names. Discover them from `schema.prisma`.

---

# Implementation Plan

## A) Build a Schema Knowledge Map (auto-generated)

Create a module:

- `src/services/schemaMap.js`

This module must:

1. Parse `schema.prisma` (simple parsing is fine: regex-based is acceptable, no need for Prisma internals).
2. Produce a JSON structure like:

```json
{
  "models": {
    "Inventory": {
      "fields": ["id","serialNumber","enabled", "..."],
      "relations": {
        "type": {"model":"InventoryType","kind":"many-to-one","fk":"typeId"},
        "brand": {"model":"InventoryBrand","kind":"many-to-one","fk":"brandId"},
        "conditions": {"model":"Condition","kind":"many-to-many","through":"InventoryCondition"},
        "custodyRecords": {"model":"CustodyRecord","kind":"one-to-many","fk":"inventoryId"},
        "images": {"model":"Image","kind":"one-to-many","fk":"inventoryId"},
        "customFieldValues": {"model":"CustomFieldValue","kind":"one-to-many","fk":"inventoryId"}
      }
    }
  }
}
Detect soft-delete convention:

If a model has enabled: Boolean @default(true), default filter should be enabled=true unless user explicitly asks for disabled/archived.

Expose helper methods:

getInventoryGraph() => returns all models reachable from Inventory up to depth 2 or 3.

resolveRelationPath("Inventory.conditions.name") => returns join steps.

B) Planner: schema-driven allowed filters & groupBy

Update planner Zod schema:

Instead of hardcoding only a few filters, support a controlled list derived from schemaMap.

Design a plan structure like:

{
  "entity": "Inventory",
  "action": "count" | "list" | "group",
  "filters": [
    { "path": "InventoryType.name", "op": "eq", "value": "Switch" },
    { "path": "Condition.name", "op": "eq", "value": "Sin usar" },
    { "path": "Location.name", "op": "contains", "value": "T2" }
  ],
  "groupBy": ["InventoryType.name"] // or ["Condition.name"]
}

Rules:

path MUST be validated against schemaMap (reject unknown paths).

Allowed ops: eq, contains, in, between, isNull, notNull.

If the user asks something ambiguous (“sin usar” without saying whether it’s status or condition), prefer:

if schema contains Condition: map to Condition.name

if also exists Inventory.status: ask for clarification, do NOT guess.

Add Spanish normalization:

plural tolerant: switches -> switch

accents tolerant: condición/condicion

synonyms:

“estado físico”, “condición”, “condicion” => Condition

“resguardo”, “custodia”, “entrega/recepción” => CustodyRecord (or equivalent)

“baja”, “alta”, “propuesta” => Inventory.status (if exists)

“deshabilitado”, “eliminado lógico”, “archivado” => enabled=false

C) SQL Builder: build joins from relation paths

Refactor sqlBuilder to:

Start from Inventory alias I.

For each filter path, compute required joins via schemaMap:

Add LEFT JOIN steps.

Apply WHERE conditions with parameters.

Critical:

For any query that can duplicate inventory rows due to joins (N-N, 1-N), ensure:

counts use COUNT(DISTINCT I.id)

list uses GROUP BY I.id (recommended)

use GROUP_CONCAT(DISTINCT ...) for multi-valued fields if returning them.

Add grouping:

group by a validated path (Condition.name, Type.name, Location.name, etc.)

counts in groups also use COUNT(DISTINCT I.id).

D) Executor & Response Meta

Update executor/routes to return:

meta.plan

meta.appliedFilters (human readable)

meta.joinsUsed (list of join steps)

optionally meta.sql + meta.params

If query returns 0 and the filter value may be misspelled:

run a safe suggestion query (LIKE) against the target table for that field (e.g., Condition.name)

return suggestions, ask clarification.

E) Safety: Never Guess

Implement a strict rule:

If planner cannot map terms to valid paths, return:

{ type: "need_clarification", message: "...", options: [...] }

Do NOT return numbers without SQL results.

F) Dev script (smoke tests)

Create src/scripts/dev_queries.js that runs:

“cuántos switches tengo en condición sin usar”

“cuántos inventarios por condición”

“cuántos inventarios en resguardo activo”

“lista inventarios en T2 con marca Cisco”

“cuántos inventarios deshabilitados”

Print:

plan, joinsUsed, sql, params, result.

Acceptance Criteria

The assistant can answer multi-table inventory questions using real SQL joins inferred from schema.prisma.

Counts do not inflate (distinct inventory ids).

Unknown conditions/brands/types produce clarification suggestions.

No hallucinations: every number is from executed SQL.

Works with any new table added to schema.prisma as long as it relates to Inventory (schema-driven).

Now implement all changes in JavaScript (no TypeScript), keep code clean and minimal, and update README with examples.


---

### Cómo usar esto en tu flujo
- Este prompt lo pegas en tu Codex/agent local.
- La clave es que **no le estás pidiendo “haz que entienda más”**, sino que le estás dando una arquitectura:
  **schema-driven planner + validated paths + join builder + distinct counting + explain mode**.

Si quieres, en el siguiente paso te puedo ayudar a definir (en español) una lista de **“preguntas objetivo”** para Sinabe (20–40 ejemplos) y así entrenar tu sistema por “tests” (aunque sea sin fine-tuning), para que tu IA se vuelva brutalmente consistente.
```
