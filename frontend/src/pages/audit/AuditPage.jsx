import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaHistory,
} from 'react-icons/fa';
import {
  MdOutlineCompareArrows,
  MdVisibility,
  MdExpandMore,
  MdExpandLess,
  MdOutlineDelete,
  MdOutlineEdit,
  MdAddCircleOutline,
} from 'react-icons/md';
import { getAuditLogs } from '../../services/audit.api';
import { useUsersList } from '../../hooks/useUsersList';

import LoadingModal from '../../components/loadingModal/LoadingModal';

const AuditPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const limit = 20;
  const [expandedRow, setExpandedRow] = useState(null);

  // Fetch Logs
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn: () => getAuditLogs({ ...filters, page, limit }),
    keepPreviousData: true,
  });

  // Fetch Users for Filter
  const { data: users = [] } = useUsersList();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      entityType: '',
      userId: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const renderActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return <MdAddCircleOutline className="text-green-500" size={20} />;
      case 'UPDATE':
        return <MdOutlineEdit className="text-blue-500" size={20} />;
      case 'DELETE':
        return <MdOutlineDelete className="text-red-500" size={20} />;
      default:
        return <FaHistory className="text-gray-500" size={20} />;
    }
  };

  const renderActionBadge = (action) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (action === 'CREATE') colorClass = 'bg-green-100 text-green-800';
    if (action === 'UPDATE') colorClass = 'bg-blue-100 text-blue-800';
    if (action === 'DELETE') colorClass = 'bg-red-100 text-red-800';

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
      >
        {action}
      </span>
    );
  };

  const DiffViewer = ({ changes }) => {
    if (!changes)
      return <p className="text-gray-500 text-sm">No details recorded.</p>;

    // Helper to safely parse JSON, handling potential double-stringification
    const parseChanges = (data) => {
      try {
        let parsed = data;
        // Check if it's a string that looks like JSON
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        // If it's STILL a string (double stringified), parse again
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing changes:', e);
        return {};
      }
    };

    const diff = parseChanges(changes);

    if (!diff || typeof diff !== 'object' || Object.keys(diff).length === 0)
      return <p>No changes detected.</p>;

    const formatValue = (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return val ? 'True' : 'False';
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          // Handle arrays (e.g., attendees) logic
          if (val.length === 0) return '[]';
          // If it's an array of objects, try to show names or emails
          if (typeof val[0] === 'object') {
            return val
              .map(
                (item) =>
                  item.email || item.name || item.title || JSON.stringify(item),
              )
              .join(', ');
          }
          return val.join(', ');
        }
        // Handle single objects
        return JSON.stringify(val);
      }
      return String(val);
    };

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 text-sm">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <MdOutlineCompareArrows /> Detalles del Cambio
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-1 min-w-[100px]">Campo</th>
                <th className="py-1 min-w-[150px] text-red-600">Anterior</th>
                <th className="py-1 min-w-[150px] text-green-600">Nuevo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(diff).map(([key, value]) => {
                const oldVal = value?.old !== undefined ? value.old : 'N/A';
                const newVal = value?.new !== undefined ? value.new : value;

                // Snapshot case (no old/new structure)
                if (value?.old === undefined && value?.new === undefined) {
                  return (
                    <tr
                      key={key}
                      className="border-b last:border-0 hover:bg-gray-100"
                    >
                      <td className="py-2 font-medium text-gray-700">{key}</td>
                      <td className="py-2 text-gray-600" colSpan={2}>
                        {formatValue(value)}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={key}
                    className="border-b last:border-0 hover:bg-gray-100"
                  >
                    <td className="py-2 font-medium text-gray-700">{key}</td>
                    <td
                      className="py-2 text-red-500 bg-red-50/50 px-1 rounded max-w-[300px] break-words"
                      title={formatValue(oldVal)}
                    >
                      {formatValue(oldVal)}
                    </td>
                    <td
                      className="py-2 text-green-600 bg-green-50/50 px-1 rounded max-w-[300px] break-words"
                      title={formatValue(newVal)}
                    >
                      {formatValue(newVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Historial de Cambios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Registro centralizado de actividades y cambios en el sistema.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Buscar entidad..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {/* User Filter */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <select
              name="userId"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
              value={filters.userId}
              onChange={handleFilterChange}
            >
              <option value="">Todos los usuarios</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="date"
              name="startDate"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="date"
              name="endDate"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              name="entityType"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
              value={filters.entityType}
              onChange={handleFilterChange}
            >
              <option value="">Todas las Entidades</option>
              <option value="INVENTORY">Inventarios</option>
              <option value="USER">Usuarios</option>
              <option value="VERTICAL">Verticales</option>
              <option value="MODEL">Modelos</option>
              <option value="LOCATION">Ubicaciones</option>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="EVENT">Eventos</option>
              <option value="PURCHASE_ORDER">Órdenes de Compra</option>
              <option value="INVOICE">Facturas</option>
              <option value="INVENTORY_BRAND">Marcas</option>
              <option value="INVENTORY_TYPE">Tipos</option>
              <option value="CONDITION">Condiciones</option>
              <option value="CUSTOM_FIELD">Campos Personalizados</option>
              <option value="PROJECT">Proyectos</option>
              <option value="ROLE">Roles</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary / Clear */}
        {(filters.search ||
          filters.userId ||
          filters.entityType ||
          filters.startDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-600 font-medium underline"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingModal loading={true} />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-red-500">
          Error al cargar los registros de auditoría.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile/Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {data?.data?.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg">
                No se encontraron registros
              </div>
            ) : (
              data?.data?.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {log.user?.photo?.url ? (
                          <img
                            src={log.user.photo.url}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                          {log.user?.firstName} {log.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {renderActionBadge(log.action)}
                  </div>

                  <div className="pl-12">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {log.entityType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {log.entityTitle || `ID: ${log.entityId}`}
                    </p>

                    <button
                      onClick={() =>
                        setExpandedRow(expandedRow === log.id ? null : log.id)
                      }
                      className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors w-full justify-center"
                    >
                      {expandedRow === log.id ? (
                        <>
                          OCULTAR DETALLES <MdExpandLess className="ml-1" />
                        </>
                      ) : (
                        <>
                          VER DETALLES <MdExpandMore className="ml-1" />
                        </>
                      )}
                    </button>

                    {expandedRow === log.id && (
                      <DiffViewer changes={log.changes} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-[#1a1c23] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data?.data?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    data?.data?.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(log.createdAt).toLocaleString('es-MX', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {log.user?.photo?.url ? (
                                  <img
                                    src={log.user.photo.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-gray-500">
                                    {log.user?.firstName?.charAt(0)}
                                    {log.user?.lastName?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {log.user?.firstName} {log.user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {log.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.entityType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {log.entityTitle || log.entityId}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {renderActionBadge(log.action)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() =>
                                setExpandedRow(
                                  expandedRow === log.id ? null : log.id,
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                              title="Ver cambios"
                            >
                              {expandedRow === log.id ? (
                                <MdExpandLess size={20} />
                              ) : (
                                <MdVisibility size={20} />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRow === log.id && (
                          <tr className="bg-gray-50/50">
                            <td colSpan="5" className="px-6 py-4">
                              <DiffViewer changes={log.changes} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Desktop */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <span className="text-sm text-gray-500">
                Mostrando página {data?.meta?.page} de {data?.meta?.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
                >
                  Anterior
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data?.meta?.totalPages || 1, p + 1))
                  }
                  disabled={page >= (data?.meta?.totalPages || 1)}
                  className="px-3 py-1 text-sm border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Pagination Mobile (Simple) */}
          <div className="flex md:hidden justify-center gap-4 mt-4 pb-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded shadow-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="flex items-center text-sm text-gray-600">
              {page} / {data?.meta?.totalPages || 1}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(data?.meta?.totalPages || 1, p + 1))
              }
              disabled={page >= (data?.meta?.totalPages || 1)}
              className="px-4 py-2 bg-white border rounded shadow-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditPage;
