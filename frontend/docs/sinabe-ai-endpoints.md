# Sinabe AI API – Endpoints de referencia

> Backend híbrido: búsqueda semántica + keyword + fuzzy de serie + re-rank opcional.  
> Base URL (producción local): `http://127.0.0.1:4010` (o tu dominio detrás de Nginx: `/ai/`).

## Tabla rápida de endpoints

| Método | Endpoint | ¿Para qué sirve? |
|-------:|----------|------------------|
| GET | `/health` | Verifica que el servicio esté vivo. |
| GET | `/config` | Muestra config efectiva (modelos, URLs, timeouts, etc.). |
| POST | `/debug/ollama-embed` | Prueba de embeddings contra Ollama. |
| POST | `/ingest` | Ingesta de inventarios a Qdrant (por lotes). |
| POST | `/search/hybrid` | **Único endpoint de búsqueda** desde el frontend (texto natural o serial). |
| POST | `/models/specs` | “Ficha técnica” generada por IA para un inventario dado. |
| GET | `/analytics/charts` | (Opcional) Datos para gráficas simples por status y marca. |
| GET | `/debug/ingest-dry-run` | (Opcional) Diagnóstico de embeddings sin escribir en Qdrant. |

---

## 1) `GET /health`

**Descripción:** ping simple de salud.

**Respuesta 200**
```json
{ "ok": true }
```

---

## 2) `GET /config`

**Descripción:** devuelve la configuración efectiva del proceso.

**Respuesta 200 (ejemplo)**
```json
{
  "OLLAMA_URL": "http://127.0.0.1:11434",
  "QDRANT_URL": "http://127.0.0.1:6333",
  "CHAT_MODEL": "llama3.2:3b",
  "EMBEDDING_MODEL": "nomic-embed-text",
  "EMBEDDING_DIM": 768,
  "REQ_TIMEOUT_MS": 300000,
  "DEFAULT_PAGE_SIZE": 100,
  "DEFAULT_UPSERT_CHUNK": 50,
  "DEFAULT_EMBED_CONCURRENCY": 3
}
```

---

## 3) `POST /debug/ollama-embed`

**Descripción:** genera un embedding con Ollama para validar que el modelo de embeddings está accesible.

**Body**
```json
{
  "text": "computadora hp prodesk",
  "model": "nomic-embed-text" // opcional
}
```

**Respuesta 200**
```json
{ "ok": true, "dim": 768, "sample": [0.12, -0.03, ...] }
```

---

## 4) `POST /ingest`

**Descripción:** lee inventarios desde MySQL, crea embeddings y los sube a Qdrant. Permite **procesar por tramos** con `offsetPages` y `maxPages`.

**Body (parámetros clave)**
```json
{
  "collection": "inventories_v1",
  "pageSize": 100,           // filas por página
  "embedConcurrency": 1,     // hilos de embeddings (1 = baja CPU)
  "upsertChunk": 50,         // tamaño de lote para subir a Qdrant
  "maxPages": 5,             // páginas a procesar en este run (opcional)
  "offsetPages": 0           // desplazamiento de páginas (opcional, por defecto 0)
}
```

**Respuesta 200 (ejemplo)**
```json
{
  "ok": true,
  "collection": "inventories_v1",
  "dim": 768,
  "indexed": 500,
  "skipped": 0,
  "skippedSamples": []
}
```

> Notas:
> - Tu Qdrant puede no exponer endpoints de índices de payload; verás warnings en logs, pero **la ingesta continúa**.
> - Durante ingesta la CPU puede subir (Ollama calculando embeddings).

---

## 5) `POST /search/hybrid`

**Descripción:** **único** endpoint que debe consumir el frontend. Acepta **texto natural** (“laptop de la marca apple con status alta”) o **serial** (“MXL43329WW”).  
Internamente hace: NLU (filtros implícitos + detección estricta de serial) → semántico (Qdrant) + keyword (MySQL) → **RRF** → (opcional) re-rank con LLM local.

**Body**
```json
{ "q": "texto libre o serial" }
```

**Respuestas posibles**

