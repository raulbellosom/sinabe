import { useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);
dayjs.locale('es');

const AgendaCalendar = ({
  events = [],
  currentDate,
  onDateChange,
  onEventClick,
  onSlotClick,
  view = 'month',
}) => {
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = dayjs(currentDate).startOf('month').day();

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-[color:var(--success-soft)] text-[color:var(--success)] border-[color:var(--success)]/30';
      case 'CANCELLED':
        return 'bg-[color:var(--danger-soft)] text-[color:var(--danger)] border-[color:var(--danger)]/30';
      case 'POSTPONED':
        return 'bg-[color:var(--warning-soft)] text-[color:var(--warning)] border-[color:var(--warning)]/30';
      default:
        return 'bg-[color:var(--info-soft)] text-[color:var(--info)] border-[color:var(--info)]/30';
    }
  };

  const getTypeAccent = (type) =>
    type === 'GENERAL' ? 'border-l-purple-500' : 'border-l-[color:var(--info)]';

  const currentEvents = useMemo(() => events, [events]);

  const getEventsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return currentEvents.filter(
      (ev) => dayjs(ev.scheduledDate).format('YYYY-MM-DD') === dateStr,
    );
  };

  // --- MONTH VIEW ---
  const renderMonthView = () => {
    const blanks = Array.from({ length: firstDayOfMonth }).map((_, i) => (
      <div
        key={`blank-${i}`}
        className="min-h-[110px] border-b border-r border-[color:var(--border)]/50 bg-[color:var(--surface-muted)]/30"
      />
    ));

    const monthDays = Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const date = dayjs(currentDate).date(day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.isSame(dayjs(), 'day');
      const isPast = date.isBefore(dayjs(), 'day');
      const hasOverflow = dayEvents.length > 2;

      return (
        <div
          key={`day-${day}`}
          className={classNames(
            'min-h-[110px] border-b border-r border-[color:var(--border)]/50 p-1.5 cursor-pointer relative group/cell',
            'transition-colors hover:bg-[color:var(--primary)]/5',
            isToday &&
              'bg-[color:var(--primary)]/5 ring-1 ring-inset ring-[color:var(--primary)]/20',
            isPast && !isToday && 'opacity-75',
          )}
          onClick={() => onSlotClick(date)}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={classNames(
                'text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center transition-colors',
                isToday
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm shadow-[color:var(--primary)]/30'
                  : 'text-[color:var(--foreground-muted)] group-hover/cell:text-[color:var(--foreground)]',
              )}
            >
              {day}
            </span>
            <button
              className="opacity-0 group-hover/cell:opacity-100 transition-opacity text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] p-0.5 rounded-md hover:bg-[color:var(--primary)]/20 flex items-center justify-center w-5 h-5 font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(date);
              }}
            >
              +
            </button>
          </div>

          {/* Collapsed events (visible by default) */}
          <div
            className={classNames(
              'flex flex-col gap-0.5 overflow-hidden',
              hasOverflow ? 'max-h-[56px]' : '',
              hasOverflow && 'group-hover/cell:hidden',
            )}
          >
            {dayEvents
              .slice(0, hasOverflow ? 2 : dayEvents.length)
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(ev);
                  }}
                  className={classNames(
                    'text-[10px] leading-tight px-1.5 py-0.5 rounded-md border-l-[3px] truncate cursor-pointer transition-colors hover:brightness-95',
                    getStatusColor(ev.status),
                    getTypeAccent(ev.type),
                  )}
                  title={`${ev.title} - ${ev.provider || 'Sin proveedor'}`}
                >
                  <span className="font-semibold hidden md:inline">
                    {ev.vertical?.name || 'General'}{' '}
                  </span>
                  <span className="opacity-90">{ev.title}</span>
                </div>
              ))}
            {hasOverflow && (
              <span className="text-[9px] text-[color:var(--foreground-muted)] font-medium pl-1 group-hover/cell:hidden">
                +{dayEvents.length - 2} más
              </span>
            )}
          </div>

          {/* Expanded floating card (visible on hover when overflow) */}
          {hasOverflow && (
            <div className="hidden group-hover/cell:block absolute top-0 left-0 right-0 z-40 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl shadow-xl shadow-black/15 p-1.5 min-h-full animate-[expandCell_150ms_ease-out]">
              <div className="flex justify-between items-start mb-1">
                <span
                  className={classNames(
                    'text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center',
                    isToday
                      ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm shadow-[color:var(--primary)]/30'
                      : 'text-[color:var(--foreground)]',
                  )}
                >
                  {day}
                </span>
                <button
                  className="text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] p-0.5 rounded-md hover:bg-[color:var(--primary)]/20 flex items-center justify-center w-5 h-5 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick(date);
                  }}
                >
                  +
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(ev);
                    }}
                    className={classNames(
                      'text-[10px] leading-tight px-1.5 py-0.5 rounded-md border-l-[3px] truncate cursor-pointer transition-colors hover:brightness-95',
                      getStatusColor(ev.status),
                      getTypeAccent(ev.type),
                    )}
                    title={`${ev.title} - ${ev.provider || 'Sin proveedor'}`}
                  >
                    <span className="font-semibold hidden md:inline">
                      {ev.vertical?.name || 'General'}{' '}
                    </span>
                    <span className="opacity-90">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] overflow-visible shadow-sm">
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-[color:var(--border)] bg-[color:var(--surface-muted)] rounded-t-xl overflow-hidden">
          {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-[11px] font-bold text-[color:var(--foreground-muted)] uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 relative">
          {blanks}
          {monthDays}
        </div>
      </div>
    );
  };

  // --- WEEK VIEW ---
  const renderWeekView = () => {
    const startOfWeek = dayjs(currentDate).startOf('week');
    const weekDays = Array.from({ length: 7 }).map((_, i) =>
      startOfWeek.add(i, 'day'),
    );
    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const CELL_HEIGHT = 60;

    return (
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden shadow-sm flex flex-col h-[600px]">
        {/* Header Row */}
        <div className="flex border-b border-[color:var(--border)]">
          <div className="w-14 flex-shrink-0 border-r border-[color:var(--border)]/50 bg-[color:var(--surface-muted)]" />
          <div className="flex-1 grid grid-cols-7 divide-x divide-[color:var(--border)]/50">
            {weekDays.map((date, i) => {
              const isToday = date.isSame(dayjs(), 'day');
              return (
                <div
                  key={i}
                  className={classNames(
                    'py-3 text-center transition-colors',
                    isToday
                      ? 'bg-[color:var(--primary)]/10'
                      : 'bg-[color:var(--surface-muted)]',
                  )}
                >
                  <div className="text-[10px] uppercase text-[color:var(--foreground-muted)] font-medium">
                    {date.format('ddd')}
                  </div>
                  <div
                    className={classNames(
                      'text-lg font-semibold mt-0.5',
                      isToday
                        ? 'text-[color:var(--primary)]'
                        : 'text-[color:var(--foreground)]',
                    )}
                  >
                    {date.date()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="flex relative min-h-[1440px]">
            {/* Time Labels */}
            <div className="w-14 flex-shrink-0 border-r border-[color:var(--border)]/50 bg-[color:var(--surface)] select-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative border-b border-[color:var(--border)]/30 text-right pr-2 text-[11px] text-[color:var(--foreground-muted)]"
                  style={{ height: `${CELL_HEIGHT}px` }}
                >
                  <span className="-top-2.5 relative">
                    {hour === 0 ? '' : `${hour}:00`}
                  </span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-[color:var(--border)]/30 relative">
              {/* Hour lines */}
              <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-[color:var(--border)]/30 w-full"
                    style={{ height: `${CELL_HEIGHT}px` }}
                  />
                ))}
              </div>

              {weekDays.map((date, colIndex) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.isSame(dayjs(), 'day');

                return (
                  <div
                    key={colIndex}
                    className={classNames(
                      'relative h-full transition-colors z-10',
                      isToday && 'bg-[color:var(--primary)]/[0.03]',
                    )}
                    onClick={() => onSlotClick(date)}
                  >
                    {dayEvents.map((ev) => {
                      const eventTime = dayjs(ev.scheduledDate);
                      const startHour = eventTime.hour();
                      const startMin = eventTime.minute();
                      const top =
                        startHour * CELL_HEIGHT + (startMin / 60) * CELL_HEIGHT;

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(ev);
                          }}
                          className={classNames(
                            'absolute left-0.5 right-0.5 rounded-md border-l-[3px] cursor-pointer overflow-hidden p-1.5 hover:z-50 hover:shadow-lg transition-all text-xs',
                            getStatusColor(ev.status),
                            getTypeAccent(ev.type),
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${CELL_HEIGHT}px`,
                          }}
                          title={`${ev.title} (${eventTime.format('HH:mm')})`}
                        >
                          <div className="font-bold truncate leading-tight">
                            {ev.title}
                          </div>
                          <div className="truncate opacity-70 text-[10px] mt-0.5">
                            {eventTime.format('HH:mm')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- LIST VIEW ---
  const renderListView = () => {
    const eventsByDay = {};
    const sortedEvents = [...currentEvents].sort(
      (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate),
    );

    sortedEvents.forEach((ev) => {
      const dayStr = dayjs(ev.scheduledDate).format('YYYY-MM-DD');
      if (!eventsByDay[dayStr]) eventsByDay[dayStr] = [];
      eventsByDay[dayStr].push(ev);
    });

    const dates = Object.keys(eventsByDay);

    if (dates.length === 0) {
      return (
        <div className="p-12 text-center text-[color:var(--foreground-muted)] bg-[color:var(--surface)] rounded-xl border border-dashed border-[color:var(--border)]">
          <Clock className="mx-auto mb-3 opacity-40" size={40} />
          <p className="text-sm font-medium">
            No hay eventos programados en este rango.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {dates.map((dateStr) => {
          const date = dayjs(dateStr);
          const daysEvents = eventsByDay[dateStr];
          const isToday = date.isSame(dayjs(), 'day');

          return (
            <div
              key={dateStr}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden shadow-sm"
            >
              <div
                className={classNames(
                  'px-4 py-2.5 border-b border-[color:var(--border)] flex justify-between items-center',
                  isToday
                    ? 'bg-[color:var(--primary)]/10'
                    : 'bg-[color:var(--surface-muted)]',
                )}
              >
                <div className="font-bold text-[color:var(--foreground)] capitalize flex items-center gap-2 text-sm">
                  {date.format('dddd D, MMMM YYYY')}
                  {isToday && (
                    <span className="text-[10px] bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-2 py-0.5 rounded-full font-bold">
                      HOY
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onSlotClick(date)}
                  className="text-xs text-[color:var(--primary)] hover:text-[color:var(--primary)] font-semibold hover:bg-[color:var(--primary)]/10 px-2 py-1 rounded-md transition-colors"
                >
                  + Agregar
                </button>
              </div>
              <div className="divide-y divide-[color:var(--border)]/50">
                {daysEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="px-4 py-3 hover:bg-[color:var(--surface-muted)]/50 flex items-center gap-4 cursor-pointer transition-colors group"
                    onClick={() => onEventClick(ev)}
                  >
                    {/* Time */}
                    <div className="w-14 text-center flex-shrink-0">
                      <div className="text-sm font-bold text-[color:var(--foreground)]">
                        {dayjs(ev.scheduledDate).format('HH:mm')}
                      </div>
                      <div className="text-[10px] text-[color:var(--foreground-muted)]">
                        hrs
                      </div>
                    </div>

                    {/* Indicator */}
                    <div
                      className={classNames(
                        'w-1 h-10 rounded-full flex-shrink-0',
                        ev.type === 'GENERAL'
                          ? 'bg-purple-500'
                          : 'bg-[color:var(--info)]',
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[color:var(--foreground)] group-hover:text-[color:var(--primary)] transition-colors truncate">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[color:var(--foreground-muted)] mt-0.5">
                        <span>{ev.vertical?.name || 'Evento General'}</span>
                        {ev.provider && (
                          <>
                            <span className="opacity-40">|</span>
                            <span>{ev.provider}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={classNames(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border flex-shrink-0',
                        getStatusColor(ev.status),
                      )}
                    >
                      {{
                        SCHEDULED: 'Programado',
                        COMPLETED: 'Completado',
                        POSTPONED: 'Postergado',
                        CANCELLED: 'Cancelado',
                        OVERDUE: 'Vencido',
                      }[ev.status] || ev.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              onDateChange(
                currentDate.subtract(1, view === 'week' ? 'week' : 'month'),
              )
            }
            className="p-2 rounded-lg hover:bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-sm md:text-lg font-bold text-[color:var(--foreground)] capitalize min-w-[160px] text-center">
            {view === 'week'
              ? `Semana ${currentDate.week()} — ${currentDate.format('MMM YYYY')}`
              : currentDate.format('MMMM YYYY')}
          </h2>
          <button
            onClick={() =>
              onDateChange(
                currentDate.add(1, view === 'week' ? 'week' : 'month'),
              )
            }
            className="p-2 rounded-lg hover:bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={() => onDateChange(dayjs())}
          className="text-xs text-[color:var(--primary)] font-semibold hover:bg-[color:var(--primary)]/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          Volver a Hoy
        </button>
      </div>

      {/* Dynamic View Render */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'list' && renderListView()}
    </div>
  );
};

export default AgendaCalendar;
