import { useState, useMemo, useEffect } from 'react';
import ModalViewer from '../../components/Modals/ModalViewer';
import ImageViewer from '../../components/ImageViewer/ImageViewer2';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Eye,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchInventories, updateInventoriesStatus } from '../../services/api';
import { parseToLocalDate } from '../../utils/formatValues';
// Los generadores se importarán dinámicamente cuando se necesiten
import Notifies from '../../components/Notifies/Notifies';

import withPermission from '../../utils/withPermissions';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import { useInventoryQueryParams } from '../../hooks/useInventoryQueryParams';
import debounce from 'lodash/debounce';
import TableHeader from '../../components/Table/TableHeader';
import ResponsiveTable from '../../components/Table/ResponsiveTable';
import { API_URL } from '../../services/api';

const InventoryDecommissioning = () => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        key: 'images',
        title: 'Imagen',
        render: (_, row) =>
          row.images?.length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImages(row.images);
                setIsImageViewerOpen(true);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <ImageViewer
                containerClassNames="w-20 h-20 md:w-12 md:h-12"
                showOnlyFirstImage={true}
                images={row.images || []}
              />
            </div>
          ) : (
            <div className="w-20 h-20 md:w-12 md:h-12 bg-[color:var(--surface-muted)] rounded-md" />
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
        key: 'status',
        title: 'Estado',
        sortable: true,
        render: (val) => (
          <span className="px-4 py-1 text-white rounded-full text-xs font-medium bg-amber-500">
            PROPUESTA DE BAJA
          </span>
        ),
        headerClassName: 'w-28',
        cellClassName: 'w-28',
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
        key: 'actions',
        title: 'Acciones',
        sortable: false,
        render: (_, row) => (
          <div className="flex gap-2">
            <ActionButtons
              extraOptions={[
                {
                  key: 'main',
                  label: 'Ver',
                  icon: Eye,
                  action: () => navigate(`/inventories/view/${row.id}`),
                  disabled: false,
                },
              ]}
            />
          </div>
        ),
        headerClassName: 'w-28',
        cellClassName: 'w-28',
      },
    ],
    [navigate],
  );
  const { query, updateQuery } = useInventoryQueryParams();
  const [selectAllCheckbox, setSelectAllCheckbox] = useState(false);
  const [itemsToProcess, setItemsToProcess] = useState({});
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  const {
    data: inventories,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['inventories', query],
    queryFn: ({ signal }) =>
      searchInventories({
        ...query,
        status: ['PROPUESTA'],
        signal,
      }),
    keepPreviousData: true,
    staleTime: 5000,
  });

  useEffect(() => {
    setSearchInput(query.searchTerm || '');
  }, [query.searchTerm]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateQuery({
          searchTerm: value,
          page: 1,
          advancedSearch: query.advancedSearch ?? 'true',
        });
      }, 500),
    [query.advancedSearch],
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const selectAll = () => {
    const { data: items } = inventories;
    setSelectAllCheckbox((prevState) => !prevState);
    let inventoriesObj = {};
    for (let i = 0; i < items?.length; i++) {
      inventoriesObj[items[i].id] = items[i];
    }
    setItemsToProcess(!selectAllCheckbox ? inventoriesObj : {});
  };

  const handleProcessInventories = () => {
    if (Object.keys(itemsToProcess).length === 0) {
      Notifies('error', 'Selecciona los inventarios a procesar');
      return;
    }
    setIsOpenModal(true);
  };

  const handleConfirmDecommissioning = async () => {
    if (confirmText !== 'CONFIRMAR BAJA') {
      Notifies('error', 'El texto de confirmación no es correcto');
      return;
    }

    try {
      await updateInventoriesStatus(Object.keys(itemsToProcess), 'BAJA');
      Notifies('success', 'Inventarios actualizados correctamente');
      setIsOpenModal(false);
      setItemsToProcess({});
      setConfirmText('');
      refetch();
    } catch (error) {
      console.error('Error updating inventories:', error);
      Notifies('error', 'Error al actualizar los inventarios');
    }
  };

  const handleGenerateExcelReport = async () => {
    if (isGeneratingExcel || isGeneratingWord) return;

    setIsGeneratingExcel(true);
    try {
      const { generateExcelReport } =
        await import('../../utils/reportGenerators');
      await generateExcelReport(itemsToProcess);
      Notifies('success', 'Reporte Excel generado correctamente');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      Notifies('error', 'Error al generar el reporte Excel');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleGenerateWordReport = async () => {
    if (isGeneratingWord || isGeneratingExcel) return;

    setIsGeneratingWord(true);
    try {
      const { generateWordReport } =
        await import('../../utils/reportGenerators');
      await generateWordReport(itemsToProcess);
      Notifies('success', 'Reporte Word generado correctamente');
    } catch (error) {
      console.error('Error generating Word report:', error);
      Notifies('error', 'Error al generar el reporte Word');
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value[key], obj);
  };

  const inventoriesToProcess = (inventoryId, inventory) => {
    if (inventoryId) {
      let items = { ...itemsToProcess };
      if (!items[inventoryId]) {
        items[inventoryId] = inventory;
      } else {
        delete items[inventoryId];
      }
      setItemsToProcess(items);
    }
  };

  const isViewPermission = useCheckPermissions('view_inventories');
  const isViewSelfPermission = useCheckPermissions('view_self_inventories');

  return (
    <>
      <section className="flex flex-col gap-3 bg-[color:var(--surface)] shadow-md rounded-md p-3 antialiased">
        <TableHeader
          icon={ClipboardList}
          title="Bajas de Inventario"
          actions={[
            {
              label: `Generar baja (${Object.keys(itemsToProcess).length})`,
              action: handleProcessInventories,
              color: 'red',
              icon: ClipboardList,
              filled: true,
              disabled: Object.keys(itemsToProcess).length === 0,
            },
          ]}
        />
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar inventarios..."
              className="w-full p-2 border rounded-md bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] transition-colors"
              value={searchInput}
              onChange={handleSearch}
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] transition-colors"
            title="Actualizar"
          >
            <RefreshCw />
          </button>
        </div>
        <ResponsiveTable
          columns={columns}
          data={inventories?.data || []}
          loading={isPending}
          error={null}
          sortConfig={{ key: query.sortBy, direction: query.order }}
          onSort={(key) => {
            updateQuery({
              sortBy: key,
              order:
                key === query.sortBy
                  ? query.order === 'asc'
                    ? 'desc'
                    : 'asc'
                  : 'asc',
            });
          }}
          pagination={{
            currentPage: query.page,
            totalPages: inventories?.pagination?.totalPages || 1,
            totalRecords: inventories?.pagination?.totalRecords || 0,
            pageSize: query.pageSize || 10,
          }}
          onPageChange={(page) => updateQuery({ page })}
          onPageSizeChange={(pageSize) => updateQuery({ pageSize, page: 1 })}
          selectable={true}
          selectedRows={itemsToProcess}
          onSelectRow={(row) => inventoriesToProcess(row.id, row)}
          onSelectAllRows={() => selectAll()}
          onRowDoubleClick={(row) => navigate(`/inventories/view/${row.id}`)}
        />
      </section>

      <ModalViewer
        isOpenModal={isOpenModal}
        onCloseModal={() => {
          setIsOpenModal(false);
          setConfirmText('');
        }}
        title="Confirmar Baja de Inventarios"
        size="lg"
        dismissible
      >
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-[color:var(--primary)]/10 p-4 rounded-lg border border-[color:var(--primary)]/30">
              <CheckCircle className="text-3xl text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--primary)]">
                  Se procesarán {Object.keys(itemsToProcess).length} inventarios
                </h3>
                <p className="text-[color:var(--foreground-muted)]">
                  Los siguientes inventarios cambiarán su estado a BAJA
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--surface-muted)] p-4 rounded-lg border border-[color:var(--border)]">
            <h4 className="text-[color:var(--foreground)] font-medium mb-3 flex items-center gap-2">
              <Download className="text-lg" />
              Descargar Reportes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleGenerateExcelReport}
                disabled={isGeneratingExcel || isGeneratingWord}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isGeneratingExcel || isGeneratingWord
                    ? 'bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] cursor-not-allowed opacity-60'
                    : 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800'
                }`}
              >
                <FileSpreadsheet
                  className={`text-xl ${isGeneratingExcel ? 'animate-spin' : ''}`}
                />
                <span className="font-medium">
                  {isGeneratingExcel ? 'Generando...' : 'Reporte Excel'}
                </span>
              </button>
              <button
                onClick={handleGenerateWordReport}
                disabled={isGeneratingWord || isGeneratingExcel}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isGeneratingWord || isGeneratingExcel
                    ? 'bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] cursor-not-allowed opacity-60'
                    : 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <FileText
                  className={`text-xl ${isGeneratingWord ? 'animate-spin' : ''}`}
                />
                <span className="font-medium">
                  {isGeneratingWord ? 'Generando...' : 'Reporte Word'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex gap-3">
              <AlertTriangle className="text-3xl text-orange-500 flex-shrink-0" />
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                  Confirmar Acción
                </h4>
                <p className="text-orange-700 dark:text-orange-400 text-sm">
                  Esta es una acción irreversible. Para confirmar la baja de los
                  inventarios, escriba "CONFIRMAR BAJA" en el campo siguiente.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                className="w-full p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-orange-900/10 text-orange-900 dark:text-orange-200 placeholder-orange-300 dark:placeholder-orange-700 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200"
                placeholder="CONFIRMAR BAJA"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />

              <button
                onClick={handleConfirmDecommissioning}
                className="w-full px-4 py-3 text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                disabled={confirmText !== 'CONFIRMAR BAJA'}
              >
                <AlertCircle
                  className={
                    confirmText === 'CONFIRMAR BAJA'
                      ? 'text-xl animate-pulse'
                      : 'text-xl'
                  }
                />
                <span className="font-medium">
                  Confirmar Baja de Inventarios
                </span>
              </button>
            </div>
          </div>
        </div>
      </ModalViewer>
    </>
  );
};

const ProtectedInventoryDecommissioning = withPermission(
  InventoryDecommissioning,
  ['view_inventories', 'view_self_inventories'],
);

export default ProtectedInventoryDecommissioning;
