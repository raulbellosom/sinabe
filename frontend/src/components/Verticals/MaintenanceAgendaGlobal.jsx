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
} from 'flowbite-react';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../../hooks/useEvents';
import { useVerticals } from '../../hooks/useVerticals';
import { useUsersList } from '../../hooks/useUsersList';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import {
  FaPlus,
  FaCheck,
  FaTrash,
  FaEdit,
  FaCalendarAlt,
  FaList,
  FaCheckCircle,
  FaUser,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import Notifies from '../Notifies/Notifies';
import AgendaCalendar from './AgendaCalendar';
import ActionButtons from '../ActionButtons/ActionButtons';
import SearchableSelect from '../common/SearchableSelect';

const MaintenanceAgendaGlobal = () => {
  const { user } = useAuthStatus();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'

  const {
    data: events,
    isLoading,
    refetch,
  } = useEvents({ type: 'MAINTENANCE' }); // Fetch all
  const { data: verticals } = useVerticals();
  const { data: users } = useUsersList();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    provider: '',
    verticalId: '',
    status: 'SCHEDULED', // Added status to initial state
    isRecurring: false,
    recurrence: '',
    scope: 'GLOBAL',
    participants: [],
  });

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

  const handleViewEvent = (event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  const resetForm = (date = null) => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: date ? dayjs(date).format('YYYY-MM-DDTHH:mm') : '',
      provider: '',
      verticalId: verticals?.[0]?.id || '',
      status: 'SCHEDULED',
      isRecurring: false,
      recurrence: '',
      scope: 'GLOBAL',
      participants: [],
    });
    setEditingEvent(null);
  };

  const handleOpenModal = (event = null, date = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        scheduledDate: dayjs(event.scheduledDate).format('YYYY-MM-DDTHH:mm'),
        provider: event.provider || '',
        verticalId: event.verticalId,
        status: event.status,
        isRecurring: event.isRecurring,
        recurrence: event.recurrence || '',
        scope: event.scope || 'GLOBAL',
        participants: event.participants?.map((p) => p.userId) || [],
      });
    } else {
      resetForm(date);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.verticalId) {
      return Notifies('error', 'Selecciona una vertical');
    }

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, data: formData });
        Notifies('success', 'Mantenimiento actualizado');
      } else {
        await createEvent.mutateAsync({
          ...formData,
          type: 'MAINTENANCE',
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
    if (event.status === 'COMPLETED') return;
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

  return (
    <div className="space-y-4 p-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <FaCalendarAlt className="text-xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Agenda Global
            </h3>
            <p className="text-xs text-gray-500">Gestión de mantenimientos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaCalendarAlt className="inline mr-2" /> Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaList className="inline mr-2" /> Lista
            </button>
          </div>
          <ActionButtons
            extraActions={[
              {
                label: 'Nuevo',
                action: () => handleOpenModal(null, new Date()),
                icon: FaPlus,
                color: 'indigo',
                filled: true,
              },
            ]}
          />
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'calendar' ? (
        <AgendaCalendar
          events={events}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={handleViewEvent}
          onSlotClick={(date) => handleOpenModal(null, date)}
        />
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Fecha</Table.HeadCell>
              <Table.HeadCell>Vertical</Table.HeadCell>
              <Table.HeadCell>Título</Table.HeadCell>
              <Table.HeadCell>Proveedor</Table.HeadCell>
              <Table.HeadCell>Estado</Table.HeadCell>
              <Table.HeadCell>Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {isLoading && (
                <Table.Row>
                  <Table.Cell colSpan={6}>Cargando...</Table.Cell>
                </Table.Row>
              )}
              {!isLoading && events?.length === 0 && (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No hay mantenimientos programados.
                  </Table.Cell>
                </Table.Row>
              )}
              {events?.map((event) => (
                <Table.Row
                  key={event.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {dayjs(event.scheduledDate).format('DD/MM/YYYY HH:mm')}
                  </Table.Cell>
                  <Table.Cell>{event.vertical?.name || '-'}</Table.Cell>
                  <Table.Cell>{event.title}</Table.Cell>
                  <Table.Cell>{event.provider || '-'}</Table.Cell>
                  <Table.Cell>{getStatusBadge(event.status)}</Table.Cell>
                  <Table.Cell>
                    <ActionButtons
                      onEdit={() => handleOpenModal(event)}
                      onRemove={() => handleDelete(event.id)}
                      extraActions={
                        event.status !== 'COMPLETED'
                          ? [
                              {
                                label: 'Completar',
                                action: () => handleComplete(event),
                                icon: FaCheckCircle,
                                color: 'success',
                              },
                            ]
                          : []
                      }
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Modal Form */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          {editingEvent ? 'Editar Mantenimiento' : 'Programar Mantenimiento'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label value="Vertical" />
              <Select
                required
                value={formData.verticalId}
                onChange={(e) =>
                  setFormData({ ...formData, verticalId: e.target.value })
                }
              >
                <option value="">Seleccione una vertical</option>
                {verticals?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </div>
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

            {/* Alcance y Notificaciones */}
            <div>
              <Label className="mb-2 block" value="Alcance y Notificaciones" />
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
                  <Label htmlFor="scope-specific">
                    Específico (Seleccionar usuarios)
                  </Label>
                </div>
              </div>

              {formData.scope === 'SPECIFIC' && (
                <SearchableSelect
                  label="Selecciona los participantes:"
                  placeholder="Buscar usuario..."
                  options={userOptions}
                  value={formData.participants}
                  onChange={(val) =>
                    setFormData({ ...formData, participants: val })
                  }
                  multiple
                  renderOption={renderUserOption}
                />
              )}
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

      {/* View Details Modal */}
      <Modal show={showViewModal} onClose={() => setShowViewModal(false)}>
        <Modal.Header>Detalles del Evento</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewingEvent?.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <Badge color="gray">
                  {viewingEvent?.vertical?.name || 'General'}
                </Badge>
                {viewingEvent && getStatusBadge(viewingEvent.status)}
              </div>
            </div>

            {viewingEvent?.description && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {viewingEvent.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Fecha y Hora
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {dayjs(viewingEvent?.scheduledDate).format(
                      'ddd D MMM, YYYY - h:mm A',
                    )}
                  </p>
                </div>
              </div>

              {viewingEvent?.provider && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <FaList />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Proveedor
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingEvent.provider}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {viewingEvent?.scope === 'SPECIFIC' && (
              <div>
                <Label
                  className="mb-2 block text-xs uppercase text-gray-500"
                  value="Participantes"
                />
                {viewingEvent.participants &&
                viewingEvent.participants.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge color="indigo">
                      {viewingEvent.participants.length} Usuarios seleccionados
                    </Badge>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    Sin participantes asignados
                  </span>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-between">
          <Button color="gray" onClick={() => setShowViewModal(false)}>
            Cerrar
          </Button>
          {user?.id === viewingEvent?.createdById && (
            <Button
              gradientDuoTone="purpleToBlue"
              onClick={() => {
                setShowViewModal(false);
                handleOpenModal(viewingEvent);
              }}
            >
              <FaEdit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MaintenanceAgendaGlobal;
