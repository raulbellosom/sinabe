# Ejemplos de Consultas - Sinabe AI

Este documento contiene todos los tipos de consultas soportadas por el motor de búsqueda inteligente.

## 📋 Tipos de Respuesta

El motor devuelve diferentes tipos de respuesta según la consulta:

| Tipo                    | Descripción                   | Cuándo se usa                |
| ----------------------- | ----------------------------- | ---------------------------- |
| `list`                  | Lista de inventarios paginada | Consultas de listado         |
| `aggregation`           | Total numérico                | Consultas de conteo          |
| `aggregation` (grouped) | Conteos agrupados             | "por ubicación", "por marca" |
| `mixed`                 | Total + lista                 | Consultas de faltantes       |

---

## 📄 Listas (type: list)

Devuelven una lista paginada de inventarios.

```
Lista inventarios Avigilon creados entre octubre y noviembre
Inventarios ALTA en ubicación CCTV
Muéstrame inventarios con factura pero sin orden de compra
Inventarios de tipo cámara
Lista equipos de la marca Hikvision
Inventarios creados en 2024
Inventarios de marca Axis con status ALTA
```

**Respuesta esperada:**

```json
{
  "type": "list",
  "total": 150,
  "items": [
    {
      "id": "uuid",
      "status": "ALTA",
      "brandName": "Avigilon",
      "modelName": "H4A-BO1-IR",
      "typeName": "Cámara",
      "locationName": "CCTV",
      "serialNumber": "ABC123",
      "activeNumber": "A-001",
      ...
    }
  ],
  "page": 1,
  "limit": 50,
  "hasMore": true
}
```

---

## 🔢 Conteos Simples (type: aggregation)

Devuelven un número total.

```
Cuántos inventarios hay de la marca Avigilon
Total de inventarios BAJA
Cuántos inventarios hay
Cuántos inventarios no tienen número de serie
Cantidad de equipos con factura
Total de inventarios en ubicación Bodega
```

**Respuesta esperada:**

```json
{
  "type": "aggregation",
  "metric": "count",
  "total": 500,
  "message": "Total: 500 inventarios"
}
```

---

## 📊 Agrupaciones (type: aggregation + groupBy)

Devuelven conteos agrupados por un campo.

```
Cuántos inventarios hay por ubicación
Conteo por marca (solo ALTA)
Cuántos por tipo de inventario
Inventarios agrupados por status
Conteo de equipos por modelo
Cuántos hay por marca y que estén en ALTA
```

**Respuesta esperada:**

```json
{
  "type": "aggregation",
  "metric": "count",
  "groupBy": "location",
  "rows": [
    { "key": "CCTV", "count": 150 },
    { "key": "Bodega", "count": 100 },
    { "key": "Terminal 2", "count": 75 },
    { "key": null, "count": 25 }
  ],
  "total": 350
}
```

### Campos de agrupación soportados:

- `brand` - Por marca
- `type` - Por tipo de inventario
- `model` - Por modelo
- `location` - Por ubicación
- `status` - Por estado (ALTA/BAJA/PROPUESTA)

---

## ❓ Faltantes (type: mixed)

Devuelven inventarios que les falta un campo o relación.

### Campos faltantes:

```
Lista inventarios sin ubicación
Inventarios sin factura
Inventarios sin orden de compra
Inventarios sin número de activo
Inventarios sin número de serie
Inventarios sin folio interno
Inventarios sin fecha de alta
Inventarios sin fecha de baja
Inventarios sin fecha de recepción
```

**Respuesta esperada:**

```json
{
  "type": "mixed",
  "total": 45,
  "items": [...],
  "message": "45 inventarios sin ubicación"
}
```

---

## 🔍 Búsqueda Semántica (type: list) - Requiere Qdrant

Solo disponible si `ENABLE_QDRANT=true`.

```
Busca equipos de cámaras en terminal 2
Equipos de video vigilancia que mencionen dome o bullet
Buscar inventarios relacionados con grabadores
Equipos similares a NVR
```

---

## 📅 Filtros de Fecha

### Entre meses (año actual por defecto):

```
Inventarios creados entre octubre y noviembre
Equipos registrados entre enero y marzo de 2024
```

### En un mes específico:

```
Inventarios de octubre
Equipos creados en noviembre 2023
```

### Por año:

```
Inventarios creados en 2024
Equipos del 2023
```

---

## 🏷️ Filtros Combinados

Puedes combinar múltiples filtros:

```
Inventarios ALTA de marca Avigilon en ubicación CCTV
Cuántos inventarios de tipo Switch hay por ubicación
Lista equipos Hikvision sin factura
Inventarios BAJA entre enero y marzo
Conteo por marca de los que tienen orden de compra
```

---

## 💡 Tips para Mejores Resultados

1. **Sé específico con las marcas**: Usa el nombre exacto de la marca.
2. **Para conteos agrupados**: Siempre incluye "por [campo]".
3. **Para faltantes**: Usa "sin [campo]".
4. **Status**: Usa ALTA, BAJA o PROPUESTA en mayúsculas.
5. **Fechas**: Menciona meses en español (enero, febrero, etc.).

---

## ⚠️ Limitaciones

- Máximo 200 resultados por página (configurable).
- Las consultas semánticas requieren Qdrant activado.
- Los filtros de texto son case-insensitive.
- Solo busca en inventarios habilitados por defecto (configurable).
