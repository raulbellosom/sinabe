// InventoriesPage.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { useSearchInventories } from '../../hooks/useSearchInventories';
import { useInventoryQueryParams } from '../../hooks/useInventoryQueryParams';
import { useCatalogContext } from '../../context/CatalogContext';
import AuthContext from '../../context/AuthContext';
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
  FaMapMarkerAlt,
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
import { BiCategory } from 'react-icons/bi';
import { useInventoryContext } from '../../context/InventoryContext';
import { useInventorySelection } from '../../context/InventorySelectionProvider';
import classNames from 'classnames';
// Import InventoriesImagesView to support the 'resources' view mode
import FilterDropdown from '../../components/Inputs/FilterDropdown'; // Make sure this import is present
import { useVerticals } from '../../hooks/useVerticals';
import { useSearchAllInvoices } from '../../hooks/useInvoices';
import { useSearchPurchaseOrders } from '../../hooks/usePurchaseOrders';
import { GrClose } from 'react-icons/gr';
import TableHeaderFilter from '../../components/Table/TableHeaderFilter';
import { getAllInventoryLocations } from '../../services/inventoryLocationService';
import { useQuery } from '@tanstack/react-query';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import ColumnCustomizationModal from '../../components/Table/ColumnCustomizationModal';
import { MdViewColumn } from 'react-icons/md';
import ActiveFilters from '../../components/InventoryComponents/ActiveFilters';

