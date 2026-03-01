# Migración Tailwind 4.1

## Checklist
- [x] Actualizar dependencias Tailwind a 4.1.
- [x] Usar plugin oficial `@tailwindcss/vite`.
- [x] Migrar `index.css` a `@import "tailwindcss"`.
- [x] Definir tokens semánticos por CSS variables.
- [x] Configurar variante `dark` por clase global.
- [x] Retirar plugin Flowbite de Tailwind.
- [ ] Revisar visual de todos los módulos en dark/light.
- [ ] Limpiar clases utilitarias obsoletas o conflictivas.

## Riesgos
- Componentes legacy dependían de estilos Flowbite implícitos.
- Cambios de tokens pueden afectar contraste en formularios/tablas.

## Mitigaciones
- Capa de compatibilidad temporal para componentes Flowbite.
- Pruebas manuales por módulo antes de retirar compatibilidad.
