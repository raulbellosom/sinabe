# Sinabe — Módulo de Notificaciones (Reglas / Alertas programables)

> Objetivo: crear un sistema tipo “si pasa X, entonces haz Y” (estilo Avigilon CCM) para disparar **notificaciones programables** por **Email (obligatorio)** y **Notificaciones In‑App** (y dejar preparado el camino para Push PWA/Capacitor).

---

## 1) Contexto actual (lo que YA tienes)

### Backend stack detectado
- Node + Express (ESM `"type": "module"`).  
- Prisma 6 + MySQL.  
- Nodemailer ya instalado y operativo para emails.  
- date-fns ya instalado (útil para cálculos de fechas).  

Archivos relevantes:
- `package.json` (dependencias existentes). fileciteturn1file0
- `src/index.js` (montaje de rutas Express). fileciteturn1file2
- `emailService.js` (transport con SMTP_* y envío base). fileciteturn1file1
- `.env.example` (variables actuales para SMTP y APP_URL). fileciteturn0file3

### Envío de correo actual
`emailService.js` crea un transporter con `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y bandera `SMTP_REQUIRE_AUTH`. fileciteturn1file1  
Esto es perfecto como “canal EMAIL” del nuevo módulo. Solo vamos a generalizarlo (no limitarlo a “custody”).

---

## 2) Qué vamos a construir

### Concepto
- **Regla (Rule):** define *qué buscar* (condición) + *cada cuándo* (schedule) + *a quién* (destinatarios) + *por qué canales* (email / in-app / push).
- **Motor (Engine):** servicio backend que ejecuta reglas “que ya tocan”, evalúa coincidencias y genera notificaciones.
- **Auditoría / logs:** cada ejecución queda registrada y cada entrega por canal también (éxitos, errores, reintentos).

### Enfoque recomendado (incremental)
1) **MVP:** reglas por intervalo (cada N días/horas) + canales EMAIL e IN_APP.  
2) **Plus:** reglas CRON + deduplicación por “misma coincidencia” + plantillas de email.  
3) **Push:** Web Push (PWA) + Push nativo (Capacitor/Android) cuando estés listo.

---

## 3) Librerías a agregar (mínimo viable)

### Scheduler
Escoge UNA de estas rutas:

**Opción A (simple y rápida): `node-cron`**
- ✅ fácil, cero infraestructura extra
- ⚠️ si en producción corres múltiples instancias del backend, necesitas “lock” para no duplicar ejecuciones

**Opción B (robusta): `bullmq` + Redis**
- ✅ escalable, reintentos, locks, jobs programados
- ⚠️ requiere Redis (otro contenedor/servicio)

**Recomendación:** empezar con **node-cron** y diseñar el schema para migrar luego a BullMQ sin reescribir reglas.

### Extras (opcionales, pero útiles)
- Plantillas de email: `handlebars` o `ejs`
- Push PWA: `web-push` (VAPID)
- Validación: `zod` (para validar inputs en endpoints de reglas)

---

## 4) Cambios de base de datos (Prisma)

Tu `schema.prisma` ya maneja `enabled: Boolean @default(true)` en varias tablas, y tiene enums como `Status` (ALTA/BAJA/PROPUESTA) y condiciones vía `Condition` + tabla pivote `InventoryCondition`.  
Esto lo aprovechamos tal cual. (Ej: `Inventory.status: Status`, `Inventory.purchaseOrderId`, `Inventory.invoiceId`, `Inventory.locationId` son opcionales). fileciteturn0file1

### 4.1 Modelos nuevos propuestos

> Nota: nombres sugeridos. Puedes ajustarlos a tu convención.

#### Enum de canales y estado
```prisma
enum NotificationChannel {
  EMAIL
  IN_APP
  PUSH_WEB
  PUSH_MOBILE
}

