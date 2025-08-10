#!/bin/bash

# Script para configurar cronjobs del sistema SINABE
# Este script debe ejecutarse en el servidor de producción

# Configuración
BACKEND_URL="http://localhost:4000"
LOG_DIR="/var/log"
CRON_LOG="$LOG_DIR/sinabe_cron.log"

echo "Configurando cronjobs para SINABE..."

# Crear directorio de logs si no existe
if [ ! -d "$LOG_DIR" ]; then
    sudo mkdir -p "$LOG_DIR"
fi

# Función para agregar cronjob si no existe
add_cron_if_not_exists() {
    local cron_job="$1"
    local description="$2"
    
    if ! crontab -l 2>/dev/null | grep -q "$cron_job"; then
        echo "Agregando cronjob: $description"
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
    else
        echo "Cronjob ya existe: $description"
    fi
}

# 1. Reporte diario a las 7:00 AM (inventarios nuevos del día anterior)
DAILY_CRON="0 7 * * * curl -X POST '$BACKEND_URL/api/cron/daily-report' >> '$CRON_LOG' 2>&1"
add_cron_if_not_exists "$DAILY_CRON" "Reporte diario de inventarios nuevos (7:00 AM)"

# 2. Análisis semanal los lunes a las 8:00 AM (inventarios sin asignar, sin uso, etc.)
WEEKLY_CRON="0 8 * * 1 curl -X POST '$BACKEND_URL/api/cron/weekly-analysis' >> '$CRON_LOG' 2>&1"
add_cron_if_not_exists "$WEEKLY_CRON" "Análisis semanal de inventarios (Lunes 8:00 AM)"

# 3. Verificación del sistema cada 6 horas
STATUS_CRON="0 */6 * * * curl -s '$BACKEND_URL/api/cron/status' >> '$CRON_LOG' 2>&1"
add_cron_if_not_exists "$STATUS_CRON" "Verificación del sistema cada 6 horas"

# 4. Limpieza de logs semanalmente (domingos a las 2:00 AM)
CLEANUP_CRON="0 2 * * 0 find '$LOG_DIR' -name 'sinabe_*.log' -mtime +30 -delete"
add_cron_if_not_exists "$CLEANUP_CRON" "Limpieza de logs antiguos (Domingos 2:00 AM)"

echo ""
echo "Cronjobs configurados exitosamente:"
echo "=================================="
crontab -l | grep -E "(sinabe|SINABE)"

echo ""
echo "Para probar manualmente:"
echo "========================"
echo "Reporte diario:    curl -X POST '$BACKEND_URL/api/cron/daily-report?test=1'"
echo "Análisis semanal:  curl -X POST '$BACKEND_URL/api/cron/weekly-analysis'"
echo "Status del sistema: curl '$BACKEND_URL/api/cron/status'"
echo ""
echo "Logs ubicados en: $CRON_LOG"
echo "Log de emails:    /var/log/sinabe_notifications.log"
