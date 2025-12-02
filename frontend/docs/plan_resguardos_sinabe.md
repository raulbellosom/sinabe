
# Módulo de **Resguardo de Equipo Tecnológico** – Plan de implementación

Basado en el formato corporativo **GAPTI-F-018 RESGUARDO DE EQUIPO TECNOLÓGICO** (logo GAP, encabezado “DIRECCION DE SOSTENIBILIDAD, CALIDAD E INNOVACION”, título “RESGUARDO DE EQUIPO TECNOLÓGICO”, secciones de Datos del Empleado, Datos del Equipo, Comentarios, texto legal y dos firmas: “Recibí equipo” y “Entrega”).

---

## 1. Objetivo

Implementar en **Sinabe** un módulo `/resguardos` que permita:

1. Seleccionar uno o varios inventarios y generar un **resguardo en PDF** con el formato corporativo *idéntico* al oficial.
2. Autocompletar los datos del empleado que recibe el equipo.
3. Capturar características de los equipos, comentarios y **firmas dibujadas**.
4. Guardar el PDF en el sistema, asociarlo a los inventarios seleccionados.
5. Enviar el PDF por correo al empleado y a una lista de distribución obligatoria.
6. Registrar al empleado como usuario “inactivo” si aún no existe en el sistema.

---

## 2. Tecnologías y librerías sugeridas

### Frontend (React + Vite + Tailwind + Flowbite)

- **Gestión de formulario**
  - `formik` + `yup` para validaciones.
- **Firma digital (canvas)**
  - `react-signature-canvas` (wrapper de `signature_pad`).
- **Generación de vista previa**
  - HTML normal con Tailwind copiando el layout del PDF (solo para preview/imprimir en navegador si lo deseas).
- **Estado / Data fetching**
  - `@tanstack/react-query` para consumir endpoints de resguardos.
- **Selección de inventarios y usuario**
  - Componentes ya existentes (buscador de inventarios, buscador de usuarios) o nuevos basados en tus tablas.

### Backend (Node + Express + Prisma + MySQL)

- **Generación de PDF**
  - Opción recomendada: `pdf-lib`
    - Cargar el PDF corporativo (`resguardo_ti.pdf`) como PLANTILLA.
    - Escribir texto en coordenadas específicas (Nombre, Número, Área de Adscripción, tabla de equipos, comentarios, firmas).
    - Insertar imágenes PNG de las firmas (base64 → bytes).
- **Correo**
  - `nodemailer` usando:
    - O bien un SMTP corporativo sin contraseña (relay que sólo requiere IP autorizada).
    - O bien un SMTP como Gmail usando *contraseña de aplicación* (NO la contraseña normal).
- **Almacenamiento de archivos**
  - Reutilizar tu lógica actual de subida/guardado de archivos en servidor (`/uploads` o similar).
  - Guardar resguardos como tipo de archivo especial (ej. modelo `ProjectDocument`/`File`, o uno nuevo).
- **Fechas / formateo**
  - `date-fns` o `dayjs` para formato `dd/mm/aaaa`.

---

## 3. Cambios de Base de Datos (Prisma)

### 3.1. Modelo `User` – campos adicionales

Agregar campos para que el sistema pueda autocompletar los datos del empleado:

- `employeeNumber: String?` – Número de empleado.
- `jobTitle: String?` – Puesto / cargo.
- `department: String?` – Área de Adscripción.
- Opcional: `isActive: Boolean @default(true)` (si no lo tienes ya) para controlar usuarios “inactivos” que solo se usan para resguardos.

### 3.2. Modelo de Resguardo

