# Sinabe AI - Motor de Búsqueda Inteligente

Motor de búsqueda en lenguaje natural para inventarios de Sinabe.

## 🎯 Características

- ✅ **Planner schema-driven** (deriva rutas de filtros/joins desde `schema.prisma`)
- ✅ **Listar inventarios** con filtros en rutas relacionales validadas
- ✅ **Conteos deterministas** con `COUNT(DISTINCT Inventory.id)`
- ✅ **Conteos agrupados** por cualquier ruta válida (ej. `Condition.name`)
- ✅ **Respuesta explicable**: `meta.plan`, `meta.appliedFilters`, `meta.joinsUsed`
- ✅ **Clarificación estricta** cuando hay ambigüedad o valores inválidos
- ✅ **(Opcional)** Búsqueda semántica con Qdrant

## 📊 Modos de Operación

| Modo                  | RAM    | Descripción                               |
| --------------------- | ------ | ----------------------------------------- |
| **Heurístico**        | ~100MB | Solo reglas regex, rápido y ligero        |
| **LLM (llama3.2:3b)** | 4-6GB  | Agrega Ollama para mejor interpretación   |
| **Semántico**         | 6-8GB  | Agrega Qdrant para búsqueda por similitud |

> **Servidor 8GB RAM**: Usa modo **Heurístico** o **LLM** con modelos pequeños (llama3.2:3b ~2.5GB)

---

## 🧭 Schema-Driven (V2)

El servicio ahora valida filtros y agrupaciones contra rutas reales del esquema Prisma.

Formato de plan interno:

```json
{
  "entity": "Inventory",
  "action": "count",
  "filters": [
    { "path": "InventoryType.name", "op": "contains", "value": "switch" },
    { "path": "Condition.name", "op": "contains", "value": "sin usar" }
  ],
  "groupBy": [],
  "pagination": { "page": 1, "limit": 50 },
  "sort": [{ "path": "Inventory.createdAt", "dir": "desc" }]
}
```

Si no se puede mapear de forma determinista, responde:

```json
{
  "type": "need_clarification",
  "message": "No pude identificar por qué dimensión agrupar.",
  "options": ["Agrupar por Condition.name", "Agrupar por InventoryBrand.name"]
}
```

---

## 🚀 Quick Start (Windows - Desarrollo)

### Opción Rápida: PowerShell Script

```powershell
cd ai
.\start.ps1
```

El script:

1. Crea `.env` si no existe
2. Detecta si LLM está habilitado
3. Levanta los contenedores necesarios
4. Verifica el health check

### Opción Manual

```bash
cd ai
cp .env.example .env
# Edita .env con tus credenciales MySQL

# Solo AI (modo heurístico)
docker compose up -d --build sinabe-ai

# AI + Ollama (modo LLM)
docker compose up -d --build
```

---

## 🔧 Configuración .env

### Desarrollo Local (Windows)

```env
# MySQL - Conexión desde Docker al MySQL del host
MYSQL_HOST=host.docker.internal
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=sinabe_db

# LLM - ACTIVADO para desarrollo
USE_OLLAMA=true
OLLAMA_BASE_URL=http://sinabe-ollama:11434
OLLAMA_CHAT_MODEL=llama3.2:3b

# Qdrant - Deshabilitado
USE_QDRANT=false
```

### Producción (Ubuntu - 8GB RAM)

Usa el archivo `.env.production`:

```env
# MySQL - Conexión directa (MySQL local, no contenedor)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=sinabe_read
MYSQL_PASSWORD=password_seguro
MYSQL_DATABASE=sinabe_db

# LLM - DESHABILITADO (8GB RAM limitado)
USE_OLLAMA=false

# Cuando tengas 32GB RAM, activa:
# USE_OLLAMA=true
# OLLAMA_BASE_URL=http://sinabe-ollama:11434
# OLLAMA_CHAT_MODEL=llama3.2:3b
```

---

## 🧠 Modo LLM (Ollama)

### Primera Ejecución

Cuando `USE_OLLAMA=true`, el contenedor Ollama:

1. Se inicia automáticamente
2. Descarga el modelo `llama3.2:3b` (~2GB) - **tarda 5-10 min**
3. Queda listo para procesar consultas

### Verificar Estado

```bash
# Ver si Ollama está listo
curl http://localhost:11434/api/tags

# Ver logs del contenedor
docker logs sinabe-ollama -f
```

### Modelos Disponibles