enum NotificationDeliveryStatus {
  PENDING
  SENT
  FAILED
}
```

#### Reglas (cabecera)
```prisma
model NotificationRule {
  id            String   @id @default(uuid())
  name          String
  description   String?
  enabled       Boolean  @default(true)

  // “tipo” de regla (para decidir qué evaluator usar)
  ruleType      String   // ej: "INVENTORY_AUDIT_MISSING_FIELDS"

  // Parámetros JSON del evaluator (filtros, lookback, etc.)
  params        Json

  // Schedule
  scheduleType  String   // "INTERVAL" | "CRON"
  intervalDays  Int?     // si scheduleType = INTERVAL
  cronExpr      String?  // si scheduleType = CRON
  timezone      String   @default("America/Mexico_City")

  lastRunAt     DateTime?
  nextRunAt     DateTime?

  createdById   String?
  createdBy     User?    @relation(fields: [createdById], references: [id])

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  channels      NotificationRuleChannel[]
  recipients    NotificationRuleRecipient[]
  runs          NotificationRuleRun[]
}
```

#### Canales por regla
```prisma
model NotificationRuleChannel {
  id        Int               @id @default(autoincrement())
  ruleId    String
  rule      NotificationRule  @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  channel   NotificationChannel

  // Config extra por canal (ej: subject template, etc.)
  config    Json?

  @@unique([ruleId, channel])
}
```

#### Destinatarios (To/CC/BCC) mixtos: userId o email directo
```prisma
enum RecipientKind {
  USER
  EMAIL
}

enum EmailRecipientRole {
  TO
  CC
  BCC
}

model NotificationRuleRecipient {
  id        Int               @id @default(autoincrement())
  ruleId    String
  rule      NotificationRule  @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  kind      RecipientKind

  // Para kind=USER
  userId    String?
  user      User?             @relation(fields: [userId], references: [id])

  // Para kind=EMAIL
  email     String?

  // Solo aplica a canal EMAIL (para in-app normalmente se infiere USER)
  emailRole EmailRecipientRole @default(TO)
}
```

#### Ejecuciones y auditoría
```prisma
model NotificationRuleRun {
  id          String   @id @default(uuid())
  ruleId      String
  rule        NotificationRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  startedAt   DateTime @default(now())
  finishedAt  DateTime?
  status      String   @default("SUCCESS") // o enum si quieres
  matchCount  Int      @default(0)

  // Guardamos un “snapshot” resumido de lo encontrado (para auditoría)
  result      Json?

  deliveries  NotificationDelivery[]
}
```

#### Notificación In-App (bandeja)
```prisma
model InAppNotification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String
  body      String
  data      Json?

  readAt    DateTime?
  createdAt DateTime @default(now())

  // Relación opcional con la ejecución de regla
  ruleRunId String?
}
```

#### Log por canal (email/in-app/push)
```prisma
model NotificationDelivery {
  id          String                    @id @default(uuid())
  ruleRunId   String
  ruleRun     NotificationRuleRun       @relation(fields: [ruleRunId], references: [id], onDelete: Cascade)

  channel     NotificationChannel
  status      NotificationDeliveryStatus @default(PENDING)

  // Para email: destinatarios concretos usados en esa entrega
  to          String?
  cc          String?
  bcc         String?

  error       String?
  createdAt   DateTime @default(now())
  sentAt      DateTime?
}
```

### 4.2 Push (opcional para después)
Si luego quieres Push PWA/Capacitor, agrega tabla de subscripciones:
```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  kind      String   // "WEB" | "MOBILE"
  payload   Json     // endpoint + keys (web push) o token FCM (mobile)

  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

---

## 5) Motor de reglas (backend)

### 5.1 Arquitectura propuesta
- `src/notifications/`
  - `scheduler.js` → dispara ejecuciones (cron/interval)
  - `engine.js` → “runRule(ruleId)” (orquesta)
  - `evaluators/` → un archivo por tipo de regla (inventory, deadlines, etc.)
  - `channels/`
    - `email.channel.js` → usa nodemailer (tu emailService, pero genérico)
    - `inapp.channel.js` → escribe en `InAppNotification`
    - `push.channel.js` → futuro
  - `templates/` → plantillas de email (opcional)

