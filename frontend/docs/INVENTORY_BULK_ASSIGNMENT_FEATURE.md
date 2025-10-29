# Feature: Asignación Masiva de Inventarios

## Descripción

Sistema de selección múltiple de inventarios con persistencia en localStorage que permite asignar facturas u órdenes de compra a múltiples inventarios de manera simultánea.

## Componentes Creados

### 1. **InventorySelectionContext** (`frontend/src/context/InventorySelectionContext.jsx`)

- Contexto para manejar el estado global de los inventarios seleccionados

### 2. **InventorySelectionProvider** (`frontend/src/context/InventorySelectionProvider.jsx`)

- Provider que envuelve la aplicación y provee funcionalidad de selección
- Persiste en localStorage con la clave `selected_inventories`
- **Métodos disponibles:**
  - `toggleInventory(inventory)` - Agregar/quitar un inventario
  - `isSelected(inventoryId)` - Verificar si está seleccionado
  - `clearSelection()` - Limpiar todas las selecciones
  - `addMultipleInventories(inventories)` - Agregar varios inventarios
  - `removeMultipleInventories(inventoryIds)` - Remover varios inventarios
  - `openCart()`, `closeCart()`, `toggleCart()` - Controlar el modal

### 3. **FloatingInventoryCart** (`frontend/src/components/FloatingInventoryCart/FloatingInventoryCart.jsx`)

- Botón flotante en la esquina inferior derecha
- Muestra el contador de inventarios seleccionados
- Solo visible cuando hay inventarios seleccionados
- Al hacer clic, abre el modal de asignación

### 4. **InventoryAssignmentModal** (`frontend/src/components/InventoryAssignment/InventoryAssignmentModal.jsx`)

- Modal lateral (SideModal) para asignación masiva
- **Características:**
  - Tabs para elegir entre Factura u Orden de Compra
  - Selector searchable de facturas/órdenes de compra
  - Validación automática de inventarios ya asignados
  - Clasificación visual en 3 categorías:
    - ✅ **Disponibles**: Pueden ser asignados
    - ℹ️ **Ya Asignados**: Ya tienen la factura/orden seleccionada
    - ⚠️ **No Disponibles**: Ya tienen otra factura/orden asignada
  - Botón "Limpiar Todo" para resetear la selección
  - Persistencia de selección entre navegaciones

## Modificaciones a Componentes Existentes

### 1. **AppProvider** (`frontend/src/context/AppProvider.jsx`)

- Se agregó el `InventorySelectionProvider` al árbol de contextos

### 2. **MainLayout** (`frontend/src/Layout/MainLayout.jsx`)

- Se agregaron los componentes:
  - `<FloatingInventoryCart />`
  - `<InventoryAssignmentModal />`

### 3. **InventoriesPage** (`frontend/src/pages/inventories/InventoriesPage.jsx`)

- Se importó `useInventorySelection` hook
- Se agregó columna de checkboxes al inicio de la tabla
- Checkboxes integrados con el sistema de selección global

### 4. **api.js** (`frontend/src/services/api.js`)

- Se agregaron dos nuevos servicios:
  - `assignInventoriesToInvoice({ invoiceId, inventoryIds })`
  - `assignInventoriesToPurchaseOrder({ purchaseOrderId, inventoryIds })`

## Flujo de Uso

1. **Selección de Inventarios:**

   - El usuario navega a la página de inventarios
   - Hace clic en los checkboxes de los inventarios deseados
   - La selección se guarda automáticamente en localStorage
   - Aparece el botón flotante con el contador

2. **Apertura del Modal:**

   - Click en el botón flotante
   - Se abre el modal lateral con los inventarios seleccionados

3. **Asignación:**

   - Elegir tab (Factura o Orden de Compra)
   - Buscar y seleccionar la factura/orden de compra
   - El sistema valida automáticamente qué inventarios pueden asignarse
   - Click en "Asignar Factura" o "Asignar Orden de Compra"
   - Los inventarios disponibles se asignan
   - La selección persiste para poder asignar a otra entidad

