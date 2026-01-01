/**
 * Heuristic planner - Rule-based intent detection (no LLM required)
 * Works as fallback when Ollama is disabled or fails
 */

const MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function isoDate(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function endOfMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

// Normalize text for matching
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim();
}

// Common words that should not be detected as brands/types/etc
const STOP_WORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "en",
  "con",
  "sin",
  "por",
  "para",
  "hay",
  "que",
  "son",
  "tienen",
  "tiene",
  "estan",
  "esta",
  "hay",
  "cuantos",
  "cuantas",
  "total",
  "todos",
  "todas",
  "algunos",
  "algunas",
  "inventarios",
  "inventario",
  "equipos",
  "equipo",
  "activos",
  "activo",
]);

// Known brands (case insensitive) - extracted from DB
const KNOWN_BRANDS = [
  "hp",
  "cisco",
  "avigilon",
  "samsung",
  "dell",
  "apple",
  "lenovo",
  "asus",
  "acer",
  "lg",
  "sony",
  "bosch",
  "axis",
  "hikvision",
  "dahua",
  "zebra",
  "epson",
  "brother",
  "canon",
  "xerox",
  "eaton",
  "advantech",
  "fortinet",
  "mikrotik",
  "ubiquiti",
  "meraki",
  "aruba",
  "juniper",
  "pelco",
  "ikusi",
  "shure",
  "kramer",
];

// Known types (case insensitive) - extracted from DB
const KNOWN_TYPES = [
  "laptop",
  "laptops",
  "computadora",
  "computadoras",
  "pc",
  "desktop",
  "monitor",
  "monitores",
  "impresora",
  "impresoras",
  "servidor",
  "servidores",
  "camara",
  "camaras",
  "camera",
  "cameras",
  "switch",
  "switches",
  "router",
  "routers",
  "access point",
  "ap",
  "ups",
  "pantalla",
  "pantallas",
  "tablet",
  "tablets",
  "scanner",
  "escaner",
  "telefono",
  "telefonos",
  "phone",
];

