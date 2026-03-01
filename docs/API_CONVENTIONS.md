# API Conventions (Frontend Migration)

## Frontend HTTP
- Cliente único: `src/lib/api/client.js`
- Helpers: `src/lib/api/http.js`
- Base URL: `VITE_API_BASE_URL` (fallback temporal: `VITE_API_URL`)

## Contratos esperados en módulos migrados
- Listado: `{ data, meta: { page, limit, total, totalPages } }`
- Detalle: `{ data }`
- Error: `{ error: { code, message, details? } }`

## Headers
- `Authorization: Bearer <token>` por interceptor global.
- Logging de errores 5xx en modo desarrollo.

## Nota de transición
- Servicios legacy que aún no migran completamente continúan funcionando sobre el cliente central.
- Módulo AI conserva cliente independiente por `VITE_AI_URL`.
