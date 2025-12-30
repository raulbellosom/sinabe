/**
 * Página de Notificaciones (Centro de Notificaciones)
 * Muestra la bandeja de notificaciones del usuario y gestión de reglas
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Button,
  Badge,
  Spinner,
  Tabs,
  Table,
  ToggleSwitch,
  Modal,
  TextInput,
  Select,
} from 'flowbite-react';
import {
  HiBell,
  HiCheck,
  HiTrash,
  HiRefresh,
  HiExternalLink,
  HiInbox,
  HiPlus,
  HiPencil,
  HiPlay,
  HiClock,
  HiMail,
  HiCog,
  HiChartBar,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiUser,
} from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import NotificationRuleForm from '../../components/Notifications/NotificationRuleForm';
import NotificationRuleTestModal from '../../components/Notifications/NotificationRuleTestModal';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    // Reglas de notificación
    rules,
    ruleTypes,
    rulesLoading,
    fetchRules,
    updateRule,
    deleteRule,
    getRuleHistory,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'rules' ? 1 : 0,
  );

  // Estados para búsqueda y paginación de notificaciones
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para búsqueda y paginación de reglas
  const [rulesSearchQuery, setRulesSearchQuery] = useState('');
  const [rulesCurrentPage, setRulesCurrentPage] = useState(1);
  const [rulesPageSize, setRulesPageSize] = useState(10);

  // Estados para gestión de reglas
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testingRule, setTestingRule] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [ruleHistory, setRuleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchNotifications({ limit: 100 });
    fetchRules();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success('Notificación marcada como leída');
    } catch (error) {
      toast.error('Error al marcar la notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar las notificaciones');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar la notificación');
    }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteReadNotifications();
      toast.success('Notificaciones leídas eliminadas');
    } catch (error) {
      toast.error('Error al eliminar las notificaciones');
    }
  };

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  const formatFullDate = (date) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es,
    });
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  // Filtrado por búsqueda
  const searchedNotifications = useMemo(() => {
    if (!searchQuery.trim()) return filteredNotifications;

    const query = searchQuery.toLowerCase().trim();
    return filteredNotifications.filter((notification) => {
      const title = notification.title?.toLowerCase() || '';
      const body = notification.body?.toLowerCase() || '';
      const link = notification.link?.toLowerCase() || '';

      return (
        title.includes(query) || body.includes(query) || link.includes(query)
      );
    });
  }, [filteredNotifications, searchQuery]);

  // Paginación
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return searchedNotifications.slice(startIndex, startIndex + pageSize);
  }, [searchedNotifications, currentPage, pageSize]);

  const totalPages = Math.ceil(searchedNotifications.length / pageSize);
  const totalRecords = searchedNotifications.length;

  // Reset página al cambiar filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Búsqueda y paginación de reglas
  const searchedRules = useMemo(() => {
    if (!rulesSearchQuery.trim()) return rules;

    const query = rulesSearchQuery.toLowerCase().trim();
    return rules.filter((rule) => {
      const name = rule.name?.toLowerCase() || '';
      const description = rule.description?.toLowerCase() || '';
      const ruleType = getRuleTypeName(rule.ruleType)?.toLowerCase() || '';

      return (
        name.includes(query) ||
        description.includes(query) ||
        ruleType.includes(query)
      );
    });
  }, [rules, rulesSearchQuery]);

  const paginatedRules = useMemo(() => {
    const startIndex = (rulesCurrentPage - 1) * rulesPageSize;
    return searchedRules.slice(startIndex, startIndex + rulesPageSize);
  }, [searchedRules, rulesCurrentPage, rulesPageSize]);

  const totalRulesPages = Math.ceil(searchedRules.length / rulesPageSize);
  const totalRulesRecords = searchedRules.length;

  useEffect(() => {
    setRulesCurrentPage(1);
  }, [rulesSearchQuery]);

  const handleRulesPageChange = (page) => {
    if (page >= 1 && page <= totalRulesPages) {
      setRulesCurrentPage(page);
    }
  };

  const handleRulesPageSizeChange = (e) => {
    setRulesPageSize(Number(e.target.value));
    setRulesCurrentPage(1);
  };

  const clearRulesSearch = () => {
    setRulesSearchQuery('');
    setRulesCurrentPage(1);
  };

  // Funciones para gestión de reglas
  const handleToggleEnabled = async (rule) => {
    try {
      await updateRule(rule.id, { enabled: !rule.enabled });
      toast.success(rule.enabled ? 'Regla deshabilitada' : 'Regla habilitada');
    } catch (error) {
      toast.error('Error al actualizar la regla');
    }
  };

  const handleDeleteRule = async (rule) => {
    if (!window.confirm(`¿Estás seguro de eliminar la regla "${rule.name}"?`)) {
      return;
    }
    try {
      await deleteRule(rule.id, true);
      toast.success('Regla eliminada');
    } catch (error) {
      toast.error('Error al eliminar la regla');
    }
  };

  const handleViewHistory = async (rule) => {
    setHistoryModal(rule);
    setHistoryLoading(true);
    try {
      const history = await getRuleHistory(rule.id);
      setRuleHistory(history);
    } catch (error) {
      toast.error('Error al cargar el historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Función mejorada para traducir expresiones CRON a español
  const translateCronExpression = (cronExpr) => {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length !== 5) return 'Programación personalizada';

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Función auxiliar para formatear horas
    const formatTime = (h, m = '0') => {
      const hNum = parseInt(h);
      const mNum = parseInt(m);
      const period = hNum >= 12 ? 'PM' : 'AM';
      const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
      const mStr = mNum.toString().padStart(2, '0');
      return `${h12}:${mStr} ${period}`;
    };

    // Días de la semana
    const daysMap = {
      0: 'Domingo',
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
    };

    // Patrón: */N (cada N unidades)
    const everyPattern = /^\*\/(\d+)$/;

    // MINUTOS
    if (everyPattern.test(minute)) {
      const n = minute.match(everyPattern)[1];
      return `Cada ${n} minutos`;
    }

    // HORAS
    if (minute === '0' && everyPattern.test(hour)) {
      const n = hour.match(everyPattern)[1];
      return `Cada ${n} horas`;
    }

    // DIARIO a una hora específica
    if (
      minute.match(/^\d+$/) &&
      hour.match(/^\d+$/) &&
      dayOfMonth === '*' &&
      month === '*' &&
      dayOfWeek === '*'
    ) {
      return `Diariamente a las ${formatTime(hour, minute)}`;
    }

    // DÍAS DE LA SEMANA específicos
    if (
      minute.match(/^\d+$/) &&
      hour.match(/^\d+$/) &&
      dayOfMonth === '*' &&
      month === '*' &&
      dayOfWeek !== '*'
    ) {
      if (dayOfWeek === '1-5') {
        return `Lun-Vie a las ${formatTime(hour, minute)}`;
      }
      if (dayOfWeek === '0,6' || dayOfWeek === '6,0') {
        return `Fin de semana a las ${formatTime(hour, minute)}`;
      }
      if (dayOfWeek.match(/^\d$/)) {
        return `${daysMap[dayOfWeek]} a las ${formatTime(hour, minute)}`;
      }
      // Múltiples días separados por comas
      if (dayOfWeek.includes(',')) {
        const days = dayOfWeek
          .split(',')
          .map((d) => daysMap[d] || d)
          .join(', ');
        return `${days} a las ${formatTime(hour, minute)}`;
      }
    }

    // DÍA DEL MES específico
    if (
      minute.match(/^\d+$/) &&
      hour.match(/^\d+$/) &&
      dayOfMonth.match(/^\d+$/) &&
      month === '*' &&
      dayOfWeek === '*'
    ) {
      return `Día ${dayOfMonth} de cada mes a las ${formatTime(hour, minute)}`;
    }

    // PRIMER/ÚLTIMO día del mes
    if (
      minute.match(/^\d+$/) &&
      hour.match(/^\d+$/) &&
      dayOfMonth === '1' &&
      month === '*'
    ) {
      return `Primer día del mes a las ${formatTime(hour, minute)}`;
    }

    // MÚLTIPLES HORAS en el día
    if (minute === '0' && hour.includes(',') && dayOfMonth === '*') {
      const hours = hour
        .split(',')
        .map((h) => formatTime(h))
        .join(', ');
      return `Diariamente a las ${hours}`;
    }

    return 'Programación personalizada';
  };

  const formatSchedule = (rule) => {
    let intervalText = '';
    let cronText = '';
    let cronTranslation = '';

    if (rule.scheduleType === 'INTERVAL' && rule.intervalMinutes) {
      const hours = Math.floor(rule.intervalMinutes / 60);
      const minutes = rule.intervalMinutes % 60;
      if (hours > 0 && minutes > 0) {
        intervalText = `Cada ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        intervalText = hours === 1 ? 'Cada hora' : `Cada ${hours} horas`;
      } else {
        intervalText =
          minutes === 1 ? 'Cada minuto' : `Cada ${minutes} minutos`;
      }
    }

    if (rule.scheduleType === 'CRON' && rule.cronExpression) {
      cronText = rule.cronExpression;
      cronTranslation = translateCronExpression(cronText);
    }

    if (!intervalText && !cronText) {
      return <span className="text-gray-400 text-sm">Sin programar</span>;
    }

    return (
      <div className="flex flex-col gap-1 min-w-0">
        {intervalText && (
          <span className="font-medium text-gray-900 whitespace-nowrap">
            {intervalText}
          </span>
        )}
        {cronTranslation && (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-gray-900 text-sm">
              {cronTranslation}
            </span>
            <code className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
              {cronText}
            </code>
          </div>
        )}
      </div>
    );
  };

  const getChannelIcons = (channels) => {
    return channels
      .filter((c) => c.enabled)
      .map((c) => {
        switch (c.channel) {
          case 'EMAIL':
            return (
              <HiMail
                key={c.id}
                className="w-4 h-4 text-blue-500"
                title="Email"
              />
            );
          case 'IN_APP':
            return (
              <HiBell
                key={c.id}
                className="w-4 h-4 text-green-500"
                title="In-App"
              />
            );
          default:
            return null;
        }
      });
  };

  const getRuleTypeName = (type) => {
    const found = ruleTypes.find((t) => t.type === type);
    return found?.name || type;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 1 ? { tab: 'rules' } : {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <HiBell className="w-7 h-7 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Centro de Notificaciones
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1 flex items-center gap-2">
                  {unreadCount > 0 ? (
                    <>
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="font-medium text-red-600">
                        {unreadCount} sin leer
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-green-600">Todo al día</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <Button
              color="light"
              size="sm"
              onClick={() => {
                fetchNotifications({ limit: 100 });
                fetchRules();
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <HiRefresh className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>

          {/* Tabs mejorados y responsivos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1 inline-flex gap-1 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => handleTabChange(0)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none ${
                activeTab === 0
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <HiInbox className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Bandeja</span>
              <span className="sm:hidden">Notif.</span>
              {unreadCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                    activeTab === 0
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none ${
                activeTab === 1
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <HiCog className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Reglas</span>
              <span className="sm:hidden">Config.</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                  activeTab === 1
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {rules.length}
              </span>
            </button>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 0 ? (
          /* ===== BANDEJA DE NOTIFICACIONES ===== */
          <div className="space-y-6">
            {/* Buscador mejorado */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <HiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar en título, descripción o enlace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-medium text-blue-600">
                    {searchedNotifications.length}
                  </span>
                  resultado(s) para
                  <span className="font-medium text-gray-700">
                    "{searchQuery}"
                  </span>
                </p>
              )}
            </div>

            {/* Filtros mejorados */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Todas
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filter === 'all' ? 'bg-white/20' : 'bg-gray-100'
                    }`}
                  >
                    {notifications.length}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Sin leer
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filter === 'unread'
                        ? 'bg-white/20'
                        : unreadCount > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100'
                    }`}
                  >
                    {unreadCount}
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-0 shadow-md"
                  >
                    <HiCheck className="w-4 h-4 mr-2 flex-shrink-0" />
                    Marcar leídas
                  </Button>
                )}
                {notifications.some((n) => n.isRead) && (
                  <Button
                    size="sm"
                    onClick={handleDeleteRead}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0 shadow-md"
                  >
                    <HiTrash className="w-4 h-4 mr-2 flex-shrink-0" />
                    Eliminar leídas
                  </Button>
                )}
              </div>
            </div>

            {/* Lista de notificaciones mejorada */}
            {notificationsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                <Spinner size="xl" />
                <p className="mt-4 text-gray-500">Cargando notificaciones...</p>
              </div>
            ) : searchedNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <HiInbox className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchQuery
                    ? 'No se encontraron resultados'
                    : filter === 'unread'
                      ? '¡Todo al día!'
                      : 'Sin notificaciones'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? 'Intenta con otros términos de búsqueda o revisa los filtros'
                    : filter === 'unread'
                      ? 'No tienes notificaciones pendientes por leer'
                      : 'Las notificaciones aparecerán aquí cuando las recibas'}
                </p>
                {searchQuery ? (
                  <Button
                    color="light"
                    size="sm"
                    onClick={clearSearch}
                    className="shadow-sm"
                  >
                    <HiX className="w-4 h-4 mr-2" />
                    Limpiar búsqueda
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleTabChange(1)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border-0 shadow-md"
                  >
                    <HiCog className="w-4 h-4 mr-2 flex-shrink-0" />
                    Configurar reglas
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group relative bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md overflow-hidden ${
                        !notification.isRead
                          ? 'border-l-4 border-l-blue-500 border-y border-r border-blue-100 bg-gradient-to-r from-blue-50/50 to-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          {/* Icono de notificación */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                              !notification.isRead
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}
                          >
                            <HiBell className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {!notification.isRead && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500 text-white shadow-sm">
                                  <span className="flex h-1.5 w-1.5 rounded-full bg-white"></span>
                                  Nueva
                                </span>
                              )}
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                {notification.title}
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base mb-3 leading-relaxed">
                              {notification.body}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <span
                                className="flex items-center gap-1.5"
                                title={formatFullDate(notification.createdAt)}
                              >
                                <HiClock className="w-3.5 h-3.5 flex-shrink-0" />
                                {formatTime(notification.createdAt)}
                              </span>
                              {notification.ruleCreator && (
                                <span className="flex items-center gap-1.5 text-purple-600">
                                  <HiUser className="w-3.5 h-3.5 flex-shrink-0" />
                                  De: {notification.ruleCreator.firstName}{' '}
                                  {notification.ruleCreator.lastName}
                                </span>
                              )}
                              {notification.readAt && (
                                <span className="flex items-center gap-1.5 text-green-600">
                                  <HiCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                  Leída {formatTime(notification.readAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                            {notification.link && (
                              <button
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead(notification.id);
                                  }
                                  navigate(notification.link);
                                }}
                                className="px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <HiExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                Ver
                              </button>
                            )}
                            {!notification.isRead && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                title="Marcar como leída"
                              >
                                <HiCheck className="w-5 h-5 flex-shrink-0" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                              title="Eliminar"
                            >
                              <HiTrash className="w-5 h-5 flex-shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación elegante y moderna */}
                {totalPages > 0 && (
                  <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                      {/* Info de resultados */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-normal">Mostrando</span>
                          <span className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-semibold">
                            {(currentPage - 1) * pageSize + 1}-
                            {Math.min(currentPage * pageSize, totalRecords)}
                          </span>
                          <span className="font-normal">de</span>
                          <span className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg font-semibold">
                            {totalRecords}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                            Por página:
                          </label>
                          <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                          >
                            {[5, 10, 15, 20, 30, 50].map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Controles de navegación */}
                      <div className="flex items-center gap-1.5">
                        {/* Primera página */}
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm'
                          }`}
                          title="Primera página"
                        >
                          <div className="flex items-center">
                            <HiChevronLeft className="w-4 h-4 flex-shrink-0" />
                            <HiChevronLeft className="w-4 h-4 -ml-2 flex-shrink-0" />
                          </div>
                        </button>

                        {/* Anterior */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm'
                          }`}
                          title="Página anterior"
                        >
                          <HiChevronLeft className="w-4 h-4 flex-shrink-0" />
                        </button>

                        {/* Números de página */}
                        <div className="hidden sm:flex items-center gap-1">
                          {(() => {
                            const pages = [];
                            const maxVisiblePages = 5;
                            let startPage = Math.max(
                              1,
                              currentPage - Math.floor(maxVisiblePages / 2),
                            );
                            let endPage = Math.min(
                              totalPages,
                              startPage + maxVisiblePages - 1,
                            );

                            if (endPage - startPage + 1 < maxVisiblePages) {
                              startPage = Math.max(
                                1,
                                endPage - maxVisiblePages + 1,
                              );
                            }

                            if (startPage > 1) {
                              pages.push(
                                <button
                                  key={1}
                                  onClick={() => handlePageChange(1)}
                                  className="min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all duration-200"
                                >
                                  1
                                </button>,
                              );
                              if (startPage > 2) {
                                pages.push(
                                  <span
                                    key="dots-start"
                                    className="px-2 text-gray-400 font-bold"
                                  >
                                    ···
                                  </span>,
                                );
                              }
                            }

                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => handlePageChange(i)}
                                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    i === currentPage
                                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 hover:border-blue-300 shadow-sm'
                                  }`}
                                >
                                  {i}
                                </button>,
                              );
                            }

                            if (endPage < totalPages) {
                              if (endPage < totalPages - 1) {
                                pages.push(
                                  <span
                                    key="dots-end"
                                    className="px-2 text-gray-400 font-bold"
                                  >
                                    ···
                                  </span>,
                                );
                              }
                              pages.push(
                                <button
                                  key={totalPages}
                                  onClick={() => handlePageChange(totalPages)}
                                  className="min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all duration-200"
                                >
                                  {totalPages}
                                </button>,
                              );
                            }

                            return pages;
                          })()}
                        </div>

                        {/* Indicador móvil */}
                        <div className="sm:hidden px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                          {currentPage} / {totalPages}
                        </div>

                        {/* Siguiente */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm'
                          }`}
                          title="Página siguiente"
                        >
                          <HiChevronRight className="w-4 h-4 flex-shrink-0" />
                        </button>

                        {/* Última página */}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm'
                          }`}
                          title="Última página"
                        >
                          <div className="flex items-center">
                            <HiChevronRight className="w-4 h-4 flex-shrink-0" />
                            <HiChevronRight className="w-4 h-4 -ml-2 flex-shrink-0" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* ===== REGLAS DE NOTIFICACIÓN ===== */
          <div className="space-y-6">
            {/* Header de reglas mejorado */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Reglas de Notificación
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configura alertas automáticas para eventos del sistema
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border-0 shadow-md whitespace-nowrap"
                >
                  <HiPlus className="w-4 h-4 mr-2 flex-shrink-0" />
                  Nueva Regla
                </Button>
              </div>
            </div>

            {/* Buscador de reglas */}
            {!rulesLoading && rules.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar reglas por nombre, descripción o tipo..."
                    value={rulesSearchQuery}
                    onChange={(e) => setRulesSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  {rulesSearchQuery && (
                    <button
                      onClick={clearRulesSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {rulesSearchQuery && (
                  <p className="mt-2 text-sm text-gray-500">
                    {totalRulesRecords}{' '}
                    {totalRulesRecords === 1 ? 'resultado' : 'resultados'}
                  </p>
                )}
              </div>
            )}

            {/* Tabla de reglas mejorada */}
            {rulesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                <Spinner size="xl" />
                <p className="mt-4 text-gray-500">Cargando reglas...</p>
              </div>
            ) : searchedRules.length === 0 && rulesSearchQuery ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <HiSearch className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No se encontraron reglas
                </h3>
                <p className="text-gray-500 mb-4">
                  No hay reglas que coincidan con &quot;{rulesSearchQuery}&quot;
                </p>
                <Button
                  onClick={clearRulesSearch}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border-0 shadow-md"
                >
                  Limpiar búsqueda
                </Button>
              </div>
            ) : rules.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <HiCog className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No hay reglas configuradas
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Crea tu primera regla para recibir notificaciones automáticas
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border-0 shadow-md"
                >
                  <HiPlus className="w-4 h-4 mr-2 flex-shrink-0" />
                  Crear Primera Regla
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabla responsive */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Frecuencia
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Canales
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Última Ejecución
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedRules.map((rule) => (
                        <tr
                          key={rule.id}
                          className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <ToggleSwitch
                              checked={rule.enabled}
                              onChange={() => handleToggleEnabled(rule)}
                              sizing="sm"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="min-w-0 max-w-xs">
                              <p className="font-semibold text-gray-900 truncate">
                                {rule.name}
                              </p>
                              {rule.description && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {rule.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700">
                              {getRuleTypeName(rule.ruleType)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-start gap-2">
                              <HiClock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              {formatSchedule(rule)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getChannelIcons(rule.channels)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {rule.lastRunAt ? (
                                <span
                                  className="text-gray-600"
                                  title={format(
                                    new Date(rule.lastRunAt),
                                    'dd/MM/yyyy HH:mm',
                                  )}
                                >
                                  {formatDistanceToNow(
                                    new Date(rule.lastRunAt),
                                    {
                                      addSuffix: true,
                                      locale: es,
                                    },
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-400">Nunca</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setTestingRule(rule)}
                                className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                                title="Probar regla"
                              >
                                <HiPlay className="w-4 h-4 flex-shrink-0" />
                              </button>
                              <button
                                onClick={() => handleViewHistory(rule)}
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                title="Ver historial"
                              >
                                <HiChartBar className="w-4 h-4 flex-shrink-0" />
                              </button>
                              <button
                                onClick={() => setEditingRule(rule)}
                                className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                                title="Editar"
                              >
                                <HiPencil className="w-4 h-4 flex-shrink-0" />
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                title="Eliminar"
                              >
                                <HiTrash className="w-4 h-4 flex-shrink-0" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer de paginación de reglas */}
                {searchedRules.length > 0 && (
                  <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Info y selector de tamaño */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 text-sm">
                        {/* Indicador móvil */}
                        <div className="sm:hidden text-gray-600 font-medium">
                          {rulesCurrentPage} / {totalRulesPages || 1}
                        </div>

                        {/* Info desktop */}
                        <div className="hidden sm:block text-gray-600">
                          Mostrando{' '}
                          <span className="font-semibold text-gray-900">
                            {(rulesCurrentPage - 1) * rulesPageSize + 1}
                          </span>{' '}
                          a{' '}
                          <span className="font-semibold text-gray-900">
                            {Math.min(
                              rulesCurrentPage * rulesPageSize,
                              totalRulesRecords,
                            )}
                          </span>{' '}
                          de{' '}
                          <span className="font-semibold text-gray-900">
                            {totalRulesRecords}
                          </span>{' '}
                          reglas
                        </div>

                        {/* Selector de tamaño */}
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="rules-pageSize"
                            className="text-gray-600 whitespace-nowrap"
                          >
                            Por página:
                          </label>
                          <select
                            id="rules-pageSize"
                            value={rulesPageSize}
                            onChange={handleRulesPageSizeChange}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer"
                          >
                            {[5, 10, 15, 20, 30, 50].map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Controles de navegación - solo si hay más de 1 página */}
                      {totalRulesPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRulesPageChange(1)}
                            disabled={rulesCurrentPage === 1}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              rulesCurrentPage === 1
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 border border-gray-200 hover:border-purple-300 shadow-sm'
                            }`}
                            title="Primera página"
                          >
                            <div className="flex items-center">
                              <HiChevronLeft className="w-4 h-4 flex-shrink-0" />
                              <HiChevronLeft className="w-4 h-4 -ml-2 flex-shrink-0" />
                            </div>
                          </button>

                          <button
                            onClick={() =>
                              handleRulesPageChange(rulesCurrentPage - 1)
                            }
                            disabled={rulesCurrentPage === 1}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              rulesCurrentPage === 1
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 border border-gray-200 hover:border-purple-300 shadow-sm'
                            }`}
                            title="Página anterior"
                          >
                            <HiChevronLeft className="w-4 h-4 flex-shrink-0" />
                          </button>

                          <div className="hidden sm:flex items-center gap-1">
                            {(() => {
                              const pages = [];
                              const maxVisiblePages = 5;
                              let startPage = Math.max(
                                1,
                                rulesCurrentPage -
                                  Math.floor(maxVisiblePages / 2),
                              );
                              let endPage = Math.min(
                                totalRulesPages,
                                startPage + maxVisiblePages - 1,
                              );

                              if (endPage - startPage + 1 < maxVisiblePages) {
                                startPage = Math.max(
                                  1,
                                  endPage - maxVisiblePages + 1,
                                );
                              }

                              if (startPage > 1) {
                                pages.push(
                                  <button
                                    key={1}
                                    onClick={() => handleRulesPageChange(1)}
                                    className="min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 hover:border-purple-300 shadow-sm transition-all duration-200"
                                  >
                                    1
                                  </button>,
                                );
                                if (startPage > 2) {
                                  pages.push(
                                    <span
                                      key="dots-start"
                                      className="px-2 text-gray-400 font-bold"
                                    >
                                      ···
                                    </span>,
                                  );
                                }
                              }

                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => handleRulesPageChange(i)}
                                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      i === rulesCurrentPage
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 hover:border-purple-300 shadow-sm'
                                    }`}
                                  >
                                    {i}
                                  </button>,
                                );
                              }

                              if (endPage < totalRulesPages) {
                                if (endPage < totalRulesPages - 1) {
                                  pages.push(
                                    <span
                                      key="dots-end"
                                      className="px-2 text-gray-400 font-bold"
                                    >
                                      ···
                                    </span>,
                                  );
                                }
                                pages.push(
                                  <button
                                    key={totalRulesPages}
                                    onClick={() =>
                                      handleRulesPageChange(totalRulesPages)
                                    }
                                    className="min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 hover:border-purple-300 shadow-sm transition-all duration-200"
                                  >
                                    {totalRulesPages}
                                  </button>,
                                );
                              }

                              return pages;
                            })()}
                          </div>

                          <div className="sm:hidden px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md">
                            {rulesCurrentPage}
                          </div>

                          <button
                            onClick={() =>
                              handleRulesPageChange(rulesCurrentPage + 1)
                            }
                            disabled={rulesCurrentPage === totalRulesPages}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              rulesCurrentPage === totalRulesPages
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 border border-gray-200 hover:border-purple-300 shadow-sm'
                            }`}
                            title="Página siguiente"
                          >
                            <HiChevronRight className="w-4 h-4 flex-shrink-0" />
                          </button>

                          <button
                            onClick={() =>
                              handleRulesPageChange(totalRulesPages)
                            }
                            disabled={rulesCurrentPage === totalRulesPages}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              rulesCurrentPage === totalRulesPages
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-600 border border-gray-200 hover:border-purple-300 shadow-sm'
                            }`}
                            title="Última página"
                          >
                            <div className="flex items-center">
                              <HiChevronRight className="w-4 h-4 flex-shrink-0" />
                              <HiChevronRight className="w-4 h-4 -ml-2 flex-shrink-0" />
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal de crear/editar regla */}
        <NotificationRuleForm
          show={showCreateModal || !!editingRule}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRule(null);
          }}
          rule={editingRule}
        />

        {/* Modal de test-run */}
        <NotificationRuleTestModal
          show={!!testingRule}
          onClose={() => setTestingRule(null)}
          rule={testingRule}
        />

        {/* Modal de historial */}
        <Modal
          show={!!historyModal}
          onClose={() => {
            setHistoryModal(null);
            setRuleHistory([]);
          }}
          size="xl"
        >
          <Modal.Header>
            Historial de Ejecuciones: {historyModal?.name}
          </Modal.Header>
          <Modal.Body>
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : ruleHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay ejecuciones registradas
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ruleHistory.map((run) => (
                  <Card key={run.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            color={
                              run.status === 'SUCCESS'
                                ? 'success'
                                : run.status === 'PARTIAL'
                                  ? 'warning'
                                  : run.status === 'RUNNING'
                                    ? 'info'
                                    : 'failure'
                            }
                            size="sm"
                          >
                            {run.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {format(
                              new Date(run.startedAt),
                              'dd/MM/yyyy HH:mm:ss',
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {run.matchCount} coincidencia(s) •{' '}
                          {run.deliveries?.length || 0} envío(s)
                        </p>
                      </div>
                      {run.finishedAt && (
                        <span className="text-xs text-gray-400">
                          Duración:{' '}
                          {Math.round(
                            (new Date(run.finishedAt) -
                              new Date(run.startedAt)) /
                              1000,
                          )}
                          s
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default NotificationsPage;