### a) Modo híbrido (texto natural)
```json
{
  "mode": "hybrid",
  "q": "computadora hp prodesk",
  "parsed": {
    "text": "computadora hp prodesk",
    "filters": {
      "typeName": "Computadora"
    }
  },
  "results": [
    {
      "score": 0.86423546,
      "id": "0a879de2-ed68-4c1c-b3db-311c00761a38",
      "serialNumber": "MXL43329Y5",
      "activeNumber": "PVR-COMPUTO-001827",
      "status": "BAJA",
      "createdAt": "2024-11-24T00:45:21.000Z",
      "modelName": "ProDesk 600 G1SFF",
      "brandName": "HP",
      "typeName": "Computadora",
      "comments": "…",
      "receptionDate": "2024-09-19",
      "internalFolio": "RAC-AVI-ACL-002",
      "invoiceCode": "2756",
      "purchaseOrderCode": "PVR-OC-0005113",
      "customFieldsText": "Ubicación: Bodega satélite | Proveedor: ITISA | Cantidad: 2"
    }
  ]
}
```

### b) Modo serial exacto
```json
{
  "mode": "serial-exact",
  "q": "MXL43329WW",
  "results": [ { "...": "registro exacto" } ],
  "suggestions": []
}
```

### c) Modo serial fuzzy (si no hay exacto, sugiere parecidos)
```json
{
  "mode": "serial-fuzzy",
  "q": "MXL43329WQ",
  "results": [],
  "suggestions": [
    { "serialNumber": "MXL43329WW", "modelName": "ProDesk 600 G1SFF", "dist": 1 }
  ]
}
```

**Consultas de ejemplo** (copy/paste):
```bash
# Comentarios / Ubicación (custom fields)
curl -s -X POST http://127.0.0.1:4010/search/hybrid   -H 'Content-Type: application/json'   -d '{"q":"Ubicación Bodega satélite"}' | jq

# Orden de compra
curl -s -X POST http://127.0.0.1:4010/search/hybrid   -H 'Content-Type: application/json'   -d '{"q":"orden de compra PVR-OC-0005113"}' | jq

# Factura
curl -s -X POST http://127.0.0.1:4010/search/hybrid   -H 'Content-Type: application/json'   -d '{"q":"factura 2756"}' | jq

# Proveedor
curl -s -X POST http://127.0.0.1:4010/search/hybrid   -H 'Content-Type: application/json'   -d '{"q":"Proveedor ITISA"}' | jq
```

---

## 6) `POST /models/specs`

**Descripción:** genera una “ficha técnica probable” (IA local) para el inventario indicado. Usa marca, modelo y tipo como contexto.

**Body**
```json
{ "id": "<UUID de Inventory>" }
```

**Respuesta 200 (ejemplo)**
```json
{
  "id": "107d0d6e-c28d-45f9-8f8c-fce5bf17a449",
  "brand": "HP",
  "model": "EliteDesk 800 G1 SFF",
  "specs": "- CPU: Intel Core i5/i7 4ª gen\n- RAM: 8–16 GB DDR3\n- Almacenamiento: 256 GB SSD o 500 GB HDD..."
}
```

---

## 7) `GET /analytics/charts` (opcional)

**Descripción:** datos simples para gráficas (status y marcas).

**Respuesta 200 (ejemplo)**
```json
{
  "statusChart": { "type": "bar", "labels": ["ALTA","BAJA"], "data": [123,45] },
  "brandChart":  { "type": "bar", "labels": ["HP","Dell","Apple"], "data": [80,40,12] }
}
```

---

## 8) `GET /debug/ingest-dry-run` (opcional)

**Descripción:** realiza embeddings de una página de resultados **sin** escribir en Qdrant. Útil para diagnóstico.

**Query params**: `pageSize` (por defecto 5).

**Respuesta 200 (ejemplo)**
```json
{
  "ok": true,
  "dimExpected": 768,
  "count": 5,
  "stats": [
    { "id": 123, "len": 768, "nonFinite": 0, "sample": [0.01, -0.02, ...], "text": "HP | ProDesk 600 G1SFF | ..." }
  ]
}
```

---

## Consideraciones de frontend

- **Tu UI solo necesita llamar** `POST /search/hybrid` con `{ "q": "..." }`. El backend infiere filtros y maneja seriales.
- Para mostrar ficha: botón “Ver ficha” → `POST /models/specs` con el `id` del resultado.
- Mantén un **spinner** para ingestas largas. Para indexar toda la DB, lanza `/ingest` por tramos con `maxPages` + `offsetPages`.
- Si tu balanceador expone el servicio como `/ai/` (Nginx), la URL desde el frontend sería `/ai/search/hybrid`, etc.

---

## Errores y timeouts

- **404 /index en Qdrant**: tu versión no soporta creación de índices de payload por HTTP. Se ignora (solo warning).
- **CPU alta durante /ingest**: normal (Ollama calculando embeddings). Baja `embedConcurrency` si necesitas.
- **Resultados vacíos**: confirma que la ingesta haya subido suficientes puntos (`/collections/.../points/count`).

