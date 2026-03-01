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
} from '../../components/ui/flowbite';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../../hooks/useEvents';
import { useVerticals } from '../../hooks/useVerticals';
import { useUsersList } from '../../hooks/useUsersList';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import dayjs from 'dayjs';
import Notifies from '../../components/Notifies/Notifies';
import AgendaCalendar from '../../components/Verticals/AgendaCalendar';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import SearchableSelect from '../../components/common/SearchableSelect';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

import {
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle,
  List,
  Pencil,
  Plus,
  Trash2,
  User,
  Clock,
  Users,
  Building,
  Repeat,
  Info,
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('agendaViewMode') || 'month';
  });

  React.useEffect(() => {
    localStorage.setItem('agendaViewMode', viewMode);
  }, [viewMode]);

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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary)]/70 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-[color:var(--primary-foreground)]">
            {option.initials}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[color:var(--foreground)] truncate">
          {option.label}
        </p>
        <p className="text-xs text-[color:var(--foreground-muted)] truncate">
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
    status: 'SCHEDULED',
    type: 'MAINTENANCE',
    scope: 'GLOBAL',
    attendeeIds: [],
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
      setShowModal(false);
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

  const viewOptions = [
    { key: 'month', label: 'Mes', icon: CalendarDays },
    { key: 'week', label: 'Semana', icon: CalendarRange },
    { key: 'list', label: 'Lista', icon: List },
  ];

  return (
    <div className="p-4 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[color:var(--surface)] p-5 rounded-2xl shadow-sm border border-[color:var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--foreground)] flex items-center gap-2">
            <Calendar className="text-[color:var(--primary)]" size={24} />
            Agenda & Eventos
          </h1>
          <p className="text-[color:var(--foreground-muted)] text-sm mt-1">
            Calendario global de mantenimientos y actividades
          </p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-[color:var(--surface-muted)] rounded-xl p-1 gap-0.5">
            {viewOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === key
                    ? 'bg-[color:var(--surface)] shadow-sm text-[color:var(--primary)] border border-[color:var(--border)]'
                    : 'text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <ActionButtons
            extraActions={[
              {
                label: 'Evento',
                action: () => handleOpenModal(null, new Date()),
                icon: Plus,
                color: 'indigo',
                filled: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[color:var(--info-soft)] border-l-[3px] border-l-[color:var(--info)]" />
          <span className="text-[color:var(--foreground-muted)] font-medium">
            Mantenimiento
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-purple-100 dark:bg-purple-900/30 border-l-[3px] border-l-purple-500" />
          <span className="text-[color:var(--foreground-muted)] font-medium">
            General
          </span>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selection */}
            <div className="flex gap-3">
              <div
                onClick={() =>
                  setFormData({ ...formData, type: 'MAINTENANCE' })
                }
                className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                  formData.type === 'MAINTENANCE'
                    ? 'bg-[color:var(--info-soft)] border-[color:var(--info)] text-[color:var(--info)]'
                    : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:border-[color:var(--foreground-muted)]/50 hover:bg-[color:var(--surface-muted)]'
                }`}
              >
                <Building
                  className={`mx-auto mb-1 ${
                    formData.type === 'MAINTENANCE'
                      ? 'text-[color:var(--info)]'
                      : 'text-[color:var(--foreground-muted)]'
                  }`}
                  size={20}
                />
                <span className="font-semibold block text-sm">
                  Mantenimiento
                </span>
                <span className="text-[11px] opacity-75">
                  Vinculado a Vertical
                </span>
              </div>
              <div
                onClick={() =>
                  setFormData({ ...formData, type: 'GENERAL', verticalId: '' })
                }
                className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                  formData.type === 'GENERAL'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                    : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:border-[color:var(--foreground-muted)]/50 hover:bg-[color:var(--surface-muted)]'
                }`}
              >
                <CalendarDays
                  className={`mx-auto mb-1 ${
                    formData.type === 'GENERAL'
                      ? 'text-purple-500'
                      : 'text-[color:var(--foreground-muted)]'
                  }`}
                  size={20}
                />
                <span className="font-semibold block text-sm">General</span>
                <span className="text-[11px] opacity-75">Evento General</span>
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
              <div className="bg-[color:var(--surface-muted)] p-4 rounded-xl border border-[color:var(--border)]">
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
                  <Label htmlFor="isRecurring" className="cursor-pointer flex items-center gap-1.5">
                    <Repeat size={14} className="text-[color:var(--foreground-muted)]" />
                    ¿Repetir evento?
                  </Label>
                </div>

                {formData.isRecurring && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
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
              <div className="bg-[color:var(--warning-soft)] p-4 rounded-xl border border-[color:var(--warning)]/30 text-sm text-[color:var(--warning)]">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Info size={16} />
                  Este evento es parte de una serie recurrente.
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="removeRecurrence"
                    checked={!formData.isRecurring}
                    onChange={(e) => {
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
            <div className="border-t border-[color:var(--border)] pt-4 mt-2">
              <Label
                value="Alcance y Notificaciones"
                className="text-sm font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-1.5"
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
                  <Label htmlFor="scope-global" className="flex items-center gap-1">
                    <Users size={14} className="text-[color:var(--foreground-muted)]" />
                    Global (Todos)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="scope-specific"
                    checked={formData.scope === 'SPECIFIC'}
                    onChange={() =>
                      setFormData({ ...formData, scope: 'SPECIFIC' })
                    }
                  />
                  <Label htmlFor="scope-specific" className="flex items-center gap-1">
                    <User size={14} className="text-[color:var(--foreground-muted)]" />
                    Específico
                  </Label>
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
            <div className="flex justify-between mt-6 pt-4 border-t border-[color:var(--border)]">
              {editingEvent && (
                <Button
                  color="failure"
                  size="sm"
                  onClick={() => handleDelete(editingEvent.id)}
                >
                  <Trash2 size={14} className="mr-1" />
                  Eliminar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button color="gray" onClick={() => setShowModal(false)}>
                  Cancelar
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
          <div className="space-y-5">
            <div>
              <h4 className="text-xl font-bold text-[color:var(--foreground)]">
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
              <div className="bg-[color:var(--surface-muted)] p-4 rounded-xl border border-[color:var(--border)]">
                <p className="text-sm text-[color:var(--foreground-muted)] whitespace-pre-wrap">
                  {viewingEvent.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--surface-muted)] border border-[color:var(--border)]">
                <div className="p-2 bg-[color:var(--info-soft)] text-[color:var(--info)] rounded-lg">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[color:var(--foreground-muted)] uppercase font-bold tracking-wider">
                    Fecha y Hora
                  </p>
                  <p className="text-sm font-medium text-[color:var(--foreground)]">
                    {dayjs(viewingEvent?.scheduledDate).format(
                      'ddd D MMM, YYYY - h:mm A',
                    )}
                  </p>
                </div>
              </div>

              {viewingEvent?.provider && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--surface-muted)] border border-[color:var(--border)]">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Building size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[color:var(--foreground-muted)] uppercase font-bold tracking-wider">
                      Proveedor
                    </p>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">
                      {viewingEvent.provider}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {viewingEvent?.scope === 'SPECIFIC' && (
              <div>
                <Label
                  className="mb-2 block text-[10px] uppercase text-[color:var(--foreground-muted)] font-bold tracking-wider"
                  value="Participantes"
                />
                {viewingEvent.attendees && viewingEvent.attendees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge color="indigo">
                      <Users size={12} className="mr-1" />
                      {viewingEvent.attendees.length} Usuarios seleccionados
                    </Badge>
                  </div>
                ) : (
                  <span className="text-sm text-[color:var(--foreground-muted)] italic">
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
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AgendaPage;
