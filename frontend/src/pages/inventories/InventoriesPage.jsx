// InventoriesPage.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchInventories } from '../../hooks/useSearchInventories';
import { useInventoryQueryParams } from '../../hooks/useInventoryQueryParams';
import { useCatalogContext } from '../../context/CatalogContext';
import { formatInventoriesToCSVString } from '../../utils/inventoriesUtils';
import { downloadCSV } from '../../utils/DownloadCSV';
import { parseToLocalDate } from '../../utils/formatValues';
import { useNavigate } from 'react-router-dom';

import ResponsiveTable from '../../components/Table/ResponsiveTable';
import InventoryPreview from './views/InventoryPreview';
import ModalRemove from '../../components/Modals/ModalRemove';

import { Dropdown, ToggleSwitch, Tooltip } from 'flowbite-react';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaFileCsv,
  FaPlus,
  FaRegFile,
  FaTable, // Import FaTable for table view icon
  FaImages,
  FaSearch,
  FaSitemap, // Import FaImages for resources view icon (representing resources)
  FaTh, // Import FaTh for cards view icon
  FaFileInvoice,
} from 'react-icons/fa';
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from 'react-icons/tb'; // Import icons for preview toggle
import { BsThreeDotsVertical } from 'react-icons/bs';
import ImageViewer from '../../components/ImageViewer/ImageViewer2';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import { MdInfo, MdInventory } from 'react-icons/md';
import { useInventoryContext } from '../../context/InventoryContext';
import classNames from 'classnames';
// Import InventoriesImagesView to support the 'resources' view mode
import FilterDropdown from '../../components/Inputs/FilterDropdown'; // Make sure this import is present
import { useVerticals } from '../../hooks/useVerticals';
import { useSearchAllInvoices } from '../../hooks/useInvoices';
import { useSearchPurchaseOrders } from '../../hooks/usePurchaseOrders';
import { GrClose } from 'react-icons/gr';