export function heuristicPlan(q, { page, limit }) {
  const t = normalize(q);
  const original = q;

  // Detect intent
  let intent = "list_inventories";

  // Count patterns
  if (/(cuant|total|conteo|numero de|cantidad)/i.test(t)) {
    intent = "count_inventories";
  }

  // Group by patterns
  if (/por\s+(ubicacion|marca|tipo|modelo|status|estado)/i.test(t)) {
    intent = "group_count_inventories";
  }

  // Chart/graph patterns - also group_count_inventories
  if (/(grafica|chart|pie|pastel|dona|doughnut|distribucion)/i.test(t)) {
    intent = "group_count_inventories";
  }

  // Pattern: "modelos de HP" or "modelos de HP y Avigilon"
  // This should be interpreted as groupBy: model, with brand filter
  let detectedBrandsForModelQuery = [];
  const modelosDeMatch = original.match(
    /modelos?\s+(?:de\s+)?([a-záéíóúñ\w\s,y]+)/i
  );
  if (modelosDeMatch) {
    intent = "group_count_inventories";
    // Extract brands mentioned (HP, Avigilon, etc)
    const brandsText = modelosDeMatch[1];
    for (const knownBrand of KNOWN_BRANDS) {
      if (new RegExp(`\\b${knownBrand}\\b`, "i").test(brandsText)) {
        detectedBrandsForModelQuery.push(knownBrand.toUpperCase());
      }
    }
  }

  // Missing patterns
  if (
    /(sin\s+ubicacion|sin\s+factura|sin\s+oc|sin\s+orden|sin\s+serie|sin\s+serial|sin\s+activo|sin\s+folio|sin\s+fecha)/i.test(
      t
    )
  ) {
    intent = "missing_inventories";
  }

  // Semantic search patterns
  if (
    /(buscar|parecid|similar|que\s+contengan|texto|como|relacionad)/i.test(t)
  ) {
    intent = "search_inventories";
  }

  // Initialize filters with enabled: true by default (exclude logically deleted records)
  const filters = {
    enabled: true,
  };

  // First, check for known brands and types in the query
  const words = t.split(/\s+/);
  for (const word of words) {
    if (KNOWN_BRANDS.includes(word)) {
      filters.brand = word.toUpperCase();
    }
    if (KNOWN_TYPES.includes(word)) {
      // Map common variants to actual DB type names
      const typeMap = {
        laptop: "Laptop",
        laptops: "Laptop",
        computadora: "Computadora",
        computadoras: "Computadora",
        monitor: "Monitor",
        monitores: "Monitor",
        impresora: "Impresora",
        impresoras: "Impresora",
        camara: "Cámara",
        camaras: "Cámara",
        camera: "Cámara",
        cameras: "Cámara",
        servidor: "Servidor",
        servidores: "Servidor",
        switch: "Switch",
        switches: "Switch",
        router: "Router",
        routers: "Router",
        pantalla: "Pantalla",
        pantallas: "Pantalla",
        tablet: "Tablet",
        tablets: "Tablet",
      };
      filters.type = typeMap[word] || word;
    }
  }

  // Extract brand - improved patterns (only if not already detected)
  if (!filters.brand) {
    const brandPatterns = [
      /marca\s+([a-záéíóúñ\-\s\.]+?)(?:\s+(?:creados?|con|entre|en|de|del|tipo|status|modelo)|$)/i,
      /de\s+la\s+marca\s+([a-záéíóúñ\-\s\.]+?)(?:\s+(?:creados?|con|entre|en|de|del|tipo|status|modelo)|$)/i,
      /inventarios?\s+([A-Z][a-zA-Z]+)(?:\s|$)/i, // Capitalized words might be brands
    ];

    for (const pattern of brandPatterns) {
      const match = original.match(pattern);
      if (match?.[1]) {
        const brand = match[1].trim().replace(/[\?\!\.,]+$/, "");
        if (brand.length > 1 && !STOP_WORDS.has(brand.toLowerCase())) {
          filters.brand = brand;
          break;
        }
      }
    }
  }

  // Extract type (only if not already detected)
  if (!filters.type) {
    const typePatterns = [
      /tipo\s+([a-záéíóúñ\-\s]+?)(?:\s+(?:creados?|con|entre|en|de|del|marca|status|modelo)|$)/i,
      /de\s+tipo\s+([a-záéíóúñ\-\s]+?)(?:\s+(?:creados?|con|entre|en|de|del|marca|status|modelo)|$)/i,
    ];

    for (const pattern of typePatterns) {
      const match = original.match(pattern);
      if (match?.[1]) {
        const typeName = match[1].trim().replace(/[\?\!\.,]+$/, "");
        if (typeName.length > 1 && !STOP_WORDS.has(typeName.toLowerCase())) {
          filters.type = typeName;
          break;
        }
      }
    }
  }

  // Extract location
  const locationPatterns = [
    /ubicacion\s+([a-záéíóúñ\-\s\d]+?)(?:\s+(?:creados?|con|entre|de|del|marca|status|tipo)|$)/i,
    /en\s+ubicacion\s+([a-záéíóúñ\-\s\d]+?)(?:\s+(?:creados?|con|entre|de|del|marca|status|tipo)|$)/i,
    /en\s+(?:la\s+)?(?:ubicacion\s+)?([A-Z][A-Z0-9\-\s]+)(?:\s|$)/i, // Uppercase location codes
  ];

  for (const pattern of locationPatterns) {
    const match = original.match(pattern);
    if (match?.[1]) {
      const loc = match[1].trim().replace(/[\?\!\.,]+$/, "");
      if (loc.length > 1 && !STOP_WORDS.has(loc.toLowerCase())) {
        filters.location = loc;
        break;
      }
    }
  }

  // Extract status
  const statusMatch = original.match(/\b(ALTA|BAJA|PROPUESTA)\b/i);
  if (statusMatch?.[1]) {
    filters.status = statusMatch[1].toUpperCase();
  }

  // Extract invoice/PO conditions
  if (/(con\s+factura|tiene\s+factura)/i.test(t)) {
    filters.hasInvoice = true;
  } else if (/(sin\s+factura|no\s+tiene\s+factura)/i.test(t)) {
    filters.hasInvoice = false;
  }

  if (/(con\s+orden|con\s+oc|tiene\s+orden|tiene\s+oc)/i.test(t)) {
    filters.hasPurchaseOrder = true;
  } else if (
    /(sin\s+orden|sin\s+oc|no\s+tiene\s+orden|no\s+tiene\s+oc)/i.test(t)
  ) {
    filters.hasPurchaseOrder = false;
  }

  // Date ranges - improved parsing
  const now = new Date();

  // Pattern: "entre octubre y noviembre" or "entre octubre y noviembre de 2024"
  const between = original.match(
    /entre\s+([a-záéíóú]+)\s+y\s+([a-záéíóú]+)(?:\s+(?:de|del)?\s*(\d{4}))?/i
  );
  if (between?.[1] && between?.[2]) {
    const m1 = MONTHS[between[1].toLowerCase()];
    const m2 = MONTHS[between[2].toLowerCase()];
    const year = between[3] ? Number(between[3]) : now.getFullYear();
    if (m1 && m2) {
      const fromM = Math.min(m1, m2),
        toM = Math.max(m1, m2);
      filters.dateField = "createdAt";
      filters.from = isoDate(year, fromM, 1);
      filters.to = isoDate(year, toM, endOfMonth(year, toM));
    }
  }

  // Pattern: "en octubre 2024" or "de octubre"
  const singleMonth = original.match(
    /(?:en|de)\s+([a-záéíóú]+)(?:\s+(?:de|del)?\s*(\d{4}))?/i
  );
  if (!filters.from && singleMonth?.[1]) {
    const m = MONTHS[singleMonth[1].toLowerCase()];
    const year = singleMonth[2] ? Number(singleMonth[2]) : now.getFullYear();
    if (m) {
      filters.dateField = "createdAt";
      filters.from = isoDate(year, m, 1);
      filters.to = isoDate(year, m, endOfMonth(year, m));
    }
  }

  // Pattern: "creados en 2024"
  const yearOnly = original.match(
    /(?:creados?|registrados?|del?)\s+(?:en\s+)?(\d{4})/i
  );
  if (!filters.from && yearOnly?.[1]) {
    const year = Number(yearOnly[1]);
    filters.dateField = "createdAt";
    filters.from = isoDate(year, 1, 1);
    filters.to = isoDate(year, 12, 31);
  }

  // Handle missing field/relation
  let missing = null;
  if (intent === "missing_inventories") {
    if (/(ubicacion)/i.test(t)) {
      missing = { kind: "relation", field: "location" };
    } else if (/(factura)/i.test(t)) {
      missing = { kind: "relation", field: "invoice" };
    } else if (/(oc|orden\s+de\s+compra|orden)/i.test(t)) {
      missing = { kind: "relation", field: "purchaseOrder" };
    } else if (/(serie|serial|numero\s+de\s+serie)/i.test(t)) {
      missing = { kind: "field", field: "serialNumber" };
    } else if (/(activo|numero\s+de\s+activo)/i.test(t)) {
      missing = { kind: "field", field: "activeNumber" };
    } else if (/(folio|folio\s+interno)/i.test(t)) {
      missing = { kind: "field", field: "internalFolio" };
    } else if (/(fecha\s+de\s+alta|fecha\s+alta)/i.test(t)) {
      missing = { kind: "field", field: "altaDate" };
    } else if (/(fecha\s+de\s+baja|fecha\s+baja)/i.test(t)) {
      missing = { kind: "field", field: "bajaDate" };
    } else if (/(fecha\s+de\s+recepcion|fecha\s+recepcion)/i.test(t)) {
      missing = { kind: "field", field: "receptionDate" };
    }
  }

  // Handle groupBy
  let groupBy = null;
  if (intent === "group_count_inventories") {
    if (/(ubicacion)/i.test(t)) groupBy = "location";
    else if (/(marca)/i.test(t)) groupBy = "brand";
    else if (/(tipo)/i.test(t)) groupBy = "type";
    else if (/(modelo)/i.test(t)) groupBy = "model";
    else if (/(status|estado)/i.test(t)) groupBy = "status";
    else groupBy = "location"; // default
  }

  // If we detected brands from "modelos de HP/Avigilon" pattern
  if (detectedBrandsForModelQuery.length > 0) {
    groupBy = "model"; // Force groupBy model
    if (detectedBrandsForModelQuery.length === 1) {
      // Single brand - use as filter
      filters.brand = detectedBrandsForModelQuery[0];
    } else {
      // Multiple brands - use brands array filter
      filters.brands = detectedBrandsForModelQuery;
    }
  }

  return {
    intent,
    filters,
    missing,
    groupBy,
    semantic:
      intent === "search_inventories"
        ? { query: q, topK: Number(process.env.QDRANT_TOPK || 60) }
        : { query: null, topK: Number(process.env.QDRANT_TOPK || 60) },
    pagination: { page, limit },
    sort: [{ field: "createdAt", dir: "desc" }],
  };
}