4. **Limpieza:**
   - Click en "Limpiar Todo" para resetear toda la selección
   - O deseleccionar individualmente desde los checkboxes

## Persistencia

- Los inventarios seleccionados persisten en `localStorage` bajo la clave `selected_inventories`
- La selección se mantiene aunque:
  - Se recargue la página
  - Se navegue a otras vistas
  - Se cierre y abra el navegador

## Validaciones

### Frontend:

- Verifica que se haya seleccionado una factura/orden antes de asignar
- Muestra visualmente qué inventarios ya tienen asignaciones
- Deshabilita el botón de asignar si no hay inventarios disponibles

### Backend:

- **Para Facturas** (`assignInventoriesToInvoice`):
  - Valida que los inventarios no estén asignados a otra factura
  - Retorna error con la lista de conflictos si los hay
- **Para Órdenes de Compra** (`assignInventoriesToPurchaseOrder`):
  - Actualiza masivamente los inventarios
  - Retorna el conteo de inventarios asignados

## Endpoints del Backend

### Facturas

```
POST /api/invoices/:invoiceId/inventories
Body: { inventoryIds: string[] }
```

### Órdenes de Compra

```
POST /api/purchase-orders/:orderId/inventories
Body: { inventoryIds: string[] }
```

## Dependencias

### Nuevas:

- Ninguna (solo usa dependencias existentes)

### Existentes utilizadas:

- `framer-motion` - Animaciones del botón flotante
- `flowbite-react` - Componentes UI (Checkbox, Label, etc.)
- `formik` - Manejo de formularios
- `react-select` - Selectores searchables
- `react-icons` - Iconografía

## Colores y Estilos

- **Botón Flotante**: Purple (600/700)
- **Disponibles**: Green (50/200/600)
- **Ya Asignados**: Blue (50/200/600)
- **No Disponibles**: Red (50/200/600)
- **Contador Badge**: Red (500) con borde blanco

## Hooks Personalizados

### `useInventorySelection()`

```javascript
const {
  selectedInventories, // Array de inventarios seleccionados
  isCartOpen, // Estado del modal
  toggleInventory, // Función para toggle
  isSelected, // Verificar si está seleccionado
  clearSelection, // Limpiar todo
  addMultipleInventories, // Agregar varios
  removeMultipleInventories, // Remover varios
  openCart, // Abrir modal
  closeCart, // Cerrar modal
  toggleCart, // Toggle modal
  count, // Cantidad seleccionada
} = useInventorySelection();
```

## Mejoras Futuras

1. Agregar opción de "Seleccionar todos" en la página actual
2. Permitir buscar inventarios dentro del modal
3. Agregar filtros en el modal por estado de disponibilidad
4. Implementar desasignación masiva
5. Agregar preview de la factura/orden seleccionada
6. Notificación persistente del progreso de asignación
7. Exportar lista de inventarios seleccionados

## Testing

Para probar la funcionalidad:

1. Ve a `/inventories`
2. Selecciona varios inventarios usando los checkboxes
3. Observa el botón flotante aparecer
4. Haz clic en el botón flotante
5. Selecciona una factura o orden de compra
6. Observa la clasificación automática
7. Asigna los inventarios disponibles
8. Recarga la página y verifica que la selección persista
9. Prueba limpiar la selección

## Archivos Modificados/Creados

### Creados (7):

1. `frontend/src/context/InventorySelectionContext.jsx`
2. `frontend/src/context/InventorySelectionProvider.jsx`
3. `frontend/src/components/FloatingInventoryCart/FloatingInventoryCart.jsx`
4. `frontend/src/components/InventoryAssignment/InventoryAssignmentModal.jsx`

### Modificados (4):

1. `frontend/src/context/AppProvider.jsx`
2. `frontend/src/Layout/MainLayout.jsx`
3. `frontend/src/pages/inventories/InventoriesPage.jsx`
4. `frontend/src/services/api.js`

**Total: 11 archivos**
