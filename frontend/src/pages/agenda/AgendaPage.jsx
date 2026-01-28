import React, { useState } from 'react';
import {
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Badge,
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
import {
  FaPlus,
  FaCalendarAlt,
  FaList,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUser,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import Notifies from '../../components/Notifies/Notifies';
import AgendaCalendar from '../../components/Verticals/AgendaCalendar';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import SearchableSelect from '../../components/common/SearchableSelect';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

// Helpers
const getStatusBadge = (status) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge color="success">Completado</Badge>;
    case 'CANCELLED':
      return <Badge color="failure">Cancelado</Badge>;
    case 'POSTPONED':
      return <Badge color="warning">Postergado</Badge>;
    case 'SCHEDULED':
    default:
      return <Badge color="info">Programado</Badge>;
  }
};

const AgendaPage = () => {
  const { user } = useAuthStatus();
  const [currentDate, setCurrentDate] = useState(dayjs());
  // Initialize viewMode from localStorage or default to 'month'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('agendaViewMode') || 'month';
  });

  // Persist viewMode changes
  React.useEffect(() => {
    localStorage.setItem('agendaViewMode', viewMode);
  }, [viewMode]);

  // Filters
  const [filters, setFilters] = useState({});

  const { data: events, isLoading, refetch } = useEvents(filters);
  const { data: verticals } = useVerticals();
  const { data: users } = useUsersList();

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

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

  const handleViewEvent = (event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    provider: '',
    verticalId: '',
    status: 'SCHEDULED', // SCHEDULED, COMPLETED, etc.
    type: 'MAINTENANCE', // MAINTENANCE | GENERAL
    scope: 'GLOBAL', // GLOBAL | SPECIFIC
    attendeeIds: [], // array of user IDs
    isRecurring: false,
    recurrence: '',
    recurrenceEndDate: '',
  });

  const resetForm = (date = null) => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: date
        ? dayjs(date).format('YYYY-MM-DDTHH:mm')
        : dayjs().format('YYYY-MM-DDTHH:mm'),
      provider: '',
      verticalId: '',
      status: 'SCHEDULED',
      type: 'MAINTENANCE',
      scope: 'GLOBAL',
      attendeeIds: [],
      isRecurring: false,
      recurrence: '',
      recurrenceEndDate: '',
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
        verticalId: event.verticalId || '',
        status: event.status,
        type: event.type || 'MAINTENANCE',
        scope: event.scope || 'GLOBAL',
        attendeeIds: event.attendees?.map((a) => a.userId) || [],
        isRecurring: event.isRecurring,
        recurrence: event.recurrence || '',
        recurrenceEndDate: event.recurrenceEndDate || '',
      });
    } else {
      resetForm(date);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (formData.type === 'MAINTENANCE' && !formData.verticalId) {
      return Notifies('error', 'El mantenimiento requiere una vertical.');
    }
    if (formData.scope === 'SPECIFIC' && formData.attendeeIds.length === 0) {
      return Notifies(
        'error',
        'Seleccione al menos un asistente para eventos específicos.',
      );
    }

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, data: formData });
        Notifies('success', 'Evento actualizado');
      } else {
        await createEvent.mutateAsync({ ...formData });
        Notifies('success', 'Evento creado');
      }
      setShowModal(false);
      refetch();
    } catch (error) {
      Notifies('error', 'Error al guardar evento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este evento permanentemente?')) return;
    try {
      await deleteEvent.mutateAsync(id);
      Notifies('success', 'Evento eliminado');
      setShowModal(false); // If called from modal
      refetch();
    } catch (error) {
      Notifies('error', 'Error al eliminar');
    }
  };

  const toggleAttendee = (userId) => {
    setFormData((prev) => {
      const exists = prev.attendeeIds.includes(userId);
      return {
        ...prev,
        attendeeIds: exists
          ? prev.attendeeIds.filter((id) => id !== userId)
          : [...prev.attendeeIds, userId],
      };
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Agenda & Eventos
          </h1>
          <p className="text-gray-500 text-sm">
            Calendario global de mantenimientos y actividades
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0 items-center">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1 mr-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${viewMode === 'month' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${viewMode === 'week' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Lista
            </button>
          </div>
          <ActionButtons
            extraActions={[
              {
                label: 'Evento',
                action: () => handleOpenModal(null, new Date()),
                icon: FaPlus,
                color: 'indigo',
                filled: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Helper Legend */}
      <div className="flex gap-4 text-xs px-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Mantenimiento
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border-l-2 border-purple-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">General</span>
        </div>
      </div>

      {/* Calendar Component */}
      <AgendaCalendar
        events={events || []}
        view={viewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onEventClick={handleViewEvent}
        onSlotClick={(date) => handleOpenModal(null, date)}
      />

      {/* CREATE/EDIT MODAL */}
      <Modal show={showModal} size="xl" onClose={() => setShowModal(false)}>
        <Modal.Header>
          {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div className="flex gap-4 mb-4">
              <div
                onClick={() =>
                  setFormData({ ...formData, type: 'MAINTENANCE' })
                }
                className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all text-center ${formData.type === 'MAINTENANCE' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="font-semibold block">Mantenimiento</span>
                <span className="text-xs opacity-75">Vinculado a Vertical</span>
              </div>
              <div
                onClick={() =>
                  setFormData({ ...formData, type: 'GENERAL', verticalId: '' })
                }
                className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all text-center ${formData.type === 'GENERAL' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="font-semibold block">General</span>
                <span className="text-xs opacity-75">Evento General</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label value="Título" className="mb-1 block" />
                <TextInput
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ej. Revisión Trimestral"
                />
              </div>
              <div>
                <Label value="Fecha y Hora" className="mb-1 block" />
                <TextInput
                  type="datetime-local"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                />
              </div>
            </div>

            {formData.type === 'MAINTENANCE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label value="Vertical" className="mb-1 block" />
                  <Select
                    required
                    value={formData.verticalId}
                    onChange={(e) =>
                      setFormData({ ...formData, verticalId: e.target.value })
                    }
                  >
                    <option value="">Seleccione...</option>
                    {verticals?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label value="Proveedor" className="mb-1 block" />
                  <TextInput
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData({ ...formData, provider: e.target.value })
                    }
                    placeholder="Nombre del proveedor"
                  />
                </div>
              </div>
            )}

            {/* Status Selection */}
            <div>
              <Label value="Estado" className="mb-1 block" />
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

            <div>
              <Label value="Descripción" className="mb-1 block" />
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detalles adicionales..."
              />
            </div>

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

            {/* ACTIONS */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              {editingEvent && (
                <Button
                  color="failure"
                  size="sm"
                  onClick={() => handleDelete(editingEvent.id)}
                >
                  Eliminar Evento
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button color="gray" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" gradientDuoTone="purpleToBlue">
                  {editingEvent ? 'Actualizar' : 'Crear Evento'}
                </Button>
              </div>
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
                {viewingEvent.attendees && viewingEvent.attendees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge color="indigo">
                      {viewingEvent.attendees.length} Usuarios seleccionados
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

export default AgendaPage;
