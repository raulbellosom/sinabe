# Sistema de Notificaciones SINABE

## Descripción General

El sistema de notificaciones de SINABE automatiza la detección y notificación de situaciones importantes relacionadas con el inventario, replicando y mejorando la funcionalidad del script bash original.

## Características Principales

### 🔔 Notificaciones en la Aplicación

- Notificaciones in-app para usuarios
- Sistema de leído/no leído
- Estadísticas de notificaciones
- Eliminación de notificaciones

### 📧 Sistema de Correos Electrónicos

- Integración con `msmtp` (ya configurado en producción)
- Correos HTML con tablas formateadas
- Envío a múltiples destinatarios según el contexto
- Sistema de logging de correos

### 🕐 Automatización

- Cronjobs para análisis periódicos
- Reporte diario de inventarios nuevos
- Análisis semanal de inventarios problemáticos

## Escenarios de Notificación

### 1. Inventarios Nuevos Sin Asignar (>2 meses)

- **Criterio**: `status = ALTA`, condición "nuevo"/"sin usar", sin `InventoryDeadline`, recepción >2 meses
- **Destinatarios**: Usuarios con roles de administrador
- **Frecuencia**: Análisis semanal

### 2. Inventarios Sin Uso Prolongado (>6 meses)

- **Criterio**: `status = ALTA`, sin asignación a deadline, sin condición "En uso", >6 meses
- **Destinatarios**: Usuarios con permisos de inventario
- **Frecuencia**: Análisis semanal

### 3. Inventarios en Deadline Sin Uso (>7 días)

- **Criterio**: Asignados a deadline pero sin condición "En uso" después de 7 días
- **Destinatarios**: Usuarios asignados a los proyectos correspondientes
- **Frecuencia**: Análisis semanal

### 4. Reporte Diario de Equipos Nuevos

- **Criterio**: Inventarios creados el día anterior con `receptionDate` válida
- **Destinatarios**: Lista fija de correos (similar al script bash original)
- **Frecuencia**: Diario a las 7:00 AM

## API Endpoints

### Notificaciones

```
GET    /api/notifications/user/:userId              # Obtener notificaciones del usuario
GET    /api/notifications/user/:userId/stats        # Estadísticas de notificaciones
PATCH  /api/notifications/:notificationId/read     # Marcar como leída
PATCH  /api/notifications/user/:userId/read-all    # Marcar todas como leídas
DELETE /api/notifications/:notificationId          # Eliminar notificación
POST   /api/notifications/analyze                  # Análisis manual (testing)
```

### Cronjobs

```
POST   /api/cron/daily-report                      # Reporte diario
POST   /api/cron/weekly-analysis                   # Análisis semanal
GET    /api/cron/status                            # Status del sistema
POST   /api/cron/test-email                        # Prueba de correos
```

## Configuración

### Variables de Entorno Requeridas

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
APP_URL=https://sinabe.giize.com
```

### Configuración de msmtp

El sistema asume que `msmtp` ya está configurado en el servidor (como mencionaste que ya lo tienes).

### Cronjobs

Ejecutar el script de configuración:

```bash
chmod +x backend/scripts/setup-cronjobs.sh
./backend/scripts/setup-cronjobs.sh
```

## Estructura de Base de Datos

### Modelo Notification (ya existe en Prisma)

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  body      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  metadata  Json?
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

## Archivos Implementados

### Controladores

- `src/controllers/notificationController.js` - Lógica de notificaciones y análisis
- `src/controllers/cronController.js` - Controladores para cronjobs

### Servicios

- `src/services/emailService.js` - Servicio de envío de correos con msmtp

### Rutas

- `src/routes/notificationRoutes.js` - Rutas de notificaciones
- `src/routes/cronRoutes.js` - Rutas de cronjobs

### Scripts

- `scripts/setup-cronjobs.sh` - Configuración automática de cronjobs

## Uso y Testing

### Prueba Manual del Reporte Diario

```bash
curl -X POST "http://localhost:4000/api/cron/daily-report?test=1"
```

### Prueba Manual del Análisis Semanal

```bash
curl -X POST "http://localhost:4000/api/cron/weekly-analysis"
```

### Verificar Status del Sistema

```bash
curl "http://localhost:4000/api/cron/status"
```

### Obtener Notificaciones de un Usuario

```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:4000/api/notifications/user/<userId>"
```

## Logs

### Log de Correos

- Ubicación: `/var/log/sinabe_notifications.log`
- Contiene: Registro de correos enviados y errores

### Log de Cronjobs

- Ubicación: `/var/log/sinabe_cron.log`
- Contiene: Salida de las ejecuciones automáticas

## Configuración de Correos

### Destinatarios por Defecto

```javascript
const EMAIL_CONFIG = {
  from: "sistemasgappvr@gmail.com",
  defaultRecipients: [
    "sistemaspvr@aeropuertosgap.com.mx",
    "sistemasgappvr@gmail.com",
  ],
  sinabeUrl: "https://sinabe.giize.com",
};
```

### Tipos de Notificaciones por Correo

1. **Reporte Diario**: Inventarios nuevos recibidos ayer
2. **Inventarios Sin Asignar**: Equipos nuevos sin asignación >2 meses
3. **Inventarios Sin Uso**: Equipos sin uso >6 meses
4. **Deadline Sin Uso**: Inventarios asignados pero no usados >7 días

## Próximos Pasos

1. **Implementar en Frontend**: Campanita de notificaciones
2. **Refinamiento**: Ajustar criterios según necesidades reales
3. **Métricas**: Dashboard de estadísticas de notificaciones
4. **Personalización**: Configuración de frecuencias por usuario
5. **Integración**: Webhooks para sistemas externos

## Consideraciones de Seguridad

- Los endpoints de cronjobs no requieren autenticación (para automatización)
- Los endpoints de notificaciones requieren token JWT
- Los correos se envían usando el sistema msmtp ya configurado
- Los logs se almacenan de forma segura en `/var/log/`