const InventoriesPage = () => {
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [isColumnCustomizationOpen, setIsColumnCustomizationOpen] =
    useState(false);

  // Estado local para el término de búsqueda (evita cursor jumping)
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const { user } = useContext(AuthContext);

  // Suppress react-beautiful-dnd warning
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Support for defaultProps will be removed')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Column customization state (localStorage)
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);

  // Load preferences when user changes
  useEffect(() => {
    if (user?.id) {
      const savedVisible = localStorage.getItem(
        `inventories-visible-columns-${user.id}`,
      );
      const savedOrder = localStorage.getItem(
        `inventories-column-order-${user.id}`,
      );

      if (savedVisible) {
        try {
          setVisibleColumns(JSON.parse(savedVisible));
        } catch (e) {
          console.error('Error parsing visible columns', e);
        }
      }

      if (savedOrder) {
        try {
          setColumnOrder(JSON.parse(savedOrder));
        } catch (e) {
          console.error('Error parsing column order', e);
        }
      }
    }
  }, [user?.id]);

  // Use mainViewMode from query params as the source of truth for view mode
  const { query, updateQuery } = useInventoryQueryParams();
  const { data: verticals } = useVerticals();
  const viewMode = query.mainViewMode || 'table'; // Default to 'table'

  // Fetch locations for filter
  const { data: locationsData } = useQuery({
    queryKey: ['inventory-locations'],
    queryFn: getAllInventoryLocations,
  });

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
    // Keep locationName as is for backend filtering
    if (query.locationName) {
      baseQuery.locationName = decodeURIComponent(query.locationName);
    }
    // Keep array filters as is
    if (query.modelName) {
      baseQuery.modelName = query.modelName;
    }
    if (query.brandName) {
      baseQuery.brandName = query.brandName;
    }
    if (query.typeName) {
      baseQuery.typeName = query.typeName;
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
  const {
    toggleInventory,
    isSelected,
    addMultipleInventories,
    removeMultipleInventories,
  } = useInventorySelection();

  const { data, isLoading, error, refetch } = useSearchInventories(searchQuery);
  const inventories = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: query.pageSize,
  };

  // Fetch all data without filters to get complete filter options
  const { data: allDataForFilters } = useSearchInventories({
    page: 1,
    pageSize: 10000, // Large number to get all records
    sortBy: null,
    order: 'desc',
  });
  const allInventoriesForFilters = allDataForFilters?.data || [];

  const isEditPermission = useCheckPermissions('edit_inventories');
  const isDeletePermission = useCheckPermissions('delete_inventories');
  const navigate = useNavigate();

  const [selectedTableRows, setSelectedTableRows] = useState({});
  const [selectedForDownload, setSelectedForDownload] = useState({});

  const onSelectTableRow = (row) => {
    // Toggle en el contexto global para el carrito
    toggleInventory(row);

    // Mantener la lógica original para descarga
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

  // Extract unique values for filters from ALL inventory data (not just current page)
  const filterOptions = useMemo(() => {
    const models = new Set();
    const brands = new Set();
    const types = new Set();
    const locations = new Set();
    const invoices = new Set();
    const purchaseOrders = new Set();

    // Use all data for filters, not just current page
    allInventoriesForFilters.forEach((inv) => {
      if (inv.model?.name) models.add(inv.model.name);
      if (inv.model?.brand?.name) brands.add(inv.model.brand.name);
      if (inv.model?.type?.name) types.add(inv.model.type.name);
      if (inv.location?.name) locations.add(inv.location.name);
      if (inv.invoice?.code) invoices.add(inv.invoice.code);
      if (inv.purchaseOrder?.code) purchaseOrders.add(inv.purchaseOrder.code);
    });

    // Also add location options from API
    if (locationsData) {
      locationsData.forEach((loc) => {
        if (loc.name) locations.add(loc.name);
      });
    }

    // Also add invoice/PO options from API
    if (invoiceData?.data) {
      invoiceData.data.forEach((inv) => {
        if (inv.code) invoices.add(inv.code);
      });
    }
    if (purchaseOrderData?.data) {
      purchaseOrderData.data.forEach((po) => {
        if (po.code) purchaseOrders.add(po.code);
      });
    }

    return {
      models: Array.from(models).sort(),
      brands: Array.from(brands).sort(),
      types: Array.from(types).sort(),
      locations: Array.from(locations).sort(),
      invoices: Array.from(invoices).sort(),
      purchaseOrders: Array.from(purchaseOrders).sort(),
    };
  }, [allInventoriesForFilters, locationsData, invoiceData, purchaseOrderData]);

  const onSelectAllTableRows = () => {
    const allSelected =
      Object.keys(selectedTableRows).length === inventories.length &&
      inventories.length > 0;
    const newSelectedRows = {};
    const newSelectedForDownload = {};

    if (!allSelected) {
      // Seleccionar todos
      inventories.forEach((row) => {
        newSelectedRows[row.id] = true;
        newSelectedForDownload[row.id] = row;
      });
      // Agregar todos al carrito
      addMultipleInventories(inventories);
    } else {
      // Deseleccionar todos - remover del carrito
      const inventoryIds = inventories.map((row) => row.id);
      removeMultipleInventories(inventoryIds);
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

  const allColumns = useMemo(
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
        key: 'location.name',
        title: 'Ubicación',
        sortable: true,
        render: (_, r) => r.location?.name || '-',
        headerClassName: 'w-32',
        cellClassName: 'w-32',
      },
      {
        key: 'purchaseOrder.code',
        title: 'Orden de Compra',
        sortable: true,
        render: (_, r) => r.purchaseOrder?.code || '-',
        headerClassName: 'w-36',
        cellClassName: 'w-36',
      },
      {
        key: 'invoice.code',
        title: 'Factura',
        sortable: true,
        render: (_, r) => r.invoice?.code || '-',
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
      viewMode,
    ],
  );

  // Apply column customization
  const columns = useMemo(() => {
    // If no customization, return all columns
    if (columnOrder.length === 0 || visibleColumns.length === 0) {
      return allColumns;
    }

    // Filter visible columns and apply custom order
    const orderedColumns = columnOrder
      .map((key) => allColumns.find((col) => col.key === key))
      .filter((col) => col && visibleColumns.includes(col.key));

    return orderedColumns;
  }, [allColumns, columnOrder, visibleColumns]);

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

  const handleSaveColumnCustomization = (newVisibleColumns, newColumnOrder) => {
    setVisibleColumns(newVisibleColumns);
    setColumnOrder(newColumnOrder);
    if (user?.id) {
      localStorage.setItem(
        `inventories-visible-columns-${user.id}`,
        JSON.stringify(newVisibleColumns),
      );
      localStorage.setItem(
        `inventories-column-order-${user.id}`,
        JSON.stringify(newColumnOrder),
      );
    }
  };

  const collapsedActions = [
    { label: 'Exportar CSV', icon: FaFileCsv, action: handleDownloadCSV },
    {
      label: isOpenPreview ? 'Ocultar Preview' : 'Mostrar Preview',
      icon: isOpenPreview
        ? TbLayoutSidebarLeftCollapseFilled
        : TbLayoutSidebarLeftExpandFilled,
      action: () => setIsOpenPreview((prev) => !prev),
    },
    {
      label: 'Personalizar Columnas',
      icon: MdViewColumn,
      action: () => setIsColumnCustomizationOpen(true),
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
        <div className="flex flex-col gap-2 md:flex-row items-center w-full flex-grow sm:w-auto">
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
          {/* Filter by vertical */}
          {/* <FilterDropdown
            options={verticalOptions}
            selected={query.verticalId}
            setSelected={(verticalIds) =>
              updateQuery({ ...query, verticalId: verticalIds, page: 1 })
            }
            titleDisplay="Vertical"
            label="Filtrar por Vertical"
            icon={<FaSitemap className="h-4 w-4" />}
          /> */}
        </div>

        {/* Filtros activos */}
        <ActiveFilters
          query={query}
          updateQuery={updateQuery}
          currentInvoice={currentInvoice}
          currentPurchaseOrder={currentPurchaseOrder}
          verticalOptions={verticalOptions}
        />
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
            headerFilters={{
              'model.name': {
                component: (
                  <TableHeaderFilter
                    options={filterOptions.models}
                    selected={query.modelName || []}
                    onChange={(values) =>
                      updateQuery({ ...query, modelName: values, page: 1 })
                    }
                    placeholder="Filtrar por modelo"
                  />
                ),
              },
              'model.brand.name': {
                component: (
                  <TableHeaderFilter
                    options={filterOptions.brands}
                    selected={query.brandName || []}
                    onChange={(values) =>
                      updateQuery({ ...query, brandName: values, page: 1 })
                    }
                    placeholder="Filtrar por marca"
                  />
                ),
              },
              'model.type.name': {
                component: (
                  <TableHeaderFilter
                    options={filterOptions.types}
                    selected={query.typeName || []}
                    onChange={(values) =>
                      updateQuery({ ...query, typeName: values, page: 1 })
                    }
                    placeholder="Filtrar por tipo"
                  />
                ),
              },
              'location.name': {
                component: (
                  <TableHeaderFilter
                    options={filterOptions.locations}
                    selected={query.locationName ? [query.locationName] : []}
                    onChange={(values) =>
                      updateQuery({
                        ...query,
                        locationName: values.length > 0 ? values[0] : null,
                        page: 1,
                      })
                    }
                    placeholder="Filtrar por ubicación"
                  />
                ),
              },
              'purchaseOrder.code': {
                component: (
                  <TableHeaderFilter
                    options={filterOptions.purchaseOrders}
                    selected={
                      query.purchaseOrderCode ? [query.purchaseOrderCode] : []
                    }
                    onChange={(values) =>
                      updateQuery({
                        ...query,
                        purchaseOrderCode: values.length > 0 ? values[0] : null,
                        purchaseOrderId: null,
                        page: 1,
                      })
                    }
                    placeholder="Filtrar por OC"
                  />
                ),
              },
              'invoice.code': {
                component: (
                  <TableHeaderFilter
                    options={filterOptions.invoices}
                    selected={query.invoiceCode ? [query.invoiceCode] : []}
                    onChange={(values) =>
                      updateQuery({
                        ...query,
                        invoiceCode: values.length > 0 ? values[0] : null,
                        invoiceId: null,
                        page: 1,
                      })
                    }
                    placeholder="Filtrar por factura"
                  />
                ),
              },
              vertical: {
                component: (
                  <TableHeaderFilter
                    options={verticalOptions.map((v) => v.name)}
                    selected={
                      query.verticalId
                        ?.map(
                          (id) =>
                            verticalOptions.find((v) => v.id === id)?.name,
                        )
                        .filter(Boolean) || []
                    }
                    onChange={(selectedNames) => {
                      const selectedIds = selectedNames
                        .map(
                          (name) =>
                            verticalOptions.find((v) => v.name === name)?.id,
                        )
                        .filter(Boolean);
                      updateQuery({
                        ...query,
                        verticalId: selectedIds,
                        page: 1,
                      });
                    }}
                    placeholder="Filtrar por vertical"
                  />
                ),
              },
              status: {
                component: (
                  <TableHeaderFilter
                    options={['ALTA', 'BAJA', 'PROPUESTA']}
                    selected={query.status || []}
                    onChange={(values) =>
                      updateQuery({ ...query, status: values, page: 1 })
                    }
                    placeholder="Filtrar por estatus"
                  />
                ),
              },
              conditions: {
                component: (
                  <TableHeaderFilter
                    options={inventoryConditions.map((c) => c.name)}
                    selected={query.conditionName || []}
                    onChange={(values) =>
                      updateQuery({ ...query, conditionName: values, page: 1 })
                    }
                    placeholder="Filtrar por condición"
                  />
                ),
              },
            }}
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
      <ColumnCustomizationModal
        isOpen={isColumnCustomizationOpen}
        onClose={() => setIsColumnCustomizationOpen(false)}
        columns={allColumns}
        visibleColumns={
          visibleColumns.length > 0
            ? visibleColumns
            : allColumns.map((col) => col.key)
        }
        columnOrder={
          columnOrder.length > 0
            ? columnOrder
            : allColumns.map((col) => col.key)
        }
        onSave={handleSaveColumnCustomization}
      />
    </div>
  );
};

export default InventoriesPage;
