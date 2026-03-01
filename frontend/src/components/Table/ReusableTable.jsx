// ReusableTable.jsx

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { Spinner, Dropdown, Checkbox } from '../ui/flowbite';
import classNames from 'classnames';
import ActionButtons from '../ActionButtons/ActionButtons';
import TableResultsNotFound from './TableResultsNotFound';

const ReusableTable = ({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  error = null,

  sortConfig = { key: null, direction: 'asc' },
  onSort = () => {},

  pagination = { currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 10 },
  onPageChange = () => {},
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 20, 30, 50, 100, 0],
  showPagination = true,

  selectable = false,
  selectedRows = {},
  onSelectRow = () => {},
  onSelectAllRows = () => {},

  rowActions = () => [],
  onRowClick = () => {},
  onRowDoubleClick = () => {},

  viewMode = 'table', // 'table' or 'cards'
  cardViewConfig = {
    imageKey: null,
    titleKey: null,
    subtitleKey: null,
  },

  rowClassName = () => '',
  striped = true,
}) => {
  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="opacity-30" />;
    if (sortConfig.direction === 'asc') return <ArrowUp />;
    return <ArrowDown />;
  };

  const renderCell = (row, col) => {
    const value = getNestedValue(row, col.key);
    return col.render ? col.render(value, row) : value || '-';
  };

  const renderActions = (row) => {
    const actions = rowActions(row);
    const mainAction = actions.find((a) => a.key === 'main' && a.action);
    const collapsedActions = actions.filter(
      (a) => a.key !== 'main' && a.action,
    );

    return (
      <div
        className="flex items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {mainAction && (
          <ActionButtons
            extraActions={[
              {
                key: 'main',
                action: mainAction.action,
                icon: mainAction.icon,
                label: mainAction.label,
                color: mainAction.color,
              },
            ]}
          />
        )}
        {collapsedActions.length > 0 && (
          <Dropdown
            inline
            label=""
            arrowIcon={false}
            renderTrigger={() => (
              <button
                type="button"
                className="w-fit p-2 flex items-center justify-center rounded-md border border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] transition-colors"
              >
                <MoreVertical />
              </button>
            )}
          >
            {collapsedActions.map((action, index) => (
              <Dropdown.Item
                key={index}
                icon={action.icon}
                onClick={() => action.action(row)}
                disabled={action.disabled}
              >
                {action.label}
              </Dropdown.Item>
            ))}
          </Dropdown>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      );
    if (error)
      return (
        <div className="text-center py-10 text-red-500 font-semibold">
          {error}
        </div>
      );
    if (data.length === 0) return <TableResultsNotFound />;

    // --- Card View ---
    if (viewMode === 'cards') {
      return (
        <div className="flex flex-col gap-4">
          {data.map((row) => {
            const { imageKey, titleKey, subtitleKey } = cardViewConfig;
            const imageColumn = columns.find((c) => c.key === imageKey);
            const titleColumn = columns.find((c) => c.key === titleKey);
            const subtitleColumn = columns.find((c) => c.key === subtitleKey);

            const otherColumns = columns.filter(
              (c) =>
                c.key !== imageKey &&
                c.key !== titleKey &&
                c.key !== subtitleKey &&
                c.key !== 'actions',
            );

            return (
              <div
                key={getNestedValue(row, rowKey)}
                className={classNames(
                  'relative bg-[color:var(--surface)] border border-[color:var(--border)] rounded-md shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden',
                  rowClassName(row),
                )}
                onClick={() => onRowClick(row)}
                onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
              >
                {selectable && (
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={!!selectedRows[getNestedValue(row, rowKey)]}
                      onChange={() => onSelectRow(row)}
                    />
                  </div>
                )}

                <div className="flex p-4">
                  {imageColumn && (
                    <div className="flex-shrink-0 mr-4">
                      {renderCell(row, imageColumn)}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    {titleColumn && (
                      <h3 className="text-base font-bold text-[color:var(--foreground)] truncate">
                        {renderCell(row, titleColumn)}
                      </h3>
                    )}
                    {subtitleColumn && (
                      <p className="text-sm text-[color:var(--foreground-muted)] mt-0.5">
                        {renderCell(row, subtitleColumn)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 border-t border-[color:var(--border)]">
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 mt-3 text-sm">
                    {otherColumns.map((col) => (
                      <div key={col.key}>
                        <span className="text-[color:var(--foreground-muted)]">
                          {col.title}:
                        </span>
                        <span className="ml-2 font-semibold text-[color:var(--foreground)]">
                          {renderCell(row, col)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[color:var(--border)]">
                    {renderActions(row)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // --- Desktop Table View ---
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full w-full text-sm text-left text-[color:var(--foreground-muted)]">
          <thead className="text-xs uppercase tracking-wide bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)]">
            <tr>
              {selectable && (
                <th
                  className={classNames(
                    'p-4',
                    'first:rounded-tl-lg last:rounded-tr-lg',
                  )}
                >
                  <Checkbox
                    checked={
                      data.length > 0 &&
                      Object.keys(selectedRows).length === data.length
                    }
                    onChange={onSelectAllRows}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  scope="col"
                  className={classNames(
                    'p-4 whitespace-nowrap',
                    'first:rounded-tl-lg last:rounded-tr-lg',
                    { 'cursor-pointer select-none': col.sortable },
                    col.headerClassName,
                  )}
                >
                  <div className="flex items-center">
                    {col.title}
                    {col.sortable && (
                      <span className="ml-1">{getSortIcon(col.key)}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={getNestedValue(row, rowKey)}
                className={classNames(
                  'border-b border-[color:var(--border)] hover:bg-[color:var(--surface-muted)] transition-colors cursor-pointer',
                  rowClassName(row),
                  {
                    'bg-[color:var(--surface-muted)]/50':
                      striped && data.indexOf(row) % 2 !== 0,
                  },
                )}
                onClick={() => onRowClick(row)}
                onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
              >
                {selectable && (
                  <td className="px-4 py-2">
                    <Checkbox
                      checked={!!selectedRows[getNestedValue(row, rowKey)]}
                      onChange={() => onSelectRow(row)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      'px-4 py-2 whitespace-nowrap',
                      col.cellClassName,
                    )}
                  >
                    {col.key === 'actions'
                      ? renderActions(row)
                      : renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Pagination Logic (reused) ---
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    if (totalPages <= 1) return [];
    const maxVisiblePages = 5;
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      totalPages,
      currentPage + Math.floor(maxVisiblePages / 2),
    );
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1)
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      else if (endPage === totalPages)
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };
  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4">
      {renderContent()}

      {showPagination && pagination.totalRecords > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 border-t border-[color:var(--border)] mt-4 pt-4">
          <div className="text-sm text-[color:var(--foreground-muted)]">
            Mostrando{' '}
            <span className="font-semibold">
              {Math.min(
                (pagination.currentPage - 1) * pagination.pageSize + 1,
                pagination.totalRecords,
              )}
              -
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalRecords,
              )}
            </span>{' '}
            de <span className="font-semibold">{pagination.totalRecords}</span>{' '}
            resultados
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border border-[color:var(--border)] rounded-md disabled:opacity-50 hover:bg-[color:var(--surface-muted)] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={classNames('px-3 py-1 rounded-md text-sm', {
                  'bg-purple-600 text-white font-bold':
                    page === pagination.currentPage,
                  'bg-[color:var(--surface-muted)] hover:bg-[color:var(--surface-muted)]/80 text-[color:var(--foreground-muted)]':
                    page !== pagination.currentPage,
                })}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-3 py-1 border border-[color:var(--border)] rounded-md disabled:opacity-50 hover:bg-[color:var(--surface-muted)] transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[color:var(--foreground-muted)]">
              Resultados por página:
            </label>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-[color:var(--border)] rounded-md text-sm bg-[color:var(--surface)] text-[color:var(--foreground)]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size == 0 ? 'Todos' : size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;