const InventoriesPage = () => {
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);

  // Estado local para el término de búsqueda (evita cursor jumping)
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use mainViewMode from query params as the source of truth for view mode
  const { query, updateQuery } = useInventoryQueryParams();
  const { data: verticals } = useVerticals();
  const viewMode = query.mainViewMode || 'table'; // Default to 'table'

  // Get invoice/purchase order info for filter display
  const { data: invoiceData } = useSearchAllInvoices(
    query.invoiceId || query.invoiceCode
      ? { searchTerm: query.invoiceCode || '', page: 1, pageSize: 1000 }
      : null,
  );
  const { data: purchaseOrderData } = useSearchPurchaseOrders(
    null,
    query.purchaseOrderId || query.purchaseOrderCode
      ? { searchTerm: query.purchaseOrderCode || '', page: 1, pageSize: 1000 }
      : null,
  );

  const currentInvoice = query.invoiceId
    ? invoiceData?.data?.find((inv) => inv.id === query.invoiceId)
    : invoiceData?.data?.find((inv) => inv.code === query.invoiceCode);

  const currentPurchaseOrder = query.purchaseOrderId
    ? purchaseOrderData?.data?.find((po) => po.id === query.purchaseOrderId)
    : purchaseOrderData?.data?.find(
        (po) => po.code === query.purchaseOrderCode,
      );

  // Create modified query with IDs for backend
  const searchQuery = useMemo(() => {
    const baseQuery = { ...query };

    // Convert codes to IDs if needed
    if (query.invoiceCode && currentInvoice) {
      baseQuery.invoiceId = currentInvoice.id;
      delete baseQuery.invoiceCode;
    }
    if (query.purchaseOrderCode && currentPurchaseOrder) {
      baseQuery.purchaseOrderId = currentPurchaseOrder.id;
      delete baseQuery.purchaseOrderCode;
    }

    return baseQuery;
  }, [query, currentInvoice, currentPurchaseOrder]);

  // Sincronizar el estado local con el query cuando cambie externamente
  useEffect(() => {
    setLocalSearchTerm(query.searchTerm || '');
  }, [query.searchTerm]);

  // Debounce function para retrasar la búsqueda
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Función de búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce((term) => {
      updateQuery({
        ...query,
        searchTerm: term,
        page: 1,
      });
    }, 500), // 500ms de delay
    [query, updateQuery],
  );

  const { inventoryConditions } = useCatalogContext();
  const { deleteInventory } = useInventoryContext();

  const { data, isLoading, error, refetch } = useSearchInventories(searchQuery);
  const inventories = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: query.pageSize,
  };

  const isEditPermission = useCheckPermissions('edit_inventories');
  const isDeletePermission = useCheckPermissions('delete_inventories');
  const navigate = useNavigate();

  const [selectedTableRows, setSelectedTableRows] = useState({});
  const [selectedForDownload, setSelectedForDownload] = useState({});

  const onSelectTableRow = (row) => {
    setSelectedTableRows((prevSelected) => ({
      ...prevSelected,
      [row.id]: !prevSelected[row.id],
    }));
    setSelectedForDownload((prevSelectedForDownload) => {
      const newSelected = { ...prevSelectedForDownload };
      if (newSelected[row.id]) {
        delete newSelected[row.id];
      } else {
        newSelected[row.id] = row;
      }
      return newSelected;
    });
  };

  const verticalOptions = useMemo(
    () =>
      (verticals ?? []).map((v) => ({
        id: String(v.id), // ← conviertes el número a string
        name: v.name,
      })),
    [verticals],
  );

  const onSelectAllTableRows = () => {
    const allSelected =
      Object.keys(selectedTableRows).length === inventories.length &&
      inventories.length > 0;
    const newSelectedRows = {};
    const newSelectedForDownload = {};

    if (!allSelected) {
      inventories.forEach((row) => {
        newSelectedRows[row.id] = true;
        newSelectedForDownload[row.id] = row;
      });
    }
    setSelectedTableRows(newSelectedRows);
    setSelectedForDownload(newSelectedForDownload);
  };

  const openDeleteModal = (inventory) => {
    setInventoryToDelete(inventory);
    setDeleteModalOpen(true);
  };

  const handleDeleteInventory = async () => {
    try {
      await deleteInventory(inventoryToDelete.id);
      await refetch();
      setDeleteModalOpen(false);
      setInventoryToDelete(null);
      console.log('Inventario eliminado con éxito.');
    } catch (error) {
      console.error('Error al eliminar el inventario:', error);
    }
  };

  const collapsedRowActions = (inventory) => [
    // {
    //   key: 'main',
    //   label: 'Ver',
    //   icon: FaEye,
    //   action: () => navigate(`/inventories/view/${inventory.id}`),
    //   disabled: false,
    // },
    {
      key: 'edit',
      label: 'Editar',
      icon: FaEdit,
      action: isEditPermission.hasPermission
        ? () => navigate(`/inventories/edit/${inventory.id}`)
        : null,
      disabled: !isEditPermission.hasPermission,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: FaTrash,
      action: isDeletePermission.hasPermission
        ? () => {
            openDeleteModal(inventory);
          }
        : null,
      disabled: !isDeletePermission.hasPermission,
    },
  ];

  const columns = useMemo(
    () => [
      {
        key: 'images',
        title: 'Imagen',
        render: (_, row) =>
          row.images?.length > 0 ? (
            <ImageViewer
              containerClassNames={classNames(
                '',
                viewMode === 'cards'
                  ? 'h-20 w-20 md:w-12 md:h-12'
                  : 'h-8 w-8 md:w-12 md:h-12',
              )}
              showOnlyFirstImage={true}
              images={row.images || []}
            />
          ) : (
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-md" />
          ),
        sortable: false,
        headerClassName: 'w-16',
        cellClassName: 'w-16',
      },
      {
        key: 'model.name',
        title: 'Modelo',
        sortable: true,
        render: (_, r) => r.model?.name || '-',
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'model.type.name',
        title: 'Tipo',
        sortable: true,
        render: (_, r) => r.model?.type?.name || '-',
        headerClassName: 'w-24',
        cellClassName: 'w-24',
      },
      {
        key: 'model.brand.name',
        title: 'Marca',
        sortable: true,
        render: (_, r) => r.model?.brand?.name || '-',
        headerClassName: 'w-24',
        cellClassName: 'w-24',
      },
      {
        key: 'serialNumber',
        title: '# Serie',
        sortable: true,
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'activeNumber',
        title: '# Activo',
        sortable: true,
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'internalFolio',
        title: 'Folio Interno',
        sortable: true,
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'status',
        title: 'Estatus',
        sortable: true,
        render: (val) => (
          <span
            className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
              val === 'ALTA'
                ? 'bg-sinabe-success'
                : val === 'BAJA'
                  ? 'bg-sinabe-danger'
                  : 'bg-sinabe-warning'
            }`}
          >
            {val === 'PROPUESTA' ? 'PROP. BAJA' : val}
          </span>
        ),
        headerClassName: 'w-28',
        cellClassName: 'w-28',
      },
      {
        // vertical
        key: 'vertical',
        title: 'Vertical',
        sortable: false,
        render: (_, row) => {
          const verticals = row.model?.ModelVertical || [];
          if (verticals.length === 0) return '';

          const maxVisible = 3;
          const visibleVerticals = verticals.slice(0, maxVisible);
          const remainingCount = verticals.length - maxVisible;

          return (
            <div className="flex flex-wrap gap-1">
              {visibleVerticals.map((modelVertical) => (
                <span
                  key={modelVertical.id}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {modelVertical.vertical?.name}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  +{remainingCount}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'conditions',
        title: 'Condiciones',
        sortable: false,
        render: (_, row) => (
          <div className="flex flex-wrap gap-1">
            {row.conditions?.map((condition) => (
              <span
                key={condition.id}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700"
              >
                {condition?.condition?.name}
              </span>
            ))}
          </div>
        ),
        headerClassName: 'w-40',
        cellClassName: 'w-40',
      },

      {
        key: 'comments',
        title: 'Comentarios',
        sortable: true,
        render: (val) => {
          const MAX_CHARS = 60;
          const text = val || '';
          let displayedText = text;

          if (text.length > MAX_CHARS) {
            displayedText = text.substring(0, MAX_CHARS) + '...';
          }
          return <p className="line-clamp-2">{displayedText}</p>;
        },
        headerClassName: 'w-auto',
        cellClassName: 'max-w-xs',
      },
      {
        key: 'receptionDate',
        title: 'F. Recepción',
        sortable: true,
        render: (val) => parseToLocalDate(val),
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'createdAt',
        title: 'F. Creación',
        sortable: true,
        render: (val) => parseToLocalDate(val),
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'updatedAt',
        title: 'F. Actualización',
        sortable: true,
        render: (val) => parseToLocalDate(val),
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'files',
        title: 'Archivos',
        sortable: false,
        render: (val) =>
          (
            <span className="w-fit p-2 px-4 flex justify-center items-center gap-2 bg-sky-50 text-black rounded-md">
              <FaRegFile className="text-neutral-500" /> {val?.length}
            </span>
          ) || 0,
        headerClassName: 'w-24',
        cellClassName: 'w-24',
      },
      {
        key: 'actions',
        title: 'Acciones',
        sortable: false,
        render: (_, row) => (
          <div className="flex gap-2">
            <ActionButtons
              extraOptions={collapsedRowActions(row)}
              onView={() => {
                setSelectedInventory(row);
                setIsOpenPreview(true);
              }}
            />
          </div>
        ),
        headerClassName: 'w-28',
        cellClassName: 'w-28',
      },
    ],
    [
      isEditPermission.hasPermission,
      isDeletePermission.hasPermission,
      navigate,
    ],
  );

  const handlePageChange = (newPage) => {
    updateQuery({ ...query, page: newPage });
  };

  const handlePageSizeChange = (newSize) => {
    updateQuery({ ...query, pageSize: newSize, page: 1 });
  };

  const handleSort = (key) => {
    const direction =
      query.sortBy === key && query.order === 'asc' ? 'desc' : 'asc';
    updateQuery({
      ...query,
      sortBy: key,
      order: direction,
      page: 1,
    });
  };

  const handleSearch = (term) => {
    // Actualizar inmediatamente el estado local (sin cursor jumping)
    setLocalSearchTerm(term);
    // Ejecutar la búsqueda con debounce
    debouncedSearch(term);
  };

  const handleDeepSearchToggle = (isChecked) => {
    updateQuery({
      ...query,
      advancedSearch: isChecked,
      page: 1,
    });
  };

  // Function to change the main view mode
  const handleViewModeChange = (newMode) => {
    updateQuery({ ...query, mainViewMode: newMode, page: 1 }); // Reset page on view mode change
  };

  const handleRowDoubleClick = (row) => {
    navigate(`/inventories/view/${row.id}`);
  };

  const handleRowControlClick = (row) => {
    window.open(`/inventories/view/${row.id}`, '_blank');
  };

  const handleDownloadCSV = () => {
    if (Object.keys(selectedForDownload).length > 0) {
      const csv = formatInventoriesToCSVString(
        Object.values(selectedForDownload),
      );
      downloadCSV({ data: csv, fileName: 'inventarios' });
    } else {
      console.log('Por favor, selecciona al menos un elemento para descargar.');
    }
  };

  const pageActions = [
    {
      label: 'Nuevo',
      icon: FaPlus,
      action: () => navigate('/inventories/create'),
      color: 'indigo',
      filled: true,
    },
  ];

  const collapsedActions = [
    { label: 'Exportar CSV', icon: FaFileCsv, action: handleDownloadCSV },
    {
      label: isOpenPreview ? 'Ocultar Preview' : 'Mostrar Preview',
      icon: isOpenPreview
        ? TbLayoutSidebarLeftCollapseFilled
        : TbLayoutSidebarLeftExpandFilled,
      action: () => setIsOpenPreview((prev) => !prev),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MdInventory className="text-purple-500" /> Inventarios
          </h1>
        </div>

        <div className="flex gap-2">
          <ActionButtons extraActions={pageActions} />
          <Dropdown
            renderTrigger={() => (
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center justify-center">
                <BsThreeDotsVertical />
              </button>
            )}
            placement="bottom-end"
          >
            {collapsedActions.map((action, index) => (
              <Dropdown.Item
                key={index}
                className="min-w-36 min-h-12"
                onClick={action.action}
                icon={action.icon}
              >
                <span>{action.label}</span>
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Search, Filters, and View Mode Toggle - Always visible */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 w-full flex-grow sm:w-auto">
          <div className="flex items-center space-x-2 border rounded-md p-1">
            <Tooltip content="Vista de Tabla">
              <button
                onClick={() => handleViewModeChange('table')}
                className={classNames(
                  'p-2 rounded-md transition-colors duration-200',
                  {
                    'bg-purple-600 text-white': viewMode === 'table',
                    'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700':
                      viewMode !== 'table',
                  },
                )}
              >
                <FaTable className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip content="Vista de Tarjetas">
              <button
                onClick={() => handleViewModeChange('cards')}
                className={classNames(
                  'p-2 rounded-md transition-colors duration-200',
                  {
                    'bg-purple-600 text-white': viewMode === 'cards',
                    'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700':
                      viewMode !== 'cards',
                  },
                )}
              >
                <FaTh className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip content="Vista de Imágenes">
              <button
                onClick={() => handleViewModeChange('resources')}
                className={classNames(
                  'p-2 rounded-md transition-colors duration-200',
                  {
                    'bg-purple-600 text-white': viewMode === 'resources',
                    'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700':
                      viewMode !== 'resources',
                  },
                )}
              >
                <FaImages className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
          <div className="relative w-full sm:w-auto flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar por Modelo, Serial, Activo"
              value={localSearchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-300 rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-nowrap">
              <Tooltip content="Activar búsqueda avanzada">
                <ToggleSwitch
                  checked={query.advancedSearch}
                  onChange={handleDeepSearchToggle}
                  label=""
                  className="scale-75"
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {inventoryConditions.length > 0 && (
            <FilterDropdown
              options={inventoryConditions.map((c) => ({
                id: c.name,
                name: c.name,
              }))}
              selected={query.conditionName}
              setSelected={(conditions) =>
                updateQuery({ ...query, conditionName: conditions, page: 1 })
              }
              titleDisplay="Condición"
              label="Filtrar por Condición"
            />
          )}

          {/* Corrected: use the hardcoded array directly */}
          <FilterDropdown
            options={['ALTA', 'BAJA', 'PROPUESTA'].map((s) => ({
              id: s,
              name: s,
            }))}
            selected={query.status}
            setSelected={(statuses) =>
              updateQuery({ ...query, status: statuses, page: 1 })
            }
            titleDisplay="Estatus"
            label="Filtrar por Estatus"
            icon={<MdInfo size={18} />}
          />

          {/* Filter by vertical */}
          <FilterDropdown
            options={verticalOptions}
            selected={query.verticalId}
            setSelected={(verticalIds) =>
              updateQuery({ ...query, verticalId: verticalIds, page: 1 })
            }
            titleDisplay="Vertical"
            label="Filtrar por Vertical"
            icon={<FaSitemap className="h-4 w-4" />}
          />
        </div>

        {/* Filtros activos */}
        <div className="w-full">
          {(currentInvoice || currentPurchaseOrder) && (
            <div className="flex flex-wrap gap-2">
              {currentInvoice && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <FaFileInvoice size={12} />
                  <span>Factura: {currentInvoice.code}</span>
                  <button
                    onClick={() =>
                      updateQuery({
                        invoiceId: null,
                        invoiceCode: null,
                        page: 1,
                      })
                    }
                    className="ml-1 hover:text-blue-900"
                  >
                    <GrClose size={12} />
                  </button>
                </div>
              )}
              {currentPurchaseOrder && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <FaSitemap size={12} />
                  <span>OC: {currentPurchaseOrder.code}</span>
                  <button
                    onClick={() =>
                      updateQuery({
                        purchaseOrderId: null,
                        purchaseOrderCode: null,
                        page: 1,
                      })
                    }
                    className="ml-1 hover:text-green-900"
                  >
                    <GrClose size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={classNames('col-span-1', {
            'md:col-span-3': !isOpenPreview,
            'md:col-span-2': isOpenPreview,
          })}
        >
          <ResponsiveTable
            columns={columns}
            data={inventories}
            pagination={pagination}
            loading={isLoading}
            error={error}
            sortConfig={{
              key: query.sortBy,
              direction: query.order,
            }}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowClick={(row) => {
              if (isOpenPreview) {
                setSelectedInventory(row);
              }
            }}
            onRowDoubleClick={handleRowDoubleClick}
            onRowControlClick={handleRowControlClick}
            rowActions={collapsedRowActions}
            selectable={true}
            selectedRows={selectedTableRows}
            onSelectRow={onSelectTableRow}
            onSelectAllRows={onSelectAllTableRows}
            viewMode={viewMode}
          />
        </div>

        {isOpenPreview && (
          <div className="col-span-1 hidden md:flex flex-col">
            <InventoryPreview
              inventory={selectedInventory}
              onClose={() => setIsOpenPreview(false)}
            />
          </div>
        )}
      </div>
      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        onCloseModal={() => setDeleteModalOpen(false)}
        removeFunction={handleDeleteInventory}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el inventario ${inventoryToDelete?.model?.name || inventoryToDelete?.serialNumber}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default InventoriesPage;
