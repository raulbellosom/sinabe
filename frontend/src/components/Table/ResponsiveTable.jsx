import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Box,
  Calendar,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Eye,
  FileText,
  MessageCircle,
  Tag,
} from 'lucide-react';
import classNames from 'classnames';

import TableResultsNotFound from './TableResultsNotFound';
import TableResources from './TableResources';
import ActionButtons from '../ActionButtons/ActionButtons';

const getValueByKey = (row, key) => {
  if (!row || !key) {
    return undefined;
  }

  if (!key.includes('.')) {
    return row[key];
  }

  return key.split('.').reduce((acc, segment) => acc?.[segment], row);
};

const Spinner = () => (
  <span
    className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-[color:var(--primary)] border-r-transparent"
    aria-label="Cargando"
  />
);

const SortIcon = ({ isActive, direction }) => {
  if (!isActive) {
    return <ArrowUpDown size={14} className="opacity-50" />;
  }

  return direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
};

const RowActionsMenu = ({ row, rowActions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const actions = useMemo(() => {
    const resolved =
      typeof rowActions === 'function' ? rowActions(row) : rowActions;
    return Array.isArray(resolved)
      ? resolved.filter((action) => typeof action?.action === 'function')
      : [];
  }, [row, rowActions]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!actions.length) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--foreground-muted)] transition-colors hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
        aria-label="Acciones"
      >
        <EllipsisVertical size={16} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-10 z-40 min-w-[11rem] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-xl">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={`${row.id}-${action.key || action.label}`}
                type="button"
                disabled={action.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  action.action(row);
                  setIsOpen(false);
                }}
                className={classNames(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  action.disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-[color:var(--surface-muted)]',
                )}
              >
                {Icon ? <Icon size={14} /> : null}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const ResponsiveTable = ({
  columns = [],
  data = [],
  pagination = { currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 10 },
  loading = false,
  error = null,
  sortConfig = { key: null, direction: 'asc' },
  selectable = false,
  selectedRows = {},
  onSelectRow = () => {},
  onSelectAllRows = () => {},
  onSort,
  onPageChange,
  onPageSizeChange,
  onRowClick = () => {},
  onRowDoubleClick,
  onRowControlClick,
  rowActions = [],
  pageSizeOptions = [10, 20, 30, 50, 100, 0],
  viewMode = 'table',
  headerFilters = {},
}) => {
  const safePagination = {
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 1,
    totalRecords: pagination?.totalRecords ?? data.length,
    pageSize: pagination?.pageSize || 10,
  };

  const isAllSelected =
    selectable && data.length > 0 && data.every((row) => selectedRows[row.id]);

  const pageNumbers = useMemo(() => {
    const { currentPage, totalPages } = safePagination;
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [safePagination]);

  const handleRowClick = (row, event) => {
    if (event.ctrlKey || event.metaKey) {
      onRowControlClick?.(row);
      return;
    }

    onRowClick?.(row);
  };

  // ── Dual horizontal scrollbar (top mirror + table in sync) ──
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const phantomRef = useRef(null);

  useEffect(() => {
    const tableEl = tableScrollRef.current;
    if (!tableEl || !phantomRef.current) return;
    const update = () => {
      if (phantomRef.current)
        phantomRef.current.style.width = `${tableEl.scrollWidth}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(tableEl);
    return () => ro.disconnect();
  });

  useEffect(() => {
    const top = topScrollRef.current;
    const tbl = tableScrollRef.current;
    if (!top || !tbl) return;
    let syncing = false;
    const onTop = () => { if (!syncing) { syncing = true; tbl.scrollLeft = top.scrollLeft; syncing = false; } };
    const onTbl = () => { if (!syncing) { syncing = true; top.scrollLeft = tbl.scrollLeft; syncing = false; } };
    top.addEventListener('scroll', onTop);
    tbl.addEventListener('scroll', onTbl);
    return () => { top.removeEventListener('scroll', onTop); tbl.removeEventListener('scroll', onTbl); };
  });

  const renderCell = (row, column) => {
    if (column.key === 'actions') {
      return <RowActionsMenu row={row} rowActions={rowActions} />;
    }

    const rawValue = getValueByKey(row, column.key);

    if (typeof column.render === 'function') {
      return column.render(rawValue, row);
    }

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return '-';
    }

    return String(rawValue);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 p-4 text-sm text-[color:var(--danger)]">
        Error al cargar la tabla.
      </div>
    );
  }

  if (viewMode === 'resources') {
    return <TableResources data={data} />;
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <TableResultsNotFound />
      </div>
    );
  }

  const showPagination = viewMode !== 'resources';

  return (
    <div className="flex flex-col gap-4">
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {data.map((row) => {
            const imageColumn = columns.find(
              (column) => column.key === 'images',
            );
            const modelColumn = columns.find(
              (column) => column.key === 'model.name',
            );
            const typeColumn = columns.find(
              (column) => column.key === 'model.type.name',
            );
            const brandColumn = columns.find(
              (column) => column.key === 'model.brand.name',
            );
            const receptionColumn = columns.find(
              (column) => column.key === 'receptionDate',
            );
            const commentsColumn = columns.find(
              (column) => column.key === 'comments',
            );

            const statusColor =
              row.status === 'ALTA'
                ? 'bg-[color:var(--success)]'
                : row.status === 'BAJA'
                  ? 'bg-[color:var(--danger)]'
                  : 'bg-[color:var(--warning)]';

            return (
              <article
                key={row.id}
                className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm"
                onClick={(event) => handleRowClick(row, event)}
                onDoubleClick={() => onRowDoubleClick?.(row)}
              >
                {selectable ? (
                  <label className="absolute right-3 top-3 z-10 inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedRows[row.id])}
                      onChange={() => onSelectRow(row)}
                      className="sinabe-checkbox h-4 w-4 cursor-pointer appearance-none rounded-[3px] transition-all duration-150 border-2 border-[color:var(--border)] bg-[color:var(--surface)] checked:border-[color:var(--primary)] checked:bg-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1"
                    />
                  </label>
                ) : null}

                <div className="flex items-start gap-3 border-b border-[color:var(--border)] p-4">
                  <div className="shrink-0">
                    {imageColumn?.render
                      ? imageColumn.render(getValueByKey(row, 'images'), row)
                      : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-[color:var(--foreground)]">
                      {modelColumn?.render
                        ? modelColumn.render(
                            getValueByKey(row, 'model.name'),
                            row,
                          )
                        : getValueByKey(row, 'model.name') || '-'}
                    </h3>
                    <p className="truncate text-sm text-[color:var(--foreground-muted)]">
                      {(typeColumn?.render
                        ? typeColumn.render(
                            getValueByKey(row, 'model.type.name'),
                            row,
                          )
                        : getValueByKey(row, 'model.type.name') || '-') +
                        ' - ' +
                        (brandColumn?.render
                          ? brandColumn.render(
                              getValueByKey(row, 'model.brand.name'),
                              row,
                            )
                          : getValueByKey(row, 'model.brand.name') || '-')}
                    </p>
                    {row.status ? (
                      <span
                        className={classNames(
                          'mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white',
                          statusColor,
                        )}
                      >
                        {row.status === 'PROPUESTA' ? 'PROP. BAJA' : row.status}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 text-xs text-[color:var(--foreground-muted)]">
                  <div className="flex items-start gap-1.5">
                    <Tag size={14} className="mt-0.5" />
                    <span>
                      Serie:{' '}
                      <strong className="text-[color:var(--foreground)]">
                        {row.serialNumber || '-'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Box size={14} className="mt-0.5" />
                    <span>
                      Activo:{' '}
                      <strong className="text-[color:var(--foreground)]">
                        {row.activeNumber || '-'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <FileText size={14} className="mt-0.5" />
                    <span>
                      Folio:{' '}
                      <strong className="text-[color:var(--foreground)]">
                        {row.internalFolio || '-'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Calendar size={14} className="mt-0.5" />
                    <span>
                      Recepción:{' '}
                      <strong className="text-[color:var(--foreground)]">
                        {receptionColumn?.render
                          ? receptionColumn.render(row.receptionDate, row)
                          : row.receptionDate || '-'}
                      </strong>
                    </span>
                  </div>
                  {row.comments ? (
                    <div className="col-span-2 flex items-start gap-1.5">
                      <MessageCircle size={14} className="mt-0.5" />
                      <div className="line-clamp-2 text-[color:var(--foreground-muted)]">
                        {commentsColumn?.render
                          ? commentsColumn.render(row.comments, row)
                          : row.comments}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-3">
                  <ActionButtons
                    extraActions={[
                      {
                        icon: Eye,
                        label: 'Ver',
                        action: () => onRowDoubleClick?.(row),
                        disabled: false,
                      },
                    ]}
                  />
                  <RowActionsMenu row={row} rowActions={rowActions} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col">
          {/* ── Top scrollbar mirror (synced with table bottom scrollbar) ── */}
          <div
            ref={topScrollRef}
            className="custom-scrollbar overflow-x-auto rounded-t-xl border-x border-t border-[color:var(--border)]"
            style={{ height: 10 }}
          >
            <div ref={phantomRef} style={{ height: 1 }} />
          </div>

          {/* ── Actual scrollable table ── */}
          <div
            ref={tableScrollRef}
            className="custom-scrollbar overflow-x-auto rounded-b-xl border border-[color:var(--border)] bg-[color:var(--surface)]"
          >
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[color:var(--surface-muted)] text-xs uppercase tracking-wide text-[color:var(--foreground-muted)]">
              <tr>
                {selectable ? (
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={onSelectAllRows}
                      className="sinabe-checkbox h-4 w-4 cursor-pointer appearance-none rounded-[3px] transition-all duration-150 border-2 border-[color:var(--border)] bg-[color:var(--surface)] checked:border-[color:var(--primary)] checked:bg-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1"
                    />
                  </th>
                ) : null}

                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && onSort?.(column.key)}
                    className={classNames(
                      'px-4 py-3 whitespace-nowrap',
                      column.sortable ? 'cursor-pointer select-none' : '',
                      column.headerClassName,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        {column.title}
                        {column.sortable ? (
                          <SortIcon
                            isActive={sortConfig.key === column.key}
                            direction={sortConfig.direction}
                          />
                        ) : null}
                      </span>
                      {headerFilters[column.key] ? (
                        <span onClick={(event) => event.stopPropagation()}>
                          {headerFilters[column.key].component}
                        </span>
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-muted)]/60"
                  onClick={(event) => handleRowClick(row, event)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {selectable ? (
                    <td
                      className="px-4 py-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(selectedRows[row.id])}
                        onChange={() => onSelectRow(row)}
                        className="sinabe-checkbox h-4 w-4 cursor-pointer appearance-none rounded-[3px] transition-all duration-150 border-2 border-[color:var(--border)] bg-[color:var(--surface)] checked:border-[color:var(--primary)] checked:bg-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1"
                      />
                    </td>
                  ) : null}

                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column.key}`}
                      className={classNames(
                        'px-4 py-3 whitespace-nowrap text-[color:var(--foreground)]',
                        column.cellClassName,
                      )}
                      onClick={
                        column.key === 'actions'
                          ? (event) => event.stopPropagation()
                          : undefined
                      }
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showPagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-sm">
          <p className="text-[color:var(--foreground-muted)]">
            Mostrando{' '}
            <strong className="text-[color:var(--foreground)]">
              {safePagination.totalRecords === 0
                ? 0
                : (safePagination.currentPage - 1) * safePagination.pageSize +
                  1}
              -
              {Math.min(
                safePagination.currentPage * safePagination.pageSize,
                safePagination.totalRecords,
              )}
            </strong>{' '}
            de{' '}
            <strong className="text-[color:var(--foreground)]">
              {safePagination.totalRecords}
            </strong>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange?.(safePagination.currentPage - 1)}
              disabled={safePagination.currentPage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--border)] text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange?.(pageNumber)}
                className={classNames(
                  'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-semibold',
                  pageNumber === safePagination.currentPage
                    ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                    : 'border border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]',
                )}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onPageChange?.(safePagination.currentPage + 1)}
              disabled={safePagination.currentPage >= safePagination.totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--border)] text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <label className="flex items-center gap-2 text-[color:var(--foreground-muted)]">
            <span>Resultados por página</span>
            <select
              value={safePagination.pageSize}
              onChange={(event) =>
                onPageSizeChange?.(Number(event.target.value))
              }
              className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-sm text-[color:var(--foreground)]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size === 0 ? 'Todos' : size}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
};

export default ResponsiveTable;
