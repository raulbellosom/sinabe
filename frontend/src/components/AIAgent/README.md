# Módulo Agente de IA - Sinabe

## Descripción

El módulo Agente de IA proporciona una interfaz inteligente para buscar inventarios utilizando lenguaje natural o números de serie. Está integrado con un servicio de IA que combina búsqueda semántica, por palabras clave y fuzzy matching.

## Características

- 🔍 **Búsqueda Inteligente**: Busca inventarios usando lenguaje natural ("laptop HP con status alta")
- 🏷️ **Búsqueda por Serial**: Encuentra inventarios por número de serie exacto o aproximado
- 🤖 **Ficha Técnica IA**: Genera especificaciones técnicas automáticamente usando IA
- 🎯 **Navegación Directa**: Acceso directo a la página de detalle del inventario
- ⚡ **Acceso Global**: Disponible desde cualquier página mediante botón en navbar
- 🎨 **UI/UX Moderna**: Interfaz limpia con indicadores de estado y carga
- 📱 **Responsivo**: Funciona correctamente en dispositivos móviles y desktop

## Estructura del Módulo

```
src/
├── components/AIAgent/
│   ├── AIAgentButton.jsx      # Botón para activar el modal
│   ├── AIAgentModal.jsx       # Modal principal del agente
│   ├── AIResultCard.jsx       # Tarjeta de resultado de búsqueda
│   ├── AIModelSpecs.jsx       # Componente para mostrar specs IA
│   └── index.js               # Exportador de componentes
├── context/
│   └── AIAgentContext.js      # Contexto global del agente
├── hooks/
│   └── useAIAgent.js          # Hook personalizado para operaciones
└── services/
    └── ai.api.js              # Servicio API del agente de IA
```

## Instalación y Configuración

### 1. Variables de Entorno

Asegúrate de tener configurada la URL del servicio de IA en tu archivo `.env`:

```env
VITE_AI_URL=https://sinabe.giize.com/ai/
```

### 2. Integración en la App

El módulo ya está integrado automáticamente en:

- **AppProvider**: El `AIAgentProvider` está incluido en el contexto global
- **App.jsx**: El `AIAgentModal` está montado globalmente
- **Navbar**: El `AIAgentButton` está disponible en la barra de navegación

## Uso

### Activar el Agente

1. Haz clic en el botón de IA (⭐) en la barra de navegación
2. Se abrirá el modal del agente de IA

### Tipos de Búsqueda

#### Búsqueda Inteligente (Lenguaje Natural)

```
Ejemplos:
- "laptop HP con status alta"
- "computadora Dell en bodega satélite"
- "equipos de la marca Apple"
- "proveedor ITISA"
- "orden de compra PVR-OC-0005113"
```

#### Búsqueda por Serial

```
Ejemplos:
- "MXL43329WW" (búsqueda exacta)
- "MXL43329WQ" (sugerirá seriales similares si no existe)
```

### Acciones Disponibles

- **Ver Inventario**: Abre la página de detalle del inventario en nueva pestaña
- **Ficha Técnica**: Genera especificaciones técnicas usando IA
- **Sugerencias**: Para seriales no encontrados, muestra opciones similares

## API del Servicio

El módulo utiliza los siguientes endpoints:

- `POST /search/hybrid` - Búsqueda principal (híbrida)
- `POST /models/specs` - Generación de ficha técnica
- `GET /health` - Estado del servicio
- `GET /config` - Configuración del servicio

Ver `docs/sinabe-ai-endpoints.md` para documentación completa de la API.

## Componentes

### AIAgentButton

Botón que activa el modal del agente. Muestra estado del servicio:

- 🟢 Verde: Servicio disponible
- 🟡 Amarillo: Procesando
- 🔴 Rojo: Servicio no disponible

### AIAgentModal

Modal principal con:

- Campo de búsqueda con placeholder dinámico
- Indicador de tipo de búsqueda
- Resultados con tarjetas interactivas
- Manejo de errores y estados de carga

### AIResultCard

Tarjeta de resultado que muestra:

- Información básica del inventario
- Score de relevancia (para búsquedas IA)
- Status con código de colores
- Información de compra y ubicación
- Botones de acción

### AIModelSpecs

Componente para mostrar especificaciones técnicas generadas por IA:

- Información del equipo
- Especificaciones estimadas
- Disclaimers sobre precisión
- Interfaz modal independiente

## Estados y Contexto

### Estado Global (AIAgentContext)

```javascript
{
  isModalOpen: false,      // Estado del modal
  isLoading: false,        // Cargando
  query: '',              // Consulta actual
  searchResults: null,     // Resultados de búsqueda
  searchMode: null,        // Modo: 'hybrid', 'serial-exact', 'serial-fuzzy'
  selectedItem: null,      // Item seleccionado
  modelSpecs: null,        // Especificaciones IA
  error: null,            // Error actual
  suggestions: [],         // Sugerencias de serials
  isHealthy: false,       // Estado del servicio
  config: null            // Configuración del servicio
}
```

### Hook useAIAgentOperations

Proporciona métodos optimizados:

- `handleSearch()` - Ejecutar búsqueda
- `handleItemSelect()` - Seleccionar item
- `handleGetSpecs()` - Obtener especificaciones
- `navigateToInventory()` - Navegar a inventario
- Utilidades de formato y validación

## Manejo de Errores

- **Timeouts**: 5 minutos de timeout para operaciones IA
- **Servicio no disponible**: Botón deshabilitado y mensajes informativos
- **Errores de búsqueda**: Alertas contextuales con detalles
- **Reconexión automática**: Verificación periódica del estado del servicio

## Rendimiento

- **Búsquedas optimizadas**: Debounce y validación de entrada
- **Lazy loading**: Componentes se cargan bajo demanda
- **Cache inteligente**: Resultados temporales en contexto
- **Timeouts configurables**: Prevención de bloqueos

## Personalización

### Estilos

Los estilos se pueden personalizar modificando:

- Clases Tailwind en componentes
- CSS personalizado en `index.css` (sección AI Agent Modal)
- Colores y temas via Flowbite

### Comportamiento

- Timeout de búsqueda: Modificar en `ai.api.js`
- Validación de serials: Ajustar regex en `useAIAgent.js`
- Navegación: Personalizar `navigateToInventory()` en el hook

## Troubleshooting

### Servicio no disponible

- Verificar URL en `.env`
- Confirmar que el servicio IA esté corriendo
- Revisar logs de red en DevTools

### Búsquedas lentas

- Normal, el servicio puede tardar 30+ segundos
- El modelo de IA es pequeño y el servidor es lento
- Se muestra indicador de progreso automáticamente

### Errores de navegación

- Verificar que las rutas de inventario existan
- Confirmar que el ID del inventario sea válido
- Revisar permisos de usuario

## Desarrollo Futuro

- [ ] Cache persistente de resultados
- [ ] Búsqueda por comandos de voz
- [ ] Integración con chat conversacional
- [ ] Análisis de patrones de búsqueda
- [ ] Sugerencias predictivas
- [ ] Modo offline básico
