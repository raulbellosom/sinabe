import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useInventoryContext } from '../../context/InventoryContext';
import ModalRemove from '../../components/Modals/ModalRemove';
import ModalViewer from '../../components/Modals/ModalViewer';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { useNavigate } from 'react-router-dom';
import { LuFileSpreadsheet } from 'react-icons/lu';
import {
  FaClipboardList,
  FaEdit,
  FaEye,
  FaRegFile,
  FaTable,
  FaTrash,
} from 'react-icons/fa';
import { Checkbox, Dropdown, Table as T } from 'flowbite-react';
import { useQuery } from '@tanstack/react-query';
import { searchInventories } from '../../services/api';
import Card from '../../components/Card/Card';
import { parseToLocalDate } from '../../utils/formatValues';
import { MdOutlineFileUpload } from 'react-icons/md';
import CreateMultipleInventory from './CreateMultipleInventory';
import { downloadCSV } from '../../utils/DownloadCSV';
import Notifies from '../../components/Notifies/Notifies';
import { IoMdAdd } from 'react-icons/io';
import { inventoryColumns } from '../../utils/InventoryFields';
import TableResultsNotFound from '../../components/Table/TableResultsNotFound';
import { useCatalogContext } from '../../context/CatalogContext';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
const Table = React.lazy(() => import('../../components/Table/Table'));
const TableHeader = React.lazy(
  () => import('../../components/Table/TableHeader'),
);
const TableActions = React.lazy(
  () => import('../../components/Table/TableActions'),
);
const TableFooter = React.lazy(
  () => import('../../components/Table/TableFooter'),
);
import LinkButton from '../../components/ActionButtons/LinkButton';
import withPermission from '../../utils/withPermissions';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import InventoriesImagesView from './views/InventoriesImagesView';
import {
  downloadImagesAsZip,
  downloadFilesAsZip,
} from '../../utils/downloadImagesAsZip';
import { BsThreeDotsVertical } from 'react-icons/bs';
import classNames from 'classnames';
import InventoryPreview from './views/InventoryPreview';
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from 'react-icons/tb';
import { formatInventoriesToCSVString } from '../../utils/inventoriesUtils';
import { RiFolderImageFill } from 'react-icons/ri';
import { useInventoryQueryParams } from '../../hooks/useInventoryQueryParams';
import debounce from 'lodash/debounce';