### 5.2 Flujo de ejecución (alto nivel)
1) Scheduler consulta DB: reglas `enabled=true` con `nextRunAt <= now()`.
2) Por cada regla:
   - crea `NotificationRuleRun`
   - evalúa coincidencias (evaluator) y arma un “mensaje”
   - entrega por cada canal seleccionado (email/inapp)
   - crea `NotificationDelivery` por canal (y opcionalmente por batch)
   - actualiza `lastRunAt` / `nextRunAt`
3) Deduplicación (recomendado):
   - guarda en `result` un hash/ids de coincidencias para evitar re‑notificar exactamente lo mismo en cada corrida.

---

## 6) Regla ejemplo: “Inventarios incompletos” cada 3 días

### Caso de negocio
“Enviar cada 3 días un listado de inventarios registrados recientemente con:
- `status = ALTA`
- condición = NUEVO
- y sin orden de compra, o sin factura, o sin ubicación (según el criterio que definas)
- a X correos (TO) y Y correos (CC)
- y además generar notificación en la plataforma (IN_APP) a los usuarios seleccionados.”

### 6.1 Cómo modelar los parámetros (params)
Ejemplo de `params` para esta regla:
```json
{
  "lookbackDays": 30,
  "status": "ALTA",
  "conditionName": "NUEVO",
  "missing": ["purchaseOrderId", "invoiceId", "locationId"],
  "groupBy": "location"
}
```

### 6.2 Query Prisma (conceptual)
Tu schema tiene:
- `Inventory.status: Status`
- `Inventory.purchaseOrderId`, `invoiceId`, `locationId` como opcionales
- condiciones via `Inventory.conditions -> InventoryCondition -> Condition` fileciteturn0file1

Ejemplo (pseudo-código):
```js
const since = subDays(new Date(), params.lookbackDays);

const inventories = await prisma.inventory.findMany({
  where: {
    enabled: true,
    status: params.status, // "ALTA"
    createdAt: { gte: since },
    OR: [
      { purchaseOrderId: null },
      { invoiceId: null },
      { locationId: null },
    ],
    conditions: {
      some: {
        condition: { name: params.conditionName } // "NUEVO"
      }
    }
  },
  include: {
    location: true,
    model: { include: { brand: true, type: true } },
    conditions: { include: { condition: true } }
  }
});
```

> Ajusta el include a los nombres exactos de tus relaciones (model/brand/type) según tu `schema.prisma`.

### 6.3 Formato del correo
- Subject recomendado: `Sinabe | Inventarios incompletos (ALTA/NUEVO) | {fecha}`
- Body: tabla simple (texto o HTML) con:
  - Serie / Modelo / Tipo / Marca
  - Fecha de alta (createdAt)
  - Campos faltantes: (PO, Factura, Ubicación)
  - Link a la pantalla filtrada en la app (si existe), usando `APP_URL`

---

## 7) Endpoints a crear (API)

### 7.1 Reglas
- `GET /api/notification-rules` (listar)
- `POST /api/notification-rules` (crear)
- `GET /api/notification-rules/:id` (detalle)
- `PUT /api/notification-rules/:id` (editar)
- `DELETE /api/notification-rules/:id` (soft delete o enabled=false)
- `POST /api/notification-rules/:id/test-run` (previsualizar coincidencias + enviar opcionalmente a un correo de prueba)

### 7.2 Bandeja In-App
- `GET /api/notifications` (mis notificaciones)
- `POST /api/notifications/:id/read` (marcar como leída)
- `POST /api/notifications/read-all`

> Puedes reutilizar tu middleware JWT actual para obtener `req.user`.

---

## 8) UI (frontend) — solo planeación

