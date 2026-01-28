import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classNames from 'classnames';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

dayjs.locale('es');

const AgendaCalendar = ({
  events = [],
  currentDate,
  onDateChange,
  onEventClick,
  onSlotClick,
  view = 'month', // 'month', 'week', 'list'
}) => {
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = dayjs(currentDate).startOf('month').day(); // 0 (Sun) - 6 (Sat)

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-500 border-red-100';
      case 'POSTPONED':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const currentEvents = useMemo(() => {
    return events;
  }, [events]);

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
        className="min-h-[100px] border-r border-b bg-gray-50/30"
      ></div>
    ));

    const monthDays = Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const date = dayjs(currentDate).date(day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.isSame(dayjs(), 'day');

      return (
        <div
          key={`day-${day}`}
          className={classNames(
            'min-h-[120px] border-r border-b p-2 transition-colors hover:bg-gray-50 cursor-pointer relative group',
            isToday ? 'bg-blue-50/30' : '',
          )}
          onClick={() => onSlotClick(date)}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={classNames(
                'text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center',
                isToday ? 'bg-indigo-600 text-white' : 'text-gray-700',
              )}
            >
              {day}
            </span>
            <button className="opacity-0 group-hover:opacity-100 text-xs bg-gray-100 p-1 rounded hover:bg-gray-200 text-gray-600 flex items-center justify-center w-6 h-6">
              +
            </button>
          </div>

          <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[90px] custom-scrollbar">
            {dayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(ev);
                }}
                className={classNames(
                  'text-[10px] md:text-xs p-1 rounded border shadow-sm truncate hover:opacity-80 transition-opacity cursor-pointer overflow-hidden',
                  getStatusColor(ev.status),
                  ev.type === 'GENERAL'
                    ? 'border-l-4 border-l-purple-500'
                    : 'border-l-4 border-l-blue-500',
                )}
                title={`${ev.title} - ${ev.provider || 'Sin proveedor'}`}
              >
                <div className="font-semibold truncate hidden md:block">
                  {ev.vertical?.name || 'General'}
                </div>
                <div className="truncate opacity-90">{ev.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    });

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Week Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {blanks}
          {monthDays}
        </div>
      </div>
    );
  };

  // --- WEEK VIEW (TIME GRID) ---
  const renderWeekView = () => {
    const startOfWeek = dayjs(currentDate).startOf('week');
    const weekDays = Array.from({ length: 7 }).map((_, i) =>
      startOfWeek.add(i, 'day'),
    );
    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const CELL_HEIGHT = 60; // px per hour

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-[600px]">
        {/* Header Row (Days) */}
        <div className="flex border-b border-gray-200">
          <div className="w-14 flex-shrink-0 border-r border-gray-100 bg-gray-50"></div>
          {/* Time gutter header */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100">
            {weekDays.map((date, i) => {
              const isToday = date.isSame(dayjs(), 'day');
              return (
                <div
                  key={i}
                  className={classNames(
                    'py-3 text-center transition-colors',
                    isToday
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-700',
                  )}
                >
                  <div className="text-xs uppercase opacity-70">
                    {date.format('ddd')}
                  </div>
                  <div className="text-xl font-medium">{date.date()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Grid Area */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="flex relative min-h-[1440px]">
            {/* Time Labels Column */}
            <div className="w-14 flex-shrink-0 border-r border-gray-100 bg-white select-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative border-b border-gray-50 text-right pr-2 text-xs text-gray-400"
                  style={{ height: `${CELL_HEIGHT}px` }}
                >
                  <span className="-top-2.5 relative">
                    {hour === 0 ? '' : `${hour}:00`}
                  </span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100 relative">
              {/* Background Grid Lines (Horizontal) */}
              <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-gray-100 w-full"
                    style={{ height: `${CELL_HEIGHT}px` }}
                  ></div>
                ))}
              </div>

              {/* Day Columns & Events */}
              {weekDays.map((date, colIndex) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.isSame(dayjs(), 'day');

                return (
                  <div
                    key={colIndex}
                    className={classNames(
                      'relative h-full transition-colors z-10', // z-10 to stay above grid lines
                      isToday ? 'bg-blue-50/10' : '',
                    )}
                    onClick={() => onSlotClick(date)}
                  >
                    {/* Render Events */}
                    {dayEvents.map((ev) => {
                      const eventTime = dayjs(ev.scheduledDate);
                      const startHour = eventTime.hour();
                      const startMin = eventTime.minute();
                      const top =
                        startHour * CELL_HEIGHT + (startMin / 60) * CELL_HEIGHT;
                      const height = CELL_HEIGHT; // Default 1 hour duration

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(ev);
                          }}
                          className={classNames(
                            'absolute left-0.5 right-0.5 rounded border shadow-sm cursor-pointer overflow-hidden p-1 hover:z-50 hover:shadow-md transition-all text-xs',
                            getStatusColor(ev.status),
                            ev.type === 'GENERAL'
                              ? 'border-l-4 border-l-purple-500'
                              : 'border-l-4 border-l-blue-500',
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                          title={`${ev.title} (${eventTime.format('HH:mm')})`}
                        >
                          <div className="font-bold truncate leading-tight">
                            {ev.title}
                          </div>
                          <div className="truncate opacity-80 text-[10px]">
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

  // --- LIST VIEW (AGENDA) ---
  const renderListView = () => {
    // Group events by day
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
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed">
          <p>No hay eventos programados en este rango.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {dates.map((dateStr) => {
          const date = dayjs(dateStr);
          const daysEvents = eventsByDay[dateStr];
          const isToday = date.isSame(dayjs(), 'day');

          return (
            <div
              key={dateStr}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className={classNames(
                  'px-4 py-2 border-b flex justify-between items-center',
                  isToday ? 'bg-indigo-50' : 'bg-gray-50',
                )}
              >
                <div className="font-bold text-gray-700 capitalize flex items-center gap-2">
                  {date.format('dddd D, MMMM YYYY')}
                  {isToday && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Hoy
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onSlotClick(date)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Agregar
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {daysEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 hover:bg-gray-50 flex items-center gap-4 cursor-pointer transition-colors group"
                    onClick={() => onEventClick(ev)}
                  >
                    {/* Time */}
                    <div className="w-16 text-center">
                      <div className="text-sm font-bold text-gray-800">
                        {dayjs(ev.scheduledDate).format('HH:mm')}
                      </div>
                      <div className="text-xs text-gray-400">hrs</div>
                    </div>

                    {/* Indicator */}
                    <div
                      className={classNames(
                        'w-1.5 h-10 rounded-full',
                        ev.type === 'GENERAL' ? 'bg-purple-500' : 'bg-blue-500',
                      )}
                    ></div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{ev.vertical?.name || 'Evento General'}</span>
                        {ev.provider && (
                          <>
                            <span>•</span>
                            <span>{ev.provider}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={classNames(
                        'px-3 py-1 rounded text-xs font-semibold capitalize border',
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
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onDateChange(
                currentDate.subtract(1, view === 'week' ? 'week' : 'month'),
              )
            }
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <FaChevronLeft />
          </button>
          <h2 className="text-sm md:text-xl font-bold text-gray-800 capitalize min-w-[150px] text-center">
            {view === 'week'
              ? `Semana ${currentDate.week()} - ${currentDate.format('MMM YYYY')}`
              : currentDate.format('MMMM YYYY')}
          </h2>
          <button
            onClick={() =>
              onDateChange(
                currentDate.add(1, view === 'week' ? 'week' : 'month'),
              )
            }
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <FaChevronRight />
          </button>
        </div>

        <button
          onClick={() => onDateChange(dayjs())}
          className="text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1 rounded-lg"
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