| Modelo      | RAM    | Velocidad  | Calidad |
| ----------- | ------ | ---------- | ------- |
| llama3.2:1b | ~1GB   | Muy rápido | Básica  |
| llama3.2:3b | ~2.5GB | Rápido     | Buena ✓ |
| llama3.1:8b | ~5GB   | Lento      | Mejor   |

Para cambiar modelo, edita `OLLAMA_CHAT_MODEL` en `.env`.

---

## 🖥️ Instalación PRODUCCIÓN (Ubuntu Server)

### Prerrequisitos

- Ubuntu 24.04 LTS
- Docker + Docker Compose instalados
- MySQL ya corriendo en el servidor (sin contenedor)
- Git

### Paso 1: Clonar y Configurar

```bash
# Entrar al servidor
ssh user@tu-servidor

# Clonar o actualizar repo
cd /opt
git clone https://github.com/tu-repo/sinabe.git
# O si ya existe:
cd /opt/sinabe && git pull

# Ir a carpeta AI
cd /opt/sinabe/ai
cp .env.example .env
```

### Paso 2: Configurar Variables de Entorno

Edita `.env` para producción:

```env
# Server
PORT=4080
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com,https://sinabe.giize.com

# MySQL - Conexión directa al MySQL del servidor
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=sinabe_read        # Usuario de solo lectura (recomendado)
MYSQL_PASSWORD=tu_password_seguro
MYSQL_DATABASE=sinabe_db

# Fase A - Sin IA (más estable en 8GB RAM)
USE_OLLAMA=false
ENABLE_QDRANT=false

# Límites
MAX_LIMIT=200
DEFAULT_LIMIT=50
DEFAULT_ONLY_ENABLED=true
```

### Paso 3: Crear Usuario MySQL de Solo Lectura (Recomendado)

```sql
-- En MySQL como root
CREATE USER 'sinabe_read'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT SELECT ON sinabe_db.* TO 'sinabe_read'@'localhost';
FLUSH PRIVILEGES;
```

### Paso 4: Levantar el Servicio

```bash
# Asegurarse de que el contenedor use la red del host para acceder a MySQL local
docker compose up -d --build
```

Si MySQL no acepta conexiones desde Docker, modifica `docker-compose.yml`:

```yaml
services:
  sinabe-ai:
    network_mode: "host" # Usar red del host
```

### Paso 5: Verificar

```bash
# Verificar que el contenedor esté corriendo
docker ps | grep sinabe-ai

# Verificar logs
docker logs sinabe-ai -f

# Probar health
curl http://localhost:4080/health
```