const Inventories = () => {
  const { deleteInventory } = useInventoryContext();
  const { inventoryConditions } = useCatalogContext();
  const { query, updateQuery } = useInventoryQueryParams();

  const [columns, setColumns] = useState([...inventoryColumns]);
  const [selectAllCheckbox, setSelectAllCheckbox] = useState(false);
  const [itemsToDownload, setItemsToDownload] = useState({});
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalUpload, setIsOpenModalUpload] = useState(false);
  const [inventoryId, setInventoryId] = useState(null);
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [inventoryPreview, setInventoryPreview] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const {
    data: inventories,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['inventories', query],
    queryFn: ({ signal }) => searchInventories({ ...query, signal }),
    keepPreviousData: true,
    staleTime: 5000,
  });

  // useEffect(() => {
  //   refetch();
  // }, [query]);

  useEffect(() => {
    setSearchInput(query.searchTerm || '');
  }, [query.searchTerm]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateQuery({ searchTerm: value, page: 1 });
      }, 500), // 500ms de retardo
    [],
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const changePageSize = (e) => {
    updateQuery({ pageSize: parseInt(e.target.value), page: 1 });
  };

  const goOnPrevPage = () => updateQuery({ page: query.page - 1 });
  const goOnNextPage = () => updateQuery({ page: query.page + 1 });
  const handleSelectChange = (p) => updateQuery({ page: p });

  const handleToggleAdvancedSearch = (enabled) => {
    console.log(enabled);
    updateQuery({ advancedSearch: enabled ? 'true' : 'false' });
  };

  const onCheckFilter = (value) => {
    if (value === 'ALL') {
      const isAllSelected = query.conditionName.includes('ALL');
      updateQuery({ conditionName: isAllSelected ? [] : ['ALL'], page: 1 });
      return;
    }

    const current = query.conditionName.includes('ALL')
      ? []
      : [...query.conditionName];
    const next = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];
    updateQuery({ conditionName: next, page: 1 });
  };

  const handleStatusFilter = (value) => {
    const options = ['ALTA', 'PROPUESTA', 'BAJA'];
    if (value === 'all') {
      const next = query.status.length === options.length ? [] : options;
      updateQuery({ status: next, page: 1 });
    } else {
      const next = query.status.includes(value)
        ? query.status.filter((s) => s !== value)
        : [...query.status, value];
      updateQuery({ status: next, page: 1 });
    }
  };

  useEffect(() => {
    localStorage.setItem('isOpenPreview', JSON.stringify(isOpenPreview));
  }, [isOpenPreview]);

  useEffect(() => {
    localStorage.setItem('inventoryPreview', JSON.stringify(inventoryPreview));
  }, [inventoryPreview]);

  const sortBy = (column) => {
    const selectedHeaderIndex = columns?.findIndex((col) => col.id === column);
    if (selectedHeaderIndex !== -1) {
      const selectedHeader = columns[selectedHeaderIndex];
      const updatedOrder = selectedHeader?.order === 'asc' ? 'desc' : 'asc';
      const updatedHeader = {
        ...selectedHeader,
        order: updatedOrder,
      };

      const updatedHeaders = [...columns];
      updatedHeaders[selectedHeaderIndex] = updatedHeader;
      setColumns(updatedHeaders);

      updateQuery({ sortBy: column, order: updatedOrder });
    }
  };

  const selectAll = () => {
    const { data: items } = inventories;
    setSelectAllCheckbox((prevState) => !prevState);
    let inventoriesObj = {};
    for (let i = 0; i < items?.length; i++) {
      inventoriesObj[items[i].id] = items[i]; // Guarda el objeto, no el string
    }
    setItemsToDownload(!selectAllCheckbox ? inventoriesObj : {});
  };

  const handleDeleteInventory = () => {
    if (inventoryId) {
      deleteInventory(inventoryId);
      navigate('/inventories');
      setIsOpenModal(false);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value[key], obj);
  };

  const inventoriesToDownload = (inventoryId, inventory) => {
    if (inventoryId) {
      let items = { ...itemsToDownload };
      if (!items[inventoryId]) {
        items[inventoryId] = inventory;
      } else {
        delete items[inventoryId];
      }
      setItemsToDownload(items);
    }
  };

  const downloadInventoriesCSV = () => {
    if (Object.keys(itemsToDownload).length > 0) {
      const formattedCSV = formatInventoriesToCSVString(itemsToDownload);
      downloadCSV({ data: formattedCSV, fileName: 'inventarios' });
    } else {
      Notifies('error', 'Selecciona los inventarios a descargar');
    }
  };

  const handleGetChanges = () => {
    refetch();
    Notifies('info', 'Informacion actualizada correctamente');
  };

  const handleDownloadZipImages = (selectedImages, isLowQuality = false) => {
    if (!selectedImages || selectedImages.length === 0) {
      Notifies('error', 'No hay imágenes para descargar.');
      return;
    }
    downloadImagesAsZip(selectedImages, isLowQuality);
    Notifies('success', 'Iniciando descarga ZIP...');
  };

  const isCreatePermission = useCheckPermissions('create_inventories');
  const isEditPermission = useCheckPermissions('edit_inventories');
  const isDeletePermission = useCheckPermissions('delete_inventories');
  const isViewPermission = useCheckPermissions('view_inventories');
  const isViewSelfPermission = useCheckPermissions('view_self_inventories');

  const collapsedActions = (inventory) => [
    {
      label: 'Editar',
      icon: FaEdit,
      action: isEditPermission.hasPermission
        ? () => navigate(`/inventories/edit/${inventory.id}`)
        : null,
      disabled: isEditPermission.hasPermission,
    },
    {
      label: 'Eliminar',
      icon: FaTrash,
      action: isDeletePermission.hasPermission
        ? () => {
            setIsOpenModal(true);
            setInventoryId(inventory.id);
          }
        : null,
      disabled: isDeletePermission.hasPermission,
    },
  ];

  return (
    <>
      <section className="flex flex-col gap-3 bg-white shadow-md rounded-md dark:bg-gray-900 p-3 antialiased">
        <TableHeader
          icon={FaClipboardList}
          title="Inventario"
          actions={[
            {
              label: 'Nuevo',
              href: isCreatePermission.hasPermission
                ? '/inventories/create'
                : null,
              color: 'mycad',
              icon: IoMdAdd,
              filled: true,
            },
          ]}
          // TODO AUN no termino de implementar el dropdown de acciones
          collapsedActions={[
            {
              label: 'Exportar',
              action: downloadInventoriesCSV,
              color: 'green',
              icon: LuFileSpreadsheet,
              disabled: Object.keys(itemsToDownload).length === 0,
            },
            {
              label: 'Importar',
              action: isCreatePermission.hasPermission
                ? () => setIsOpenModalUpload(true)
                : null,
              color: 'blue',
              icon: MdOutlineFileUpload,
            },
            {
              label: viewMode === 'table' ? 'Recursos' : 'Tabla',
              action: () =>
                setViewMode(viewMode === 'table' ? 'images' : 'table'),
              color: 'black',
              icon: viewMode === 'table' ? RiFolderImageFill : FaTable,
            },
            {
              label: isOpenPreview
                ? 'Ocultar vista previa'
                : 'Mostrar vista previa',
              action: () => {
                setIsOpenPreview(!isOpenPreview);
                if (!isOpenPreview) {
                  setInventoryPreview();
                }
              },
              icon: isOpenPreview
                ? TbLayoutSidebarLeftCollapseFilled
                : TbLayoutSidebarLeftExpandFilled,
            },
          ]}
        />
        <TableActions
          searchTerm={searchInput}
          handleSearchTerm={handleSearch}
          selectedFilters={query.conditionName}
          filters={inventoryConditions}
          onCheckFilter={onCheckFilter}
          inventoryConditions={inventoryConditions}
          onRefreshData={handleGetChanges}
          selectedStatuses={query.status}
          statusOptions={['ALTA', 'PROPUESTA', 'BAJA']}
          onCheckStatus={handleStatusFilter}
          advancedSearch={query.advancedSearch}
          onToggleAdvancedSearch={handleToggleAdvancedSearch}
        />
        {/* Vista tabla e imágenes */}
        {viewMode === 'table' ? (
          <>
            {inventories && !isPending ? (
              inventories?.data?.length > 0 ? (
                <>
                  <div
                    className={classNames('hidden md:grid gap-4', {
                      'md:grid-cols-1': !isOpenPreview,
                      'md:grid-cols-3': isOpenPreview,
                    })}
                  >
                    <div
                      className={classNames({
                        'col-span-3': !isOpenPreview,
                        'col-span-2': isOpenPreview,
                      })}
                    >
                      <Table
                        columns={columns}
                        sortBy={sortBy}
                        sortedBy={query.sortBy}
                        selectAll={selectAll}
                      >
                        {inventories &&
                          !isPending &&
                          inventories?.data?.map((inventory) => {
                            if (selectAllCheckbox) {
                              inventory = {
                                ...inventory,
                                checked: true,
                              };
                            }
                            return (
                              <T.Row
                                onDoubleClick={() =>
                                  (isViewPermission.hasPermission ||
                                    isViewSelfPermission.hasPermission) &&
                                  navigate(`/inventories/view/${inventory.id}`)
                                }
                                onClick={(event) => {
                                  if (event.ctrlKey) {
                                    (isViewPermission.hasPermission ||
                                      isViewSelfPermission.hasPermission) &&
                                      window.open(
                                        `/inventories/view/${inventory.id}`,
                                        '_blank',
                                      );
                                  } else {
                                    if (isOpenPreview) {
                                      setInventoryPreview(inventory);
                                    }
                                  }
                                }}
                                key={inventory.id}
                                className={classNames(
                                  'whitespace-nowrap dark:border-gray-600 text-gray-800 hover:bg-neutral-100 dark:hover:bg-gray-700 border-b border-b-neutral-200',
                                  {
                                    // 'bg-purple-400 text-white hover:text-black dark:bg-gray-700':
                                    //   itemsToDownload[inventory?.id],
                                    'bg-neutral-200':
                                      inventoryPreview?.id === inventory.id &&
                                      isOpenPreview,
                                  },
                                )}
                              >
                                {inventoryColumns?.map((column) => {
                                  let content;
                                  if (column.id === 'checkbox') {
                                    return (
                                      <T.Cell
                                        className={classNames('py-2', {
                                          'bg-sinabe-success/20':
                                            inventory.status === 'ALTA',
                                          'bg-sinabe-danger/20':
                                            inventory.status === 'BAJA',
                                          'bg-sinabe-warning/20 ':
                                            inventory.status === 'PROPUESTA',
                                        })}
                                        key={column.id}
                                      >
                                        <Checkbox
                                          className="cursor-pointer text-purple-500 focus:ring-purple-500"
                                          onChange={() =>
                                            inventoriesToDownload(
                                              inventory.id,
                                              inventory,
                                            )
                                          }
                                          checked={
                                            itemsToDownload[inventory?.id]
                                              ? true
                                              : false
                                          }
                                        />
                                      </T.Cell>
                                    );
                                  } else if (
                                    [
                                      'receptionDate',
                                      'createdAt',
                                      'updatedAt',
                                    ].includes(column.id)
                                  ) {
                                    content = parseToLocalDate(
                                      getNestedValue(inventory, column.id),
                                    );
                                  } else {
                                    content = getNestedValue(
                                      inventory,
                                      column.id,
                                    );
                                  }
                                  if (
                                    column.id === 'images' &&
                                    inventory?.images?.length > 0
                                  ) {
                                    return (
                                      <T.Cell
                                        key={column.id}
                                        className="w-20 py-2"
                                      >
                                        <ImageViewer
                                          images={[inventory?.images[0]]}
                                          containerClassNames={
                                            'first:w-12 first:h-12 first:rounded-md'
                                          }
                                        />
                                      </T.Cell>
                                    );
                                  }

                                  if (column.id === 'model.name') {
                                    return (
                                      <T.Cell
                                        key={column.id}
                                        className="font-semibold whitespace-nowrap dark:text-white py-2"
                                      >
                                        {getNestedValue(inventory, column.id)}
                                      </T.Cell>
                                    );
                                  }
                                  if (column.id === 'status') {
                                    return (
                                      <T.Cell className="py-2" key={column.id}>
                                        <span
                                          className={`px-4 py-1 text-white rounded-full text-xs font-medium ${
                                            inventory.status === 'ALTA'
                                              ? 'bg-sinabe-success'
                                              : inventory.status === 'BAJA'
                                                ? 'bg-sinabe-danger'
                                                : 'bg-sinabe-warning'
                                          }`}
                                        >
                                          {inventory.status === 'PROPUESTA'
                                            ? 'PROPUESTA DE BAJA'
                                            : inventory.status}
                                        </span>
                                      </T.Cell>
                                    );
                                  }
                                  if (column.id === 'comments') {
                                    return (
                                      <T.Cell
                                        key={column.id}
                                        className="whitespace-wrap text-wrap py-2 min-w-72 max-w-72 truncate"
                                      >
                                        {content?.substring(0, 50)}
                                      </T.Cell>
                                    );
                                  }
                                  if (column.id === 'files') {
                                    return (
                                      <T.Cell key={column.id}>
                                        <span className="w-fit p-2 px-4 flex justify-center items-center gap-2 bg-sky-50 text-black rounded-md">
                                          <FaRegFile className="text-neutral-500" />
                                          {content?.length}
                                        </span>
                                      </T.Cell>
                                    );
                                  }
                                  if (column.id === 'actions') {
                                    return (
                                      <T.Cell className="py-2" key={column.id}>
                                        <div className="flex justify-center items-center gap-2">
                                          {(isViewPermission.hasPermission ||
                                            isViewSelfPermission.hasPermission) && (
                                            <LinkButton
                                              route={`/inventories/view/${inventory.id}`}
                                              label="Ver"
                                              icon={FaEye}
                                              color="cyan"
                                            />
                                          )}
                                          {collapsedActions(inventory).some(
                                            (item) => item.disabled === true,
                                          ) &&
                                            collapsedActions(inventory) && (
                                              <Dropdown
                                                renderTrigger={() => (
                                                  <button className="w-fit bg-white hover:bg-neutral-200 md:w-fit h-9 xl:h-10 text-sm xl:text-base cursor-pointer transition ease-in-out duration-200 p-4 flex items-center justify-center rounded-md border text-stone-800">
                                                    <BsThreeDotsVertical className="text-lg text-neutral-600" />
                                                  </button>
                                                )}
                                                dismissOnClick={true}
                                                inline
                                                arrowIcon={null}
                                                placement="right"
                                                className="md:w-52"
                                              >
                                                {collapsedActions(
                                                  inventory,
                                                ).map(
                                                  (action, index) =>
                                                    action.disabled && (
                                                      <Dropdown.Item
                                                        key={index}
                                                        className="min-w-36 min-h-12"
                                                        onClick={() =>
                                                          action?.action()
                                                        }
                                                        icon={action?.icon}
                                                      >
                                                        <span>
                                                          {action?.label}
                                                        </span>
                                                      </Dropdown.Item>
                                                    ),
                                                )}
                                              </Dropdown>
                                            )}
                                        </div>
                                      </T.Cell>
                                    );
                                  }
                                  return (
                                    <T.Cell
                                      className="text-nowrap py-2"
                                      key={column.id}
                                    >
                                      {content}
                                    </T.Cell>
                                  );
                                })}
                              </T.Row>
                            );
                          })}
                      </Table>
                    </div>
                    <div
                      className={classNames('hidden ', {
                        'md:hidden': !isOpenPreview,
                        'col-span-1 md:flex items-start justify-start gap-3 w-full h-full overflow-hidden':
                          isOpenPreview,
                      })}
                    >
                      {inventoryPreview && (
                        <InventoryPreview
                          inventory={inventoryPreview}
                          onClose={() => {
                            setIsOpenPreview(false);
                            setInventoryPreview();
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 md:hidden">
                    {inventories?.data?.map((inventory) => {
                      const data = {
                        image: {
                          key: 'Imagen',
                          value: inventory?.images,
                        },
                        title: {
                          key: 'Inventario',
                          value: inventory?.model?.name,
                        },
                        subtitle: {
                          key: 'Marca y Tipo',
                          value: (
                            <>
                              {`${inventory?.model?.brand?.name} ${inventory?.model?.type?.name}`}
                              <br />
                              <span className="text-xs text-gray-500">
                                {inventory?.internalFolio || '-'}
                              </span>
                            </>
                          ),
                        },
                        status: {
                          key: 'Estado',
                          value:
                            inventory?.status === 'PROPUESTA'
                              ? 'PROPUESTA DE BAJA'
                              : inventory.status,
                        },
                        tags: {
                          key: 'Condiciones',
                          value: inventory?.conditions?.map((condition, i) => (
                            <span key={condition.id || i}>
                              {condition?.condition?.name}
                            </span>
                          )),
                        },
                        serialNumber: {
                          key: 'Número de serie',
                          value: inventory?.serialNumber,
                        },
                        activeNumber: {
                          key: 'Número de activo',
                          value: inventory?.activeNumber,
                        },
                        receptionDate: {
                          key: 'F. de recepción',
                          value: inventory?.receptionDate
                            ? parseToLocalDate(inventory?.receptionDate)
                            : '',
                        },
                        createdAt: {
                          key: 'F. de creación',
                          value: parseToLocalDate(inventory?.createdAt),
                        },
                        updatedAt: {
                          key: 'F. de actualización',
                          value: parseToLocalDate(inventory?.updatedAt),
                        },
                        actions: {
                          key: 'Acciones',
                          value: (
                            <div className="flex items-center justify-end gap-3">
                              {(isViewPermission.hasPermission ||
                                isViewSelfPermission.hasPermission) && (
                                <ActionButtons
                                  extraActions={[
                                    {
                                      label: 'Ver',
                                      icon: FaEye,
                                      color: 'cyan',
                                      action: () =>
                                        navigate(
                                          `/inventories/view/${inventory.id}`,
                                        ),
                                    },
                                  ]}
                                />
                              )}
                              {collapsedActions(inventory).some(
                                (item) => item.disabled === true,
                              ) &&
                                collapsedActions(inventory) && (
                                  <Dropdown
                                    renderTrigger={() => (
                                      <button className="w-fit bg-white hover:bg-neutral-200 md:w-fit h-9 xl:h-10 text-sm xl:text-base cursor-pointer transition ease-in-out duration-200 p-4 flex items-center justify-center rounded-md border text-stone-800">
                                        <BsThreeDotsVertical className="text-lg text-neutral-600" />
                                      </button>
                                    )}
                                    dismissOnClick={true}
                                    inline
                                    arrowIcon={null}
                                    placement="right"
                                    className="md:w-52"
                                  >
                                    {collapsedActions(inventory).map(
                                      (action, index) =>
                                        action.disabled && (
                                          <Dropdown.Item
                                            key={index}
                                            className="min-w-36 min-h-12"
                                            onClick={() => action?.action()}
                                            icon={action?.icon}
                                          >
                                            <span>{action?.label}</span>
                                          </Dropdown.Item>
                                        ),
                                    )}
                                  </Dropdown>
                                )}
                            </div>
                          ),
                        },
                      };
                      return <Card key={inventory.id} data={data} showImage />;
                    })}
                  </div>
                </>
              ) : (
                <TableResultsNotFound />
              )
            ) : (
              <Skeleton className="w-full h-10" count={10} />
            )}
          </>
        ) : (
          <>
            {inventories && !isPending ? (
              inventories?.data?.length > 0 ? (
                <InventoriesImagesView
                  inventories={inventories?.data || []}
                  onDownloadZip={handleDownloadZipImages}
                  onDownloadFilesZip={downloadFilesAsZip}
                />
              ) : (
                <TableResultsNotFound />
              )
            ) : (
              <Skeleton className="w-full h-10" count={10} />
            )}
          </>
        )}
        {inventories?.pagination && (
          <TableFooter
            pagination={inventories?.pagination}
            goOnNextPage={goOnNextPage}
            goOnPrevPage={goOnPrevPage}
            handleSelectChange={handleSelectChange}
            changePageSize={changePageSize}
          />
        )}
      </section>
      <ModalViewer
        isOpenModal={isOpenModalUpload}
        onCloseModal={() => setIsOpenModalUpload(false)}
        title="Cargar inventarios"
        dismissible
      >
        <CreateMultipleInventory />
      </ModalViewer>
      <ModalRemove
        isOpenModal={isOpenModal}
        onCloseModal={() => setIsOpenModal(false)}
        removeFunction={handleDeleteInventory}
      />
    </>
  );
};

const ProtectedInventoriesView = withPermission(Inventories, [
  'view_inventories',
  'view_self_inventories',
]);

export default ProtectedInventoriesView;
