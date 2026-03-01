# UI Guide - SINABE

## Principios
- Mobile-first
- Componentes consistentes
- Estados claros (loading, empty, error)
- Accesibilidad: foco visible, teclado, labels

## Tokens semánticos
- `--background`
- `--foreground`
- `--surface`
- `--surface-muted`
- `--border`
- `--primary`
- `--primary-foreground`
- `--danger`
- `--warning`
- `--success`

## Patrones de layout
- Header fijo con acciones rápidas.
- Sidebar desktop + navegación compacta móvil.
- Contenido con ancho máximo y padding responsive.

## Componentes base
- Button: `primary | secondary | danger | ghost`
- Inputs: `Input`, `Textarea`, `Select`, `Combobox`
- Feedback: `Badge`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`
- Superficies: `Card`, `Modal`
- Datos: `ResponsiveDataView`, `Pagination`, `SearchBar`
- Acciones críticas: `ConfirmDialog`

## Reglas de interacción
- Todas las acciones con estados disabled/loading.
- Confirmación para borrado y operaciones destructivas.
- Debounce de búsqueda 300-500ms.

## Dark mode
- Modo: `light | dark | system`.
- Persistencia local + backend.
- Contraste mínimo AA en texto interactivo.