### Paso 6: Configurar Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/sinabe
server {
    listen 443 ssl;
    server_name sinabe.giize.com;

    # ... SSL config ...

    # API principal de Sinabe
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Sinabe AI
    location /ai/ {
        proxy_pass http://localhost:4080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;  # Timeout largo para consultas complejas
    }

    # Frontend estático
    location / {
        root /var/www/sinabe;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Paso 7: Configurar Frontend para Producción

En el build de producción, asegúrate de que `VITE_AI_URL` apunte al proxy:

```env
VITE_AI_URL=https://sinabe.giize.com/ai
```

---

## 📝 API Reference

### Endpoints

#### `GET /health`

Verifica estado del servicio.

```json
{
  "ok": true,
  "mysql": "ok",
  "qdrant": "disabled",
  "ollama": "disabled",
  "ts": "2026-01-01T00:00:00.000Z"
}
```

#### `POST /ai/query`

Consulta principal en lenguaje natural.

**Request:**

```json
{
  "q": "Cuántos inventarios hay por ubicación",
  "page": 1,
  "limit": 50
}
```

**Response (list):**

```json
{
  "ok": true,
  "query": "...",
  "plan": { "entity": "Inventory", "action": "list", "...": "..." },
  "type": "list",
  "total": 150,
  "items": [...],
  "page": 1,
  "limit": 50,
  "hasMore": true,
  "message": "150 inventarios encontrados",
  "meta": {
    "plan": { "entity": "Inventory", "action": "list", "...": "..." },
    "appliedFilters": [{ "path": "Inventory.enabled", "op": "eq", "value": true }],
    "joinsUsed": [{ "from": "Inventory", "to": "Model", "kind": "many-to-one" }],
    "sql": "...",
    "params": ["..."]
  },
  "elapsed": "45ms"
}
```

**Response (aggregation):**

```json
{
  "ok": true,
  "type": "aggregation",
  "metric": "count",
  "total": 500,
  "message": "Total: 500 inventarios"
}
```

**Response (grouped):**

```json
{
  "ok": true,
  "type": "aggregation",
  "metric": "count",
  "groupBy": "location",
  "rows": [
    { "key": "CCTV", "count": 150 },
    { "key": "Bodega", "count": 100 }
  ],
  "total": 250
}
```

#### `GET /ai/config`

Configuración del servicio.

#### `GET /ai/suggestions`

Ejemplos de consultas para la UI.

---

## 🔍 Ejemplos de Consultas

### Listas

- "Lista inventarios Avigilon creados entre octubre y noviembre"
- "Inventarios ALTA en ubicación CCTV"
- "Muéstrame inventarios con factura pero sin orden de compra"

### Conteos

- "Cuántos inventarios hay de la marca Avigilon"
- "Total de inventarios BAJA"
- "Cuántos inventarios no tienen número de serie"

### Agrupaciones

- "Cuántos inventarios hay por ubicación"
- "Cuántos inventarios por condición"
- "Cuántos inventarios en resguardo activo"

### Faltantes

- "Lista inventarios sin ubicación"
- "Inventarios sin factura"
- "Inventarios sin número de activo"
- "Inventarios sin fecha de alta"

---

## 🔧 Troubleshooting

### Error: "Can't connect to MySQL"

1. Verifica que MySQL esté corriendo: `systemctl status mysql`
2. Verifica credenciales en `.env`
3. Si usas Docker, usa `host.docker.internal` como host o `network_mode: host`

### Error: "ECONNREFUSED" al conectar desde Docker

```bash
# Opción 1: Usar extra_hosts (ya configurado en docker-compose.yml)
# Opción 2: Usar network_mode: host
# Opción 3: Permitir conexiones externas en MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Cambiar: bind-address = 0.0.0.0
sudo systemctl restart mysql
```

### El servicio consume mucha RAM

- Usa Fase A (sin Ollama ni Qdrant)
- Limita las conexiones de MySQL: `connectionLimit: 5`
- Asegura que no haya memory leaks con: `docker stats sinabe-ai`

### Consultas muy lentas

- Verifica índices en MySQL en las tablas: Inventory, Model, InventoryBrand, etc.
- Reduce el límite por defecto en `.env`: `DEFAULT_LIMIT=25`

---

## 📈 Futuro (32GB RAM)

Cuando tengas más RAM:

1. **Habilitar Ollama:**

```env
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_CHAT_MODEL=llama3.2:3b
```

2. **Descargar modelos:**

```bash
docker exec sinabe-ollama ollama pull llama3.2:3b
docker exec sinabe-ollama ollama pull nomic-embed-text
```

3. **Habilitar búsqueda semántica:**

```env
ENABLE_QDRANT=true
```

4. **Indexar inventarios:**

```bash
docker exec sinabe-ai npm run index:bootstrap
docker exec sinabe-ai npm run index:sync
```

---

## 🧪 Smoke Test (dev)

```bash
cd ai
npm run dev:queries
```

Ejecuta consultas objetivo y muestra para cada una:
- `plan`
- `joinsUsed`
- `sql`
- `params`
- `result`

---

## 📁 Estructura del Proyecto

```
ai/
├── docker-compose.yml    # Configuración Docker
├── Dockerfile           # Build del servicio
├── package.json         # Dependencias
├── .env.example         # Variables de entorno ejemplo
├── README.md            # Esta documentación
├── docs/
│   └── QUERIES.md       # Ejemplos de consultas
└── src/
    ├── index.js         # Entry point Express
    ├── config/
    │   └── dbNames.js   # Mapeo de tablas/columnas MySQL
    ├── routes/
    │   ├── ai.routes.js      # Endpoints /ai/*
    │   └── health.routes.js  # Endpoint /health
    ├── services/
    │   ├── executor.js       # Ejecuta planes
    │   ├── inventoryRepo.js  # Queries a MySQL
    │   ├── mysql.js          # Pool de conexiones
    │   ├── ollama.js         # Cliente Ollama
    │   ├── planner.js        # Genera plan con LLM
    │   ├── planner_heuristic.js  # Genera plan con reglas
    │   ├── qdrant.js         # Cliente Qdrant
    │   ├── semantic.js       # Búsqueda vectorial
    │   └── sqlBuilder.js     # Genera SQL seguro
    └── scripts/
        ├── bootstrap_qdrant.js   # Inicializa colección
        ├── healthcheck.js        # Health check script
        └── sync_inventories.js   # Indexa inventarios
```
