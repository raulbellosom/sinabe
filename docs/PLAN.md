# PLAN - SINABE Frontend Redesign

## 1. Estado actual detectado

### Stack real
- Frontend: React 18 + Vite 6 + Tailwind 3 + React Query 5 + PWA + Capacitor Android.
- Backend: Express + Prisma + MySQL + Multer + Sharp + notificaciones (in-app/email/push).

### Rutas y módulos activos
- Dashboard
- Agenda
- Inventarios (lista, crear, editar, detalle, bajas)
- Custodias / resguardos (incluye ruta pública por token)
- Catálogos (modelos, marcas, tipos, condiciones, ubicaciones, campos)
- Usuarios / roles
- Verticales
- Órdenes de compra / facturas
- Preferencias
- Notificaciones y reglas
- Auditoría
- Projects y Deadlines existen en código pero quedan fuera del alcance de rediseño.

### Deuda técnica principal
- Uso extendido de `flowbite-react`.
- Uso extendido de `react-icons`.
- Múltiples clientes axios duplicados y `VITE_API_URL` en varios servicios.
- URLs hardcodeadas (`sinabe.sytes.net`, `sinabe.giize.com`).
- Sin i18n operativo real (texto español hardcodeado).

## 2. Objetivo de implementación

1. Migrar a Tailwind 4.1 con tokens semánticos y dark mode real.
2. Eliminar dependencia activa de `flowbite-react` (compatibilidad temporal por alias a componentes propios).
3. Migrar iconografía a `lucide-react` (compatibilidad temporal por alias de `react-icons/*`).
4. Centralizar API en `src/lib/api/*` con `VITE_API_BASE_URL`.
5. Implementar `ThemeProvider` y `ThemeToggle` con persistencia local + backend (UserPreference).
6. Rediseñar shell responsive y excluir Projects/Deadlines de navegación y rutas activas.
7. Establecer componentes base UI y utilitarios para tablas/listas/formularios móviles.

## 3. Fases ejecutables

### Fase 1 - Infra base
- Tailwind 4.1 + CSS tokens.
- `src/config/env.js`.
- `src/lib/api/client.js` + `http.js` + `errors.js`.
- `ThemeProvider` + `ThemeToggle`.
- `sonner` para toasts.

### Fase 2 - Shell y navegación
- Layout mobile-first con topbar y sidebar responsive.
- Eliminación de rutas visibles `projects` y `deadlines`.

### Fase 3 - UI foundation
- `src/components/ui/*` mínimo viable.
- `ResponsiveDataView` y `ImageCaptureField` como base transversal.

### Fase 4 - Módulos
- Inventarios
- Custodias
- Catálogos
- Notificaciones
- Usuarios/roles
- Restantes activos

### Fase 5 - QA / limpieza
- Build y validaciones.
- Remoción de CSS/imports legacy.
- `react-doctor` final.

## 4. Cambios backend mínimos permitidos
- Solo endpoints tocados por frontend migrado.
- Contrato de listados: `{ data, meta }`.
- Contrato de errores consistente.
- `preferences.theme` en `UserPreference`.

## 5. Criterios de aceptación técnicos
- `npm run dev` y `npm run build` sin errores.
- Dark mode consistente.
- Sin dependencia activa de `flowbite-react` / `react-icons`.
- Sin hardcodes de dominio de API.
