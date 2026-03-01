# PWA + Capacitor Notes

## PWA
- Se mantiene `vite-plugin-pwa` con `injectManifest` y SW custom.
- Validar offline mínimo en rutas base y assets críticos.
- Validar actualización automática de SW.

## Cámara (web + Android)
- Web: `<input type="file" accept="image/*" capture="environment">`.
- Android Capacitor: `@capacitor/camera` con fallback a input file.
- Manejar estados: permisos denegados, cancelación, errores de lectura.

## Notificaciones
- In-app: badge y centro de notificaciones.
- Push: conservar suscripción y sync del service worker.
- Correo: frontend solo consume estado/acciones de reglas.

## Consideraciones Android
- Verificar permisos de cámara en manifest y runtime.
- Confirmar que el flujo funciona en build release y debug.
