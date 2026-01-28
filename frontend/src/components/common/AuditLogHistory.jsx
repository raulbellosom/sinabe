import React, { useState } from 'react';
import { Timeline, Pagination } from 'flowbite-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { FaUser, FaClock } from 'react-icons/fa';
import dayjs from 'dayjs';

const AuditLogHistory = ({ entityType, entityId }) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: logs, isLoading } = useAuditLogs({
    entityType,
    entityId,
    limit,
    // Add pagination params if backend supports it later
  });

  const formatChanges = (changes) => {
    if (!changes) return null;
    try {
      const parsed =
        typeof changes === 'string' ? JSON.parse(changes) : changes;

      // Extract Context
      const { eventTitle, ...otherChanges } = parsed || {};

      return (
        <div className="text-sm mt-1">
          {eventTitle && (
            <div className="font-semibold text-sinabe-purple-dark mb-1">
              Evento: {eventTitle}
            </div>
          )}
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto text-gray-700">
            {JSON.stringify(otherChanges, null, 2)}
          </pre>
        </div>
      );
    } catch (e) {
      return <span className="text-xs text-red-500">Error parsing log</span>;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-600';
      case 'UPDATE':
        return 'text-blue-600';
      case 'DELETE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading)
    return <div className="p-4 text-center">Cargando historial...</div>;
  if (!logs || logs.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        No hay historial registrado.
      </div>
    );

  return (
    <div className="p-2">
      <Timeline>
        {logs.map((log) => (
          <Timeline.Item key={log.id}>
            <Timeline.Point icon={FaClock} />
            <Timeline.Content>
              <Timeline.Time className="flex items-center gap-2">
                {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')}
                <span className="text-sm font-normal text-gray-500 flex items-center gap-1">
                  <FaUser size={10} /> {log.user?.firstName}{' '}
                  {log.user?.lastName}
                </span>
              </Timeline.Time>
              <Timeline.Title className={getActionColor(log.action)}>
                {log.action} - {log.entityType || entityType}
              </Timeline.Title>
              <Timeline.Body>{formatChanges(log.changes)}</Timeline.Body>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default AuditLogHistory;
