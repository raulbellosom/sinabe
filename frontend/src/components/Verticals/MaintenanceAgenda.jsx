import React, { useState } from 'react';
import {
  Button,
  Table,
  Badge,
  Modal,
  Label,
  TextInput,
  Textarea,
  Checkbox,
  Select,
  Dropdown,
} from 'flowbite-react';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../../hooks/useEvents';
import { useUsersList } from '../../hooks/useUsersList';
import SearchableSelect from '../common/SearchableSelect';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import {
  FaPlus,
  FaCheck,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import dayjs from 'dayjs';
import Notifies from '../Notifies/Notifies';
import ActionButtons from '../ActionButtons/ActionButtons';

const MaintenanceAgenda = ({ verticalId }) => {
  const {
    data: events,
    isLoading,
    refetch,
  } = useEvents({ verticalId, type: 'MAINTENANCE' });
  const { data: users } = useUsersList();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  // User Options for Select
  const userOptions =
    users?.map((u) => {
      const fullName = `${u.firstName} ${u.lastName || ''}`.trim();
      return {
        value: u.id,
        label: fullName || u.email,
        description: u.email,
        photoUrl: u.photoUrl || null,
        initials:
          `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase(),
      };
    }) || [];

  const renderUserOption = (option) => (
    <div className="flex items-center gap-3">
      {option.photoUrl ? (
        <img
          src={FormattedUrlImage(option.photoUrl)}
          alt={option.label}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">
            {option.initials}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {option.label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {option.description}
        </p>
      </div>
    </div>
  );

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    provider: '',
    isRecurring: false,
    recurrence: '',
    recurrenceEndDate: '',
    scope: 'GLOBAL',
    attendeeIds: [],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      provider: '',
      isRecurring: false,
      recurrence: '',
      recurrenceEndDate: '',
      scope: 'GLOBAL',
      attendeeIds: [],
    });
    setEditingEvent(null);
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        scheduledDate: dayjs(event.scheduledDate).format('YYYY-MM-DDTHH:mm'),
        provider: event.provider || '',
        isRecurring: event.isRecurring,
        recurrence: event.recurrence || '',
        recurrenceEndDate: event.recurrenceEndDate || '',
        scope: event.scope || 'GLOBAL',
        attendeeIds: event.attendees?.map((a) => a.userId) || [],
        status: event.status, // Include status for editing
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.scope === 'SPECIFIC' && formData.attendeeIds.length === 0) {
        return Notifies(
          'error',
          'Seleccione al menos un asistente para eventos específicos.',
        );
      }

      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, data: formData });
        Notifies('success', 'Mantenimiento actualizado');
      } else {
        await createEvent.mutateAsync({
          ...formData,
          verticalId,
          type: 'MAINTENANCE',
          scope: formData.scope,
        });
        Notifies('success', 'Mantenimiento programado');
      }
      setShowModal(false);
      refetch();
    } catch (error) {
      Notifies('error', 'Error al guardar');
    }
  };

  const handleComplete = async (event) => {
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        data: { status: 'COMPLETED', completedDate: new Date() },
      });
      Notifies('success', 'Mantenimiento marcado como completado');
      refetch();
    } catch (error) {
      Notifies('error', 'Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar evento?')) return;
    try {
      await deleteEvent.mutateAsync(id);
      Notifies('success', 'Evento eliminado');
      refetch();
    } catch (error) {
      Notifies('error', 'Error al eliminar');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      SCHEDULED: 'info',
      COMPLETED: 'success',
      POSTPONED: 'warning',
      CANCELLED: 'failure',
      OVERDUE: 'failure',
    };

    const translations = {
      SCHEDULED: 'Programado',
      COMPLETED: 'Completado',
      POSTPONED: 'Postergado',
      CANCELLED: 'Cancelado',
      OVERDUE: 'Vencido',
    };

    return (
      <Badge color={colors[status] || 'gray'}>
        {translations[status] || status}
      </Badge>
    );
  };

  // Calculate series info
  const processedEvents = React.useMemo(() => {
    if (!events) return [];

    // Group by seriesId
    const seriesMap = {};
    const processed = [...events]; // Clone to safely mutate/enhance if needed, or just map later

    // Populate map
    processed.forEach((e) => {
      if (e.seriesId) {
        if (!seriesMap[e.seriesId]) seriesMap[e.seriesId] = [];
        seriesMap[e.seriesId].push(e);
      }
    });

    // Sort and calculate indices
    const seriesInfo = {}; // eventId -> { index, total }
    Object.values(seriesMap).forEach((series) => {
      // Sort by date ascending
      series.sort(
        (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate),
      );
      series.forEach((e, idx) => {
        seriesInfo[e.id] = { index: idx + 1, total: series.length };
      });
    });

    // Attach info to events or return lookup map.
    // Easier to just map events to new array with extra props.
    return processed.map((e) => ({
      ...e,
      seriesIndex: seriesInfo[e.id]?.index,
      seriesTotal: seriesInfo[e.id]?.total,
    }));
  }, [events]);

  const periodicityLabels = {
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    BIMONTHLY: 'Bimestral',
    QUARTERLY: 'Trimestral',
    QUADRIMESTRAL: 'Cuatrimestral',
    SEMIANNUAL: 'Semestral',
    YEARLY: 'Anual',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaCalendarAlt /> Agenda de Mantenimiento
        </h3>
        <ActionButtons
          extraActions={[
            {
              label: 'Programar Mantenimiento',
              action: () => handleOpenModal(),
              icon: FaPlus,
              color: 'indigo',
              filled: true,
            },
          ]}
        />
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Fecha Programada</Table.HeadCell>
            <Table.HeadCell>Título</Table.HeadCell>
            <Table.HeadCell>Periodicidad</Table.HeadCell>
            <Table.HeadCell>Proveedor</Table.HeadCell>
            <Table.HeadCell>Estado</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {isLoading && (
              <Table.Row>
                <Table.Cell colSpan={5}>Cargando...</Table.Cell>
              </Table.Row>
            )}
            {!isLoading && processedEvents?.length === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="text-center text-gray-500 py-4"
                >
                  No hay mantenimientos programados.
                </Table.Cell>
              </Table.Row>
            )}
            {processedEvents?.map((event) => (
              <Table.Row
                key={event.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {dayjs(event.scheduledDate).format('DD/MM/YYYY HH:mm')}
                </Table.Cell>
                <Table.Cell>{event.title}</Table.Cell>
                <Table.Cell>
                  {event.isRecurring && event.recurrence ? (
                    <Badge color="purple" className="w-fit whitespace-nowrap">
                      {periodicityLabels[event.recurrence] || event.recurrence}
                      {event.seriesIndex && event.seriesTotal && (
                        <span className="ml-1 opacity-75">
                          ({event.seriesIndex}/{event.seriesTotal})
                        </span>
                      )}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </Table.Cell>
                <Table.Cell>{event.provider || '-'}</Table.Cell>
                <Table.Cell>{getStatusBadge(event.status)}</Table.Cell>
                <Table.Cell className="flex justify-end">
                  <Dropdown
                    arrowIcon={false}
                    inline
                    label=""
                    renderTrigger={() => (
                      <button
                        type="button"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <BsThreeDotsVertical />
                      </button>
                    )}
                  >
                    {event.status !== 'COMPLETED' && (
                      <Dropdown.Item
                        icon={FaCheck}
                        onClick={() => handleComplete(event)}
                        className="text-green-600 font-medium"
                      >
                        Completar
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item
                      icon={FaEdit}
                      onClick={() => handleOpenModal(event)}
                    >
                      Editar
                    </Dropdown.Item>
                    <Dropdown.Item
                      icon={FaTrash}
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600"
                    >
                      Eliminar
                    </Dropdown.Item>
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Modal Form */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          {editingEvent ? 'Editar Mantenimiento' : 'Programar Mantenimiento'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label value="Título" />
              <TextInput
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej. Mantenimiento Preventivo Q1"
              />
            </div>
            <div>
              <Label value="Descripción" />
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label value="Fecha Programada" />
                <TextInput
                  type="datetime-local"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label value="Proveedor" />
                <TextInput
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>

            {/* Recurrence Section */}
            {(!editingEvent || (editingEvent && !editingEvent.isRecurring)) && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="isRecurring" className="cursor-pointer">
                    ¿Repetir evento?
                  </Label>
                </div>

                {formData.isRecurring && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label value="Periodicidad" />
                      <Select
                        required={formData.isRecurring}
                        value={formData.recurrence}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrence: e.target.value,
                          })
                        }
                      >
                        <option value="">Seleccione...</option>
                        <option value="DAILY">Diario</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="MONTHLY">Mensual</option>
                        <option value="BIMONTHLY">Bimestral</option>
                        <option value="QUARTERLY">Trimestral</option>
                        <option value="QUADRIMESTRAL">Cuatrimestral</option>
                        <option value="SEMIANNUAL">Semestral</option>
                        <option value="YEARLY">Anual</option>
                      </Select>
                    </div>
                    <div>
                      <Label value="Termina el" />
                      <TextInput
                        type="date"
                        required={formData.isRecurring}
                        value={formData.recurrenceEndDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrenceEndDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {editingEvent && editingEvent.isRecurring && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                Este evento es parte de una serie recurrente.
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="removeRecurrence"
                    checked={!formData.isRecurring}
                    onChange={(e) => {
                      // If checked (remove recurrence), set isRecurring false
                      setFormData({
                        ...formData,
                        isRecurring: !e.target.checked,
                      });
                    }}
                  />
                  <Label htmlFor="removeRecurrence" className="cursor-pointer">
                    Quitar repetición (esto eliminará los eventos futuros de
                    esta serie)
                  </Label>
                </div>
              </div>
            )}

            {/* SCOPE & ATTENDEES */}
            <div className="border-t pt-4 mt-2">
              <Label
                value="Alcance y Notificaciones"
                className="text-sm font-bold text-gray-700 mb-2 block"
              />

              <div className="flex gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="scope-global"
                    checked={formData.scope === 'GLOBAL'}
                    onChange={() =>
                      setFormData({ ...formData, scope: 'GLOBAL' })
                    }
                  />
                  <Label htmlFor="scope-global">Global (Todos)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="scope-specific"
                    checked={formData.scope === 'SPECIFIC'}
                    onChange={() =>
                      setFormData({ ...formData, scope: 'SPECIFIC' })
                    }
                  />
                  <Label htmlFor="scope-specific">Específico</Label>
                </div>
              </div>

              {formData.scope === 'SPECIFIC' && (
                <div className="mt-2">
                  <Label
                    className="mb-2 block"
                    value="Selecciona los participantes:"
                  />
                  <SearchableSelect
                    options={userOptions}
                    value={formData.attendeeIds}
                    onChange={(val) =>
                      setFormData({ ...formData, attendeeIds: val })
                    }
                    multiple
                    renderOption={renderUserOption}
                    placeholder="Buscar usuario..."
                  />
                </div>
              )}
            </div>
            {editingEvent && (
              <div>
                <Label value="Estado" />
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="SCHEDULED">Programado</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="POSTPONED">Postergado</option>
                  <option value="CANCELLED">Cancelado</option>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" gradientDuoTone="purpleToBlue">
                Guardar
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MaintenanceAgenda;