```prisma
model CustodyRecord {
  id            String   @id @default(uuid())
  code          String   @unique          // opcional: folio interno de resguardo
  date          DateTime
  receiverId    String
  receiver      User     @relation("CustodyReceiver", fields: [receiverId], references: [id])
  delivererId   String
  deliverer     User     @relation("CustodyDeliverer", fields: [delivererId], references: [id])

  comments      String?  // “Comentarios” del formato
  fileId        String?  // referencia al PDF en tu tabla de archivos
  file          File?    @relation(fields: [fileId], references: [id])

  items         CustodyItem[]
  enabled       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 3.3. Detalle por inventario (tabla de “Datos del Equipo”)

```prisma
model CustodyItem {
  id              String   @id @default(uuid())
  custodyRecordId String
  custodyRecord   CustodyRecord @relation(fields: [custodyRecordId], references: [id])

  inventoryId     String
  inventory       Inventory @relation(fields: [inventoryId], references: [id])

  // Campos para la tabla del PDF (pueden sobreescribir los del inventario)
  typeBrand      String   // Tipo / Marca
  model          String
  serialNumber   String?
  assetNumber    String?  // Núm. Activo
  invoiceNumber  String?
  features       String?  // Características
}
```

### 3.4. Relación con `Inventory`

```prisma
model Inventory {
  // ...
  custodyItems CustodyItem[]
}
```

---

## 4. Backend – Endpoints necesarios

### 4.1. Rutas nuevas (Express)

```txt
POST   /api/custody-records           // Crear resguardo, generar PDF y enviar correos
GET    /api/custody-records/:id       // Obtener detalle y link al PDF
GET    /api/custody-records           // (opcional) listar resguardos con filtros
GET    /api/inventories/:id/custody   // (opcional) resguardos asociados a un inventario
```

### 4.2. Payload de creación (`POST /api/custody-records`)

```json
{
  "date": "2025-11-30",
  "receiver": {
    "userId": "uuid-o-null",
    "employeeNumber": "12345",
    "name": "Juan Pérez",
    "jobTitle": "Analista de Soporte",
    "department": "Área de Adscripción X",
    "isNewInactiveUser": true
  },
  "delivererUserId": "uuid-del-que-entrega",
  "comments": "Laptop con cargador original.",
  "items": [
    {
      "inventoryId": "inv-uuid-1",
      "typeBrand": "Laptop / Dell",
      "model": "Latitude 5420",
      "serialNumber": "SN123",
      "assetNumber": "ACT-001",
      "invoiceNumber": "FAC-123",
      "features": "16GB RAM, 512GB SSD"
    }
  ],
  "signatures": {
    "receiver": "data:image/png;base64,....",
    "deliverer": "data:image/png;base64,...."
  }
}
```

### 4.3. Lógica del controlador

1. **Resolver usuario receptor**  
   - Si viene `userId`: cargar usuario existente.
   - Si viene bandera `isNewInactiveUser`: crear nuevo `User` con `isActive = false`, guardando `employeeNumber`, `jobTitle`, `department`, `name`, email, etc.

2. **Validar inventarios**  
   - Comprobar que los `inventoryId` existen y están `enabled = true`.

3. **Crear registro en DB**  
   - Crear `CustodyRecord`.
   - Crear `CustodyItem` por cada inventario.

4. **Generar PDF**
   - Cargar plantilla `resguardo_ti.pdf` desde disco (ej. `assets/templates/resguardo_ti.pdf`).
   - Usar `pdf-lib`:
     - `PDFDocument.load(templateBytes)`
     - Obtener página 0.
     - Escribir:
       - Fecha en el campo `Fecha dd/mm/aaaa`.
       - Datos del empleado: Nombre, Número, Área de Adscripción.
       - Filas de la tabla “Datos del Equipo” (coordenadas precalculadas para cada celda).
       - Comentarios en el bloque de comentarios (ajustar texto multi-línea).
       - Texto legal ya viene en la plantilla (no modificar).
       - Firmas: convertir los `dataURL` a imagen PNG e insertarlos en las zonas de “Recibí equipo” y “Entrega”.
   - Guardar el PDF generado en `/uploads/resguardos/{id}.pdf`.

5. **Guardar referencia al archivo**
   - Crear registro en tu tabla `File` o `ProjectDocument` (tipo `CUSTODY_RECORD`).
   - Actualizar `CustodyRecord.fileId`.
   - Opcional: asociar el archivo a cada `Inventory` también, si tienes tabla de relación `InventoryFile`.

6. **Enviar correos**
   - Usar `nodemailer`:
     - Destinatario: correo del empleado receptor.
     - CC: correo(s) de distribución obligatoria (leer de `.env`).
     - Asunto: `Resguardo de equipo tecnológico – Folio XXX`.
     - Cuerpo: resumen de equipos + texto legal corto.
     - Adjuntar PDF generado.

7. **Respuesta al frontend**
   - JSON con:
     - `id` del resguardo.
     - URL del PDF.
     - Datos del receptor, deliverer e items.

---

## 5. Frontend – Flujos y pantallas

### 5.1. Vista `/resguardo/nuevo` o `/custody/new`

Componentes principales:

1. **Selector de empleado receptor**
   - Buscador por nombre / número de empleado / correo.
   - Mostrar tarjeta con datos si existe.
   - Botón “Registrar receptor nuevo (inactivo)” → abre mini formulario:
     - Nombre completo.
     - Correo.
     - Número de empleado.
     - Área de Adscripción.
     - Puesto.
     - `isActive = false`.

2. **Selector de inventarios**
   - Reutilizar buscador de inventarios (por tipo, serie, modelo, etc.).
   - Lista seleccionada con:
     - Tipo/Marca.
     - Modelo.
     - Serie.
     - Núm. Activo.
     - Factura.
     - Campo editable “Características” (input texto / textarea pequeña).

3. **Campos generales**
   - Fecha (por defecto hoy).
   - Comentarios (textarea grande para la sección “Comentarios”).

4. **Selección de quien entrega**
   - Dropdown de usuarios activos con rol permitido (Soporte TI / almacén).
   - Opcional: selector para usar firma digital almacenada o capturar en el momento.

5. **Captura de firmas**
   - Dos componentes basados en `react-signature-canvas`:
     - **Firma receptor**: obligatorio para poder generar el PDF.
       - No se guarda en DB como entidad aparte; solo se envía al backend junto con la petición.
     - **Firma quien entrega**:
       - Puede venir de:
         - Firma existente del usuario (si decides almacenar una imagen fija).
         - O un canvas nuevo.
   - Botones “Borrar firma” en cada canvas.

6. **Resumen / preview**
   - Opcional: renderizar una vista HTML que se parezca al formato final antes de enviar.
   - Mostrar lista de equipos y comentarios.

7. **Botones de acción**
   - “Guardar y generar resguardo” → llama `POST /api/custody-records`.
   - Deshabilitar mientras se envía (`isLoading`).
   - Al éxito:
     - Mostrar enlace “Ver PDF”.
     - Mostrar botón “Ver en inventarios” que lleve a la lista donde ya están asociados.

### 5.2. Integración con vista de inventarios

- En detalle de un inventario:
  - Sección “Resguardos” que liste los resguardos donde aparece.
  - Columna con:
    - Fecha.
    - Nombre del empleado.
    - Link al PDF.

---

## 6. Reglas de negocio

1. **Firma del receptor**
   - Debe capturarse en cada resguardo.
   - No se almacena como entidad separada en DB; solo se incrusta en el PDF.
   - En la práctica queda dentro del PDF que sí se almacena como archivo.

2. **Firma del entregador**
   - Puede reutilizarse de una imagen fija asociada al usuario o capturarse cada vez.
   - La firma sí puede guardarse en una tabla `UserImage` o similar para reuso.

3. **Resguardo vs número de equipos**
   - El formato actual muestra espacio para 4 filas de equipo.
   - Decisión pendiente:
     - **Opción A:** limitar un resguardo a máx. 4 equipos.
     - **Opción B:** permitir más equipos y:
       - Generar varias páginas (duplicando tabla en página 2, 3, etc.).
       - O agrupar equipos en varios resguardos (ej. por tipo).

4. **Estado de inventarios**
   - Al generar un resguardo, opcionalmente actualizar el campo `status` / `condition` del inventario (ej. “Asignado en resguardo”).
   - Definir si se permite que un inventario esté en más de un resguardo activo.

5. **Permisos**
   - Solo usuarios con rol de TI / almacén pueden crear resguardos.
   - Los empleados receptores pueden visualizar sus propios resguardos desde un detalle (versión futura).

---

## 7. Configuración de correos y restricciones (Gmail / SMTP)

### 7.1. Variables de entorno

Agregar a `.env` de backend (nombre de ejemplo):

```env
SMTP_HOST=smtp.servidor.com
SMTP_PORT=587
SMTP_USER=usuario@servidor.com
SMTP_PASS=contraseña_o_app_password
SMTP_REQUIRE_AUTH=true           # true = usa usuario/contraseña, false = relay sin password
CUSTODY_FROM="Resguardo TI <no-reply@empresa.com>"
CUSTODY_DIST_LIST="inventarios@empresa.com,ti@empresa.com"
```

### 7.2. Caso Gmail

Si se usa Gmail / Google Workspace:

- NO se puede usar la contraseña normal de la cuenta.
- Requisitos:
  1) Activar 2FA en la cuenta.
  2) Crear una **contraseña de aplicación** para “Mail”.
  3) Poner esa contraseña de aplicación en `SMTP_PASS`.
- El login será entonces usuario + *app password* leídos desde `.env` y no la contraseña personal.

### 7.3. Caso servidor sin contraseña (relay por IP)

Si tu servidor ya está autorizado para enviar correo sin autenticación (ej. Postfix interno o relay que solo confía en la IP del VPS):

- Puedes configurar:

```env
SMTP_HOST=mail.interno.local
SMTP_PORT=25
SMTP_REQUIRE_AUTH=false
SMTP_USER=
SMTP_PASS=
```

- En el servicio de correo (`emailService`), antes de crear el `transporter` de `nodemailer`:

```ts
const transporter = nodemailer.createTransport(
  process.env.SMTP_REQUIRE_AUTH === "false"
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 25),
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
);
```

De esta forma:
- Puedes trabajar con un SMTP que **no requiere contraseña** (modo relay).
- O con Gmail/otro SMTP que sí la requiere, siempre a través de variables `.env`.

---

## 8. Tareas pendientes (checklist)

### Backend

- [ ] Agregar campos `employeeNumber`, `jobTitle`, `department`, `isActive` (si falta) al modelo `User`.
- [ ] Crear modelos `CustodyRecord` y `CustodyItem` (y relaciones con `Inventory` y `File`).
- [ ] Ejecutar migración Prisma.
- [ ] Definir ubicación del archivo plantilla `resguardo_ti.pdf` en el proyecto.
- [ ] Implementar servicio de generación de PDF con `pdf-lib`:
  - [ ] Medir y documentar coordenadas exactas de cada campo.
  - [ ] Soporte para varias filas de equipos.
  - [ ] Incrustar imágenes PNG de firmas.
- [ ] Implementar endpoints:
  - [ ] `POST /api/custody-records`.
  - [ ] `GET /api/custody-records/:id`.
  - [ ] Endpoints opcionales de listado.
- [ ] Integrar con sistema de archivos:
  - [ ] Guardar PDF en carpeta de uploads.
  - [ ] Crear registro en tabla `File` u otro modelo.
- [ ] Integrar con `nodemailer` y variables de entorno de correo.
- [ ] Probar flujo completo vía Postman (incluyendo envío de firmas base64 y prueba en los dos modos de SMTP: con y sin auth).

### Frontend

- [ ] Crear ruta `/resguardos` y `/resguardos/nuevo`.
- [ ] Implementar formulario de creación con Formik + React Query.
- [ ] Implementar buscador/selector de empleado receptor.
- [ ] Implementar alta rápida de usuario receptor “inactivo”.
- [ ] Implementar buscador/selector de inventarios y tabla editable de características.
- [ ] Implementar captura de firmas con `react-signature-canvas`.
- [ ] Implementar selección de usuario que entrega.
- [ ] Integrar llamada a `POST /api/custody-records` incluyendo imágenes de las firmas.
- [ ] Mostrar resultado con link de descarga del PDF.
- [ ] Agregar sección de “Resguardos” en detalle de inventario.

### Documentación / UX

- [ ] Documentar quién puede crear resguardos (roles).
- [ ] Definir política sobre número máximo de equipos por resguardo (4 por hoja vs multipágina).
- [ ] Validar con jurídico si el PDF generado digitalmente cumple con requisitos internos (firma, almacenamiento, etc.).
- [ ] Redactar texto de correo de notificación de resguardo.

---

## 9. Decisiones abiertas a resolver antes de codear

1. ¿Límite de equipos por resguardo (4) o permitir multipágina?
2. ¿Se requiere folio único de resguardo (ej. `GAPTI-F-018-2025-0001`)?
3. ¿Firma del que entrega se guarda como imagen fija por usuario o siempre se captura?
4. ¿El receptor podrá consultar sus resguardos desde un portal propio en el futuro?
5. ¿Qué ocurre cuando un equipo se devuelve? (¿Nuevo formato, baja del resguardo, historial?)
