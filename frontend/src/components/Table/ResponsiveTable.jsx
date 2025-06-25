// ResponsiveTable.jsx
import React from 'react';
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaTag, // Icon for serial number
  FaBox, // Icon for active number
  FaFileAlt, // Icon for internal folio
  FaCalendarAlt, // Icon for date
  FaCommentDots, // Icon for comments
} from 'react-icons/fa';
import { Spinner, Dropdown, Checkbox, Tooltip } from 'flowbite-react';
import { useMediaQuery } from 'react-responsive';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md'; // Import these icons
import classNames from 'classnames';

import TableResultsNotFound from './TableResultsNotFound';
import TableResources from './TableResources';
import ActionButtons from '../ActionButtons/ActionButtons';

const ResponsiveTable = ({
  columns = [],
  data = [],
  pagination = { currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 10 },
  loading = false,
  error = null,
  sortConfig = { key: null, direction: 'asc' },
  // Selection props
  selectable = false,
  selectedRows = {},
  onSelectRow = () => {},
  onSelectAllRows = () => {},
  // Callbacks
  onSort,
  onPageChange,
  onPageSizeChange,
  onRowClick = () => {},
  onRowDoubleClick,
  onRowControlClick,
  rowActions = [],
  pageSizeOptions = [10, 20, 30, 50, 100, 0],
  showResourcesMode = false,
  viewMode = 'table',
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="opacity-30" />;
    if (sortConfig.direction === 'asc') return <FaSortUp />;
    return <FaSortDown />;
  };

  const handleRowClickInternal = (row, e) => {
    if (e.ctrlKey || e.metaKey) {
      if (onRowControlClick) onRowControlClick(row);
    } else {
      if (onRowClick) onRowClick(row);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-10 text-red-500 font-semibold">
          {error}
        </div>
      );
    }
    if (data.length === 0) {
      return <TableResultsNotFound />;
    }

    if (viewMode === 'resources') {
      return <TableResources data={data} />;
    }

    if (isMobile) {
      return (
        <div className="flex flex-col gap-4">
          {data.map((row) => (
            <div
              key={row.id}
              className={classNames(
                'relative bg-white dark:bg-gray-800 rounded-md shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ',
                {
                  'border-l-4 border-sinabe-danger': row.status === 'BAJA',
                  'border-l-4 border-sinabe-warning':
                    row.status === 'PROPUESTA',
                  'border-l-4 border-sinabe-success': row.status === 'ALTA',
                },
              )}
              onClick={(e) => handleRowClickInternal(row, e)}
              onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
            >
              {selectable && (
                <div className="absolute top-1 right-3 z-10">
                  <Checkbox
                    checked={!!selectedRows[row.id]}
                    onChange={() => onSelectRow(row)}
                    className="form-checkbox h-5 w-5 text-purple-600 rounded"
                  />
                </div>
              )}

              {/* Options Dropdown for actions, positioned top-right */}
              <div className="absolute top-1 right-0 z-10 text-nowrap"></div>

              {/* Card Header with Image and Main Info */}
              <div className="flex p-4 pb-2 items-center">
                <div className="flex-shrink-0 mr-4">
                  {columns
                    .find((col) => col.key === 'images')
                    ?.render?.(row.images, row) || (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      No Imagen
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base font-bold text-sinabe-primary dark:text-white truncate">
                    {columns
                      .find((col) => col.key === 'model.name')
                      ?.render?.(row.model?.name, row) ||
                      row.model?.name ||
                      '-'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {(columns
                      .find((col) => col.key === 'model.type.name')
                      ?.render?.(row.model?.type?.name, row) ||
                      row.model?.type?.name ||
                      '-') +
                      ' - ' +
                      (columns
                        .find((col) => col.key === 'model.brand.name')
                        ?.render?.(row.model?.brand?.name, row) ||
                        row.model?.brand?.name ||
                        '-')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {row.status && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                          row.status === 'ALTA'
                            ? 'bg-sinabe-success'
                            : row.status === 'BAJA'
                              ? 'bg-sinabe-danger'
                              : 'bg-sinabe-warning'
                        }`}
                      >
                        {row.status === 'PROPUESTA' ? 'PROP. BAJA' : row.status}
                      </span>
                    )}
                    {row.conditions?.map((condition) => (
                      <span
                        key={condition.id}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200"
                      >
                        {condition?.condition?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Body with Key Details */}
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <span>
                    <FaTag className="mr-2 text-gray-500" />
                  </span>
                  <span className="flex flex-col items-start">
                    Serie:{' '}
                    <span className="font-semibold">
                      {row.serialNumber || '-'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span>
                    <FaBox className="mr-2 text-gray-500" />
                  </span>
                  <span className="flex flex-col items-start">
                    Activo:{' '}
                    <span className="font-semibold">
                      {row.activeNumber || '-'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span>
                    <FaFileAlt className="mr-2 text-gray-500" />
                  </span>
                  <span className="flex flex-col items-start">
                    Folio:{' '}
                    <span className="font-semibold">
                      {row.internalFolio || '-'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span>
                    <FaCalendarAlt className="mr-2 text-gray-500" />
                  </span>
                  <span className="flex flex-col items-start">
                    Recepción:{' '}
                    <span className="font-semibold">
                      {columns
                        .find((c) => c.key === 'receptionDate')
                        ?.render?.(row.receptionDate) || '-'}
                    </span>
                  </span>
                </div>
                {row.comments && (
                  <div className="flex items-start col-span-2 my-1">
                    <FaCommentDots className="mr-2 text-gray-500 mt-1" />
                    <div className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {columns
                        .find((c) => c.key === 'comments')
                        ?.render?.(row.comments, row) || row.comments}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 col-span-2 pt-2">
                  <div>
                    <ActionButtons
                      extraActions={[
                        {
                          icon: FaEye,
                          label: 'Ver Detalles',
                          action: () =>
                            onRowDoubleClick && onRowDoubleClick(row),
                          disabled: false,
                        },
                      ]}
                    />
                  </div>
                  {rowActions.length > 0 && (
                    <Dropdown
                      inline
                      label=""
                      arrowIcon={false}
                      renderTrigger={() => {
                        return (
                          <button
                            type="button"
                            className="w-fit md:w-fit text-xs xl:text-sm transition ease-in-out duration-200 p-2.5 flex items-center justify-center rounded-md border text-stone-800"
                          >
                            <BsThreeDotsVertical />
                          </button>
                        );
                      }}
                    >
                      {rowActions(row).map((action, index) =>
                        action.action ? (
                          <Dropdown.Item
                            key={index}
                            icon={action.icon}
                            onClick={(e) => {
                              action.action(row);
                            }}
                            disabled={action.disabled}
                          >
                            {action.label}
                          </Dropdown.Item>
                        ) : null,
                      )}
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Desktop table view
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-100 uppercase bg-gray-700 dark:bg-gray-800 whitespace-nowrap">
            <tr>
              {selectable && (
                <th className="px-4 py-3 first:rounded-tl-lg last:rounded-tr-lg">
                  <Checkbox
                    checked={
                      Object.keys(selectedRows).length === data.length &&
                      data.length > 0
                    }
                    onChange={onSelectAllRows}
                    className="cursor-pointer w-5 h-5 text-purple-500 focus:ring-purple-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                  scope="col"
                  className={classNames(
                    'px-4 py-2 first:rounded-tl-lg last:rounded-tr-lg',
                    {
                      'cursor-pointer select-none': col.sortable,
                    },
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
                key={row.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={(e) => handleRowClickInternal(row, e)}
                onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
              >
                {selectable && (
                  <td className="px-4 py-2">
                    <Checkbox
                      checked={!!selectedRows[row.id]}
                      onChange={() => onSelectRow(row)}
                      className="cursor-pointer w-5 h-5 text-purple-500 focus:ring-purple-500"
                    />
                  </td>
                )}
                {columns.map((col) => {
                  if (col.key === 'actions') {
                    return (
                      <td
                        key={col.key}
                        className={classNames(
                          'px-4 py-2 text-right text-nowrap',
                          col.cellClassName,
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Dropdown
                          arrowIcon={false}
                          inline
                          label=""
                          renderTrigger={() => {
                            return (
                              <button
                                type="button"
                                className="h-10 w-10 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full cursor-pointer flex items-center justify-center"
                              >
                                <BsThreeDotsVertical />
                              </button>
                            );
                          }}
                        >
                          {typeof rowActions === 'function'
                            ? rowActions(row).map((action, index) =>
                                action.action ? (
                                  <Dropdown.Item
                                    key={index}
                                    icon={action.icon}
                                    onClick={(e) => {
                                      action.action(row);
                                    }}
                                    disabled={action.disabled}
                                  >
                                    {action.label}
                                  </Dropdown.Item>
                                ) : null,
                              )
                            : rowActions.map((action, index) =>
                                action.action ? (
                                  <Dropdown.Item
                                    key={index}
                                    icon={action.icon}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.action(row);
                                    }}
                                    disabled={action.disabled}
                                  >
                                    {action.label}
                                  </Dropdown.Item>
                                ) : null,
                              )}
                        </Dropdown>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={col.key}
                      className={classNames('px-4 py-2', col.cellClassName, {
                        'whitespace-nowrap': col.key !== 'comments',
                      })}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Logic to generate page numbers for pagination control
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const maxVisiblePages = 5;
    const pageNumbers = [];

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      totalPages,
      currentPage + Math.floor(maxVisiblePages / 2),
    );

    // Adjust start/end if the range is too small
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4">
      {renderContent()} {/* Call the rendering function here */}
      {/* Pagination (always show for table/card view) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 border-t dark:border-gray-700 mt-4 pt-4">
        {' '}
        {/* Added top border and padding */}
        <div className="text-sm text-gray-700 dark:text-gray-400">
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
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed  dark:text-white transition-colors flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            title="Página Anterior"
          >
            <MdNavigateBefore className="h-5 w-5" />
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1 mx-1">
            {' '}
            {/* Added mx-1 for spacing */}
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={classNames(
                  'px-3 py-1 rounded-md text-sm transition-colors duration-200',
                  {
                    'bg-purple-600 text-white font-bold shadow-md':
                      pageNumber === pagination.currentPage,
                    'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600':
                      pageNumber !== pagination.currentPage,
                  },
                )}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed  dark:text-white transition-colors flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            title="Página Siguiente"
          >
            <MdNavigateNext className="h-5 w-5" />
          </button>
        </div>
        {/* Results per page dropdown - moved to the right for better visual balance */}
        <div className="flex items-center gap-2 md:order-last">
          {' '}
          {/* md:order-last to push it to the right on larger screens */}
          <label className="text-sm text-gray-700 dark:text-gray-400">
            Resultados por página:
          </label>
          <select
            value={pagination.pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border rounded-md text-sm dark:bg-gray-700 dark:text-white"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size === 0 ? 'Todos' : size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTable;