### Pantalla “Reglas y notificaciones”
- Lista de reglas (nombre, enabled, frecuencia, canales, últimos envíos)
- Botón “Crear regla”
- Form:
  - Nombre + Descripción
  - Tipo de regla (select)
  - Frecuencia (cada N días / cron)
  - Canales (checkbox: Email, In-App)
  - Destinatarios:
    - Users (para In-App)
    - Emails To/CC/BCC (para Email)
  - Parámetros del tipo (UI dinámica según ruleType)
- Botón “Probar” (test-run) que muestre coincidencias antes de guardar o antes de activar

---

## 9) Cambios en configuración (.env)

Tu `.env.example` ya trae SMTP_* y `CUSTODY_FROM`. fileciteturn0file3  
Recomendación: generalizar a variables de notificaciones:

Agregar:
```
NOTIFY_FROM="Sinabe <no-reply@empresa.com>"
NOTIFY_DEFAULT_CC="..."
NOTIFY_DEFAULT_BCC="..."
NOTIFY_TIMEZONE="America/Mexico_City"
```

Y opcional (Push PWA):
```
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:tu_correo@dominio.com"
```

---

## 10) Consideraciones importantes (para que no truene en producción)

### 10.1 Gmail / Nodemailer
- Si usas Gmail real, lo más estable suele ser **App Password** (con 2FA) o **OAuth2** (más complejo).
- Evita guardar la contraseña en DB: solo `.env`.

### 10.2 “No duplicar ejecuciones”
Si corres 2 instancias del backend y usas node-cron:
- Implementa un “lock” por DB al arrancar un `NotificationRuleRun`
  - Ej: update atómico de `nextRunAt` antes de evaluar, o tabla `JobLock` con TTL.

Con BullMQ esto viene resuelto por diseño.

### 10.3 Deduplicación por coincidencias
Si una regla corre cada 3 días y los inventarios incompletos siguen incompletos, ¿debe avisar de nuevo?
- Opción 1: sí, siempre (lo que pediste).
- Opción 2: sí, pero solo si hay “nuevos” desde el último run.
- Opción 3: sí, pero con límite (ej. máx 1 aviso por inventario cada 7 días).

Esto se resuelve guardando en `NotificationRuleRun.result` un arreglo/hashes de ids reportados.

---

## 11) Roadmap de implementación (orden sugerido)

1) **DB**
   - Agregar los modelos nuevos en Prisma
   - `prisma migrate dev`
2) **Infra**
   - Crear carpeta `src/notifications/`
   - Crear `scheduler.js` con node-cron (ej: corre cada minuto)
3) **Engine**
   - `runDueRules()` (busca reglas due y ejecuta)
   - `runRule(rule)`
4) **Evaluator INVENTORY_AUDIT_MISSING_FIELDS**
   - Query Prisma + armado de payload (title/body/data)
5) **Channels**
   - `email.channel.js` usando transporter existente (refactor de `sendCustodyEmail`)
   - `inapp.channel.js` insert a `InAppNotification`
6) **API CRUD**
   - endpoints de reglas + test-run
   - bandeja in-app
7) **Frontend**
   - formulario de reglas (mínimo) + bandeja de notificaciones

---

## 12) Checklist de “Definition of Done” (MVP)

- [ ] Se pueden crear reglas con intervalo en días (p. ej. cada 3 días).
- [ ] Regla de inventarios incompletos ejecuta el barrido y encuentra coincidencias.
- [ ] Se envía email usando el SMTP actual.
- [ ] Se crean notificaciones en la plataforma (InAppNotification) a usuarios seleccionados.
- [ ] Se registra auditoría de cada corrida y de cada entrega.
- [ ] Endpoint `test-run` devuelve coincidencias sin esperar al scheduler.

---

## 13) Próximo paso (para que lo implementes en VS Code)

1) Crea una rama: `feature/notification-rules`
2) Implementa primero **solo**:
   - modelos Prisma
   - `node-cron` scheduler
   - evaluator inventarios
   - email + in-app
3) Luego ya metes UI.

