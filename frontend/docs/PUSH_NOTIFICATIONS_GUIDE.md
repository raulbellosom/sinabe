# Guía de Push Notifications - Sinabe

## Resumen

El sistema de notificaciones push de Sinabe soporta:

- **Web Push (PWA/Chrome)**: Notificaciones nativas del navegador usando VAPID
- **Capacitor Android**: Notificaciones push usando Firebase Cloud Messaging (FCM)
- **Capacitor iOS**: Notificaciones push usando APNs (futuro)

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │  Push Services  │
│   (React)       │────▶│   (Express)     │────▶│  VAPID / FCM    │
│                 │     │                 │     │                 │
│  usePushNotif.. │     │  pushChannel.js │     │  Web Push API   │
│  push.service   │     │  pushRoutes     │     │  Firebase       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Configuración Inicial

### 1. Generar claves VAPID (Web Push)

Las claves VAPID son necesarias para autenticar tu servidor con los servicios de push.

```bash
# Opción 1: Usar script
cd backend
node scripts/generateVapidKeys.js

# Opción 2: Usar npx
npx web-push generate-vapid-keys

# Opción 3: Desde la API (requiere auth)
POST /api/push/generate-vapid-keys
```

### 2. Configurar variables de entorno (.env)

```dotenv
# Push Notifications
VAPID_PUBLIC_KEY=BNxxx...  # Tu clave pública
VAPID_PRIVATE_KEY=xxx...   # Tu clave privada
VAPID_SUBJECT=mailto:admin@tusitio.com
```

### 3. Reiniciar el servidor

```bash
npm run dev
```

Deberías ver en la consola:

```
[PushChannel] VAPID configurado correctamente
```

## Uso en Frontend

### Hook `usePushNotifications`

```jsx
import { usePushNotifications } from '../hooks/usePushNotifications';

const MyComponent = () => {
  const {
    isSupported, // ¿Soportado en este dispositivo?
    isSubscribed, // ¿Usuario suscrito?
    permission, // 'granted', 'denied', 'default'
    loading, // Estado de carga
    error, // Error si hay
    subscribe, // Función para suscribirse
    unsubscribe, // Función para cancelar
    testNotification, // Enviar notificación de prueba
  } = usePushNotifications();

  return (
    <button onClick={subscribe} disabled={loading || isSubscribed}>
      {isSubscribed ? 'Suscrito ✓' : 'Activar notificaciones'}
    </button>
  );
};
```

### Componente listo para usar

```jsx
import PushNotificationSettings from './components/notifications/PushNotificationSettings';

// Vista completa
<PushNotificationSettings />

// Vista compacta (toggle simple)
<PushNotificationSettings compact />
```

## Flujo de Suscripción

### Web Push (Chrome/Firefox/Edge)

1. Usuario hace clic en "Activar notificaciones"
2. El navegador pide permiso
3. Si acepta, se crea una suscripción PushManager
4. La suscripción se envía a `POST /api/push/subscribe`
5. Se guarda en tabla `PushSubscription`

### Capacitor Android

1. App llama a `PushNotifications.requestPermissions()`
2. Se registra para push: `PushNotifications.register()`
3. Firebase devuelve un token FCM
4. Token se envía a `POST /api/push/subscribe` con `deviceType: 'android'`
5. Se guarda en tabla `PushSubscription`

## Envío de Notificaciones

### Desde el sistema de reglas

Cuando creas una regla de notificación con canal `PUSH_WEB` o `PUSH_MOBILE`, el scheduler automáticamente envía push cuando se cumplen las condiciones.

### Envío directo (programático)

```javascript
import { sendDirectPush } from './notifications/channels/pushChannel.js';

await sendDirectPush(userId, {
  title: 'Título de la notificación',
  body: 'Contenido del mensaje',
  url: '/ruta-destino',
  data: { customKey: 'value' },
});
```

### Via API

```bash
# Enviar push a usuario específico
POST /api/push/send
Authorization: Bearer <token>
{
  "userId": "uuid-del-usuario",
  "title": "Título",
  "body": "Mensaje",
  "url": "/notifications"
}

# Enviar notificación de prueba (a ti mismo)
POST /api/push/test
Authorization: Bearer <token>
```

## Configuración para Capacitor Android

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea nuevo proyecto
3. Añade app Android con package name `com.giize.sinabe`
4. Descarga `google-services.json`

### 2. Configurar Android

```bash
# Copiar archivo de configuración
cp google-services.json frontend/android/app/

# Sincronizar Capacitor
cd frontend
npx cap sync android
```

### 3. Instalar plugin (ya hecho)

```bash
npm install @capacitor/push-notifications
npx cap sync
```

### 4. Permisos AndroidManifest.xml

El plugin añade automáticamente los permisos necesarios.

## Estructura de Base de Datos

### Tabla `PushSubscription`

| Campo      | Tipo    | Descripción             |
| ---------- | ------- | ----------------------- |
| id         | UUID    | Identificador único     |
| userId     | String  | Usuario propietario     |
| endpoint   | Text    | URL del push service    |
| keys       | JSON    | Claves p256dh y auth    |
| deviceType | String  | 'web', 'android', 'ios' |
| enabled    | Boolean | Si está activa          |

## Service Worker

El archivo `src/sw.js` maneja:

- **Evento `push`**: Muestra la notificación
- **Evento `notificationclick`**: Abre/enfoca la app
- **Caching**: Workbox para offline support

## Troubleshooting

### "VAPID keys no configuradas"

Asegúrate de tener las variables de entorno configuradas y reinicia el servidor.

### "Permiso de notificaciones denegado"

El usuario bloqueó las notificaciones. Debe:

1. Hacer clic en el candado de la barra de direcciones
2. Permitir notificaciones
3. Recargar la página

### "Service Worker no registrado"

- Verifica que estás en HTTPS (o localhost)
- Revisa la consola del navegador
- Verifica que el SW se compiló correctamente

### "Las notificaciones no llegan"

1. Verifica que el usuario está suscrito (`GET /api/push/subscriptions`)
2. Revisa los logs del servidor
3. Verifica que la suscripción no expiró (410 Gone)

## Testing

### Probar Web Push localmente

```bash
# 1. Generar VAPID keys y configurar .env
# 2. Iniciar backend
cd backend && npm run dev

# 3. Iniciar frontend
cd frontend && npm run dev

# 4. Abrir http://localhost:5173
# 5. Suscribirse a notificaciones
# 6. Llamar POST /api/push/test
```

### Probar en Android

```bash
# 1. Configurar Firebase y google-services.json
# 2. Compilar APK
cd frontend
npx cap sync android
npx cap open android
# Build > Build Bundle(s) / APK(s) > Build APK(s)

# 3. Instalar y probar
```

## Seguridad

- Las claves VAPID privadas nunca deben exponerse
- El endpoint `/generate-vapid-keys` debería deshabilitarse en producción
- Las suscripciones expiradas se deshabilitan automáticamente
- Solo usuarios autenticados pueden suscribirse

## Recursos

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [VAPID Spec](https://tools.ietf.org/html/rfc8292)
