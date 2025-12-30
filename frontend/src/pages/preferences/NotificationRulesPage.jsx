/**
 * Página de Reglas de Notificación
 * Con tabs para separar "Mis Reglas" vs "Suscritas" (donde me agregaron)
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Button,
  Badge,
  Spinner,
  Table,
  ToggleSwitch,
  Modal,
  Tabs,
  Tooltip,
} from 'flowbite-react';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiPlay,
  HiClock,
  HiMail,
  HiBell,
  HiRefresh,
  HiChartBar,
  HiUser,
  HiUserRemove,
  HiUsers,
  HiViewGrid,
} from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import NotificationRuleForm from '../../components/Notifications/NotificationRuleForm';
import NotificationRuleTestModal from '../../components/Notifications/NotificationRuleTestModal';

const NotificationRulesPage = () => {
  const {
    rules,
    ruleTypes,
    rulesLoading,
    fetchRules,
    updateRule,
    deleteRule,
    unsubscribeFromRule,
    getRuleHistory,
  } = useNotifications();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testingRule, setTestingRule] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [ruleHistory, setRuleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mine');

  useEffect(() => {
    fetchRules();
  }, []);

  // Separar reglas en "mías" y "suscritas"
  const { myRules, subscribedRules } = useMemo(() => {
    const mine = rules.filter((r) => r._meta?.isOwner);
    const subscribed = rules.filter(
      (r) => !r._meta?.isOwner && r._meta?.isRecipient,
    );
    return { myRules: mine, subscribedRules: subscribed };
  }, [rules]);

  const handleToggleEnabled = async (rule) => {
    if (!rule._meta?.canEdit) {
      toast.error('No tienes permiso para modificar esta regla');
      return;
    }
    try {
      await updateRule(rule.id, { enabled: !rule.enabled });
      toast.success(rule.enabled ? 'Regla deshabilitada' : 'Regla habilitada');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Error al actualizar la regla',
      );
    }
  };

  const handleDelete = async (rule) => {
    if (!rule._meta?.canDelete) {
      toast.error('No tienes permiso para eliminar esta regla');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la regla "${rule.name}"?`)) {
      return;
    }

    try {
      await deleteRule(rule.id, true);
      toast.success('Regla eliminada');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar la regla');
    }
  };

  const handleUnsubscribe = async (rule) => {
    if (!rule._meta?.canUnsubscribe) {
      toast.error('No puedes desuscribirte de esta regla');
      return;
    }

    const creatorName = rule.createdBy
      ? `${rule.createdBy.firstName} ${rule.createdBy.lastName}`
      : 'otro usuario';

    if (
      !window.confirm(
        `¿Deseas desuscribirte de la regla "${rule.name}" creada por ${creatorName}?\n\nYa no recibirás notificaciones de esta alerta.`,
      )
    ) {
      return;
    }

    try {
      const result = await unsubscribeFromRule(rule.id);
      toast.success(result.message || 'Te has desuscrito de la regla');
      fetchRules(); // Recargar para actualizar la lista
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al desuscribirse');
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

  const formatSchedule = (rule) => {
    let intervalText = '';
    let cronText = '';

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
    }

    // Si no hay nada configurado
    if (!intervalText && !cronText) {
      return <span className="text-gray-400">Sin programar</span>;
    }

    return (
      <div className="flex flex-col">
        {intervalText && (
          <span className="whitespace-nowrap">{intervalText}</span>
        )}
        {cronText && (
          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
            {cronText}
          </span>
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

  const renderRulesTable = (rulesList, isOwner = true) => {
    if (rulesList.length === 0) {
      return (
        <Card className="text-center py-12">
          <HiBell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            {isOwner
              ? 'No has creado reglas'
              : 'No te han suscrito a ninguna regla'}
          </h3>
          <p className="text-gray-400 mt-2 mb-4">
            {isOwner
              ? 'Crea tu primera regla para recibir notificaciones automáticas'
              : 'Cuando alguien te agregue a una regla de notificación, aparecerá aquí'}
          </p>
          {isOwner && (
            <Button color="blue" onClick={() => setShowCreateModal(true)}>
              <HiPlus className="w-4 h-4 mr-1" />
              Crear Regla
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Estado</Table.HeadCell>
            <Table.HeadCell>Nombre</Table.HeadCell>
            {!isOwner && <Table.HeadCell>Creado por</Table.HeadCell>}
            <Table.HeadCell>Tipo</Table.HeadCell>
            <Table.HeadCell>Frecuencia</Table.HeadCell>
            <Table.HeadCell>Canales</Table.HeadCell>
            <Table.HeadCell>Última Ejecución</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {rulesList.map((rule) => (
              <Table.Row key={rule.id} className="bg-white">
                <Table.Cell>
                  {isOwner ? (
                    <ToggleSwitch
                      checked={rule.enabled}
                      onChange={() => handleToggleEnabled(rule)}
                      sizing="sm"
                    />
                  ) : (
                    <Badge color={rule.enabled ? 'success' : 'gray'} size="sm">
                      {rule.enabled ? 'Activa' : 'Inactiva'}
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <p className="font-medium text-gray-900">{rule.name}</p>
                    {rule.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {rule.description}
                      </p>
                    )}
                  </div>
                </Table.Cell>
                {!isOwner && (
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <HiUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {rule.createdBy
                            ? `${rule.createdBy.firstName} ${rule.createdBy.lastName}`
                            : 'Usuario desconocido'}
                        </p>
                        {rule.createdBy?.email && (
                          <p className="text-xs text-gray-500">
                            {rule.createdBy.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                )}
                <Table.Cell>
                  <Badge color="purple" size="sm">
                    {getRuleTypeName(rule.ruleType)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <HiClock className="w-4 h-4 mt-0.5 shrink-0" />
                    {formatSchedule(rule)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    {getChannelIcons(rule.channels)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-sm">
                    {rule.lastRunAt ? (
                      <span
                        title={format(
                          new Date(rule.lastRunAt),
                          'dd/MM/yyyy HH:mm',
                        )}
                      >
                        {formatDistanceToNow(new Date(rule.lastRunAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400">Nunca</span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    {isOwner ? (
                      // Acciones para reglas propias
                      <>
                        <Tooltip content="Probar regla">
                          <Button
                            color="light"
                            size="xs"
                            onClick={() => setTestingRule(rule)}
                          >
                            <HiPlay className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Ver historial">
                          <Button
                            color="light"
                            size="xs"
                            onClick={() => handleViewHistory(rule)}
                          >
                            <HiChartBar className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar">
                          <Button
                            color="light"
                            size="xs"
                            onClick={() => setEditingRule(rule)}
                          >
                            <HiPencil className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => handleDelete(rule)}
                          >
                            <HiTrash className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </>
                    ) : (
                      // Acciones para reglas suscritas
                      <>
                        <Tooltip content="Ver historial">
                          <Button
                            color="light"
                            size="xs"
                            onClick={() => handleViewHistory(rule)}
                          >
                            <HiChartBar className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Desuscribirse">
                          <Button
                            color="warning"
                            size="xs"
                            onClick={() => handleUnsubscribe(rule)}
                          >
                            <HiUserRemove className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b-2 border-neutral-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Reglas de Notificación</h1>
            <p className="text-gray-500 text-sm">
              Configura y gestiona tus alertas automáticas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button color="light" size="sm" onClick={fetchRules}>
              <HiRefresh className="w-4 h-4 mr-1" />
              Actualizar
            </Button>
            <Button
              color="blue"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <HiPlus className="w-4 h-4 mr-1" />
              Nueva Regla
            </Button>
          </div>
        </div>

        {/* Tabs */}
        {rulesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="xl" />
          </div>
        ) : (
          <Tabs
            aria-label="Tabs de reglas"
            variant="underline"
            onActiveTabChange={(tab) =>
              setActiveTab(tab === 0 ? 'mine' : 'subscribed')
            }
          >
            <Tabs.Item
              active={activeTab === 'mine'}
              title={
                <div className="flex items-center gap-2">
                  <HiViewGrid className="w-4 h-4" />
                  <span>Mis Reglas</span>
                  {myRules.length > 0 && (
                    <Badge color="blue" size="sm">
                      {myRules.length}
                    </Badge>
                  )}
                </div>
              }
            >
              <div className="pt-4">{renderRulesTable(myRules, true)}</div>
            </Tabs.Item>
            <Tabs.Item
              active={activeTab === 'subscribed'}
              title={
                <div className="flex items-center gap-2">
                  <HiUsers className="w-4 h-4" />
                  <span>Suscritas</span>
                  {subscribedRules.length > 0 && (
                    <Badge color="purple" size="sm">
                      {subscribedRules.length}
                    </Badge>
                  )}
                </div>
              }
            >
              <div className="pt-4">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Reglas suscritas:</strong> Estas son reglas creadas
                    por otros usuarios que te incluyen como destinatario. Puedes
                    desuscribirte si no deseas recibir estas notificaciones.
                  </p>
                </div>
                {renderRulesTable(subscribedRules, false)}
              </div>
            </Tabs.Item>
          </Tabs>
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

export default NotificationRulesPage;
