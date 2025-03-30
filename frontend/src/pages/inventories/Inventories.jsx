import React, { useCallback, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useInventoryContext } from '../../context/InventoryContext';
import ModalRemove from '../../components/Modals/ModalRemove';
import ModalViewer from '../../components/Modals/ModalViewer';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { MdOutlineFileUpload, MdPhotoAlbum } from 'react-icons/md';
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
import { downloadImagesAsZip } from '../../utils/downloadImagesAsZip';
import { BsThreeDotsVertical } from 'react-icons/bs';

const formatInventory = (inventoryData) => {
  const { model, receptionDate, activeNumber, serialNumber } = inventoryData;
  const inventory = `\n${model?.name},${model?.type?.name},${model?.brand?.name},${serialNumber},${activeNumber},${receptionDate}`;
  return inventory;
};

const Inventories = () => {
  const { deleteInventory } = useInventoryContext();
  const { inventoryConditions } = useCatalogContext();
  const [columns, setColumns] = useState([...inventoryColumns]);
  const [selectAllCheckbox, setSelectAllCheckbox] = useState(false);
  const [itemsToDownload, setItemsToDownload] = useState({});
  const navigate = useNavigate();
  const lastChange = useRef();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalUpload, setIsOpenModalUpload] = useState(false);
  const [inventoryId, setInventoryId] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [searchParams, setSearchParams] = useSearchParams();

  // Agregamos el filtro de estado; por defecto, si no hay selección, mostramos todos
  const initialFilters = {
    searchTerm: searchParams.get('searchTerm') || '',
    pageSize: Number(searchParams.get('pageSize')) || 10,
    page: Number(searchParams.get('page')) || 1,
    sortBy: searchParams.get('sortBy') || 'updatedAt',
    order: searchParams.get('order') || 'desc',
    conditionName: searchParams.getAll('conditionName') || [],
    deepSearch: searchParams.get('deepSearch')
      ? JSON.parse(searchParams.get('deepSearch'))
      : [],
    status: searchParams.getAll('status') || [], // Nuevo filtro de estado
  };

  const [searchFilters, setSearchFilters] = useState(initialFilters);
  // Estado local para el input (para responder de inmediato a lo que escribe el usuario)
  const [searchInput, setSearchInput] = useState(initialFilters.searchTerm);

  // Lista fija de estados disponibles
  const statusOptions = ['ALTA', 'PROPUESTA', 'BAJA'];

  // Actualizamos los parámetros de la URL cada vez que searchFilters cambia
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('searchTerm', searchFilters.searchTerm);
    params.set('pageSize', searchFilters.pageSize);
    params.set('page', searchFilters.page);
    params.set('sortBy', searchFilters.sortBy);
    params.set('order', searchFilters.order);
    searchFilters.conditionName.forEach((value) =>
      params.append('conditionName', value),
    );
    params.set('deepSearch', JSON.stringify(searchFilters.deepSearch));
    // Solo se añade "status" si hay alguno seleccionado
    if (searchFilters.status && searchFilters.status.length > 0) {
      searchFilters.status.forEach((value) => params.append('status', value));
    }
    setSearchParams(params);
  }, [searchFilters, setSearchParams]);

  // Si se recibe "field" y "value" en la URL para customField, se actualiza deepSearch
  useEffect(() => {
    const fieldParam = searchParams.get('field');
    const valueParam = searchParams.get('value');
    if (fieldParam && fieldParam.startsWith('customField:')) {
      const customFieldName = fieldParam.split(':')[1];
      const filter = {
        searchHeader: 'customField',
        searchTerm: valueParam,
        searchCriteria: 'equals',
        customFieldName,
      };
      setSearchFilters((prevState) => ({
        ...prevState,
        deepSearch: [filter],
      }));
    }
    if (fieldParam && !fieldParam.startsWith('customField:')) {
      const filter = {
        searchHeader: fieldParam,
        searchTerm: valueParam,
        searchCriteria: 'equals',
      };
      setSearchFilters((prevState) => ({
        ...prevState,
        deepSearch: [filter],
      }));
    }
  }, [searchParams]);

  // La consulta se actualiza según los filtros actuales
  const {
    data: inventories,
    refetch,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ['inventories', { ...searchFilters }],
    queryFn: ({ signal }) => searchInventories({ ...searchFilters, signal }),
    staleTime: Infinity,
  });

  useEffect(() => {
    refetch();
    setRefreshData(false);
  }, [searchFilters, refreshData]);

  const goOnPrevPage = useCallback(() => {
    setSearchFilters((prevState) => ({
      ...prevState,
      page: prevState.page - 1,
    }));
  }, []);

  const goOnNextPage = useCallback(() => {
    setSearchFilters((prevState) => ({
      ...prevState,
      page: prevState.page + 1,
    }));
  }, []);

  const handleSelectChange = useCallback((page) => {
    setSearchFilters((prevState) => ({
      ...prevState,
      page,
    }));
  }, []);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    // Actualizamos el estado local para que el input se muestre actualizado
    setSearchInput(value);

    // Limpiamos el timeout anterior
    if (lastChange.current) {
      clearTimeout(lastChange.current);
    }
    // Establecemos el timeout para actualizar los filtros de búsqueda
    lastChange.current = setTimeout(() => {
      setSearchFilters((prevState) => ({
        ...prevState,
        searchTerm: value,
      }));
      lastChange.current = null;
    }, 600);
  }, []);

  const handleDeepSearch = (value) => {
    setSearchFilters((prevState) => ({
      ...prevState,
      deepSearch: value.map((filter) => {
        // Si es un customField, añade un campo adicional para su procesamiento
        if (filter.searchHeader === 'customField' && filter.customFieldName) {
          return {
            ...filter,
            customFieldName: filter.customFieldName,
          };
        }
        return filter;
      }),
    }));
  };

  const changePageSize = (e) => {
    setSearchFilters((prevState) => ({
      ...prevState,
      pageSize: e.target.value,
    }));
  };

  const sortBy = (column) => {
    const selectedHeaderIndex = columns?.findIndex((col) => col.id === column);
    let updatedHeaders = [];
    if (selectedHeaderIndex !== -1) {
      const selectedHeader = columns[selectedHeaderIndex];
      selectedHeader;
      const updatedHeader = {
        ...selectedHeader,
        order: selectedHeader?.order === 'asc' ? 'desc' : 'asc',
      };
      updatedHeaders = [...columns];
      updatedHeaders[selectedHeaderIndex] = updatedHeader;
      setSearchFilters((prevState) => ({
        ...prevState,
        sortBy: column,
        order: updatedHeader.order,
      }));
    }
    setColumns(updatedHeaders);
  };

  const selectAll = () => {
    const { data: items } = inventories;
    setSelectAllCheckbox((prevState) => !prevState);
    let inventoriesObj = {};
    for (let i = 0; i < items?.length; i++) {
      inventoriesObj[items[i].id] = formatInventory(items[i]);
    }
    setItemsToDownload(!selectAllCheckbox ? inventoriesObj : {});
  };

  const onCheckFilter = (value) => {
    if (value !== '') {
      if (value === 'Seleccionar todos') {
        setSearchFilters((prevState) => ({
          ...prevState,
          conditionName: inventoryConditions.map((condition) => condition.name),
        }));
      } else if (value === 'Quitar todos') {
        setSearchFilters((prevState) => ({
          ...prevState,
          conditionName: [],
        }));
      } else {
        let currentValues = [...searchFilters?.conditionName];
        if (currentValues?.includes(value)) {
          currentValues = currentValues.filter(
            (condition) => condition !== value,
          );
        } else {
          currentValues.push(value);
        }
        setSearchFilters((prevState) => ({
          ...prevState,
          conditionName: currentValues,
        }));
      }
    }
  };

  // Nueva función para filtrar por estado
  const handleStatusFilter = (value) => {
    setSearchFilters((prevState) => {
      let current = prevState.status || [];
      if (value === 'all') {
        // Si ya están todos seleccionados, quitar todos; de lo contrario, seleccionar todos
        if (current.length === statusOptions.length) {
          return { ...prevState, status: [] };
        } else {
          return { ...prevState, status: statusOptions };
        }
      } else {
        if (current.includes(value)) {
          current = current.filter((v) => v !== value);
        } else {
          current = [...current, value];
        }
        return { ...prevState, status: current };
      }
    });
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
        items[inventoryId] = formatInventory(inventory);
      } else {
        delete items[inventoryId];
      }
      setItemsToDownload(items);
    }
  };

  const downloadInventoriesCSV = () => {
    const items = Object.keys(itemsToDownload);
    if (items.length > 0) {
      let formattedString =
        'Nombre,Tipo,Marca,Número de serie,Número de activo,Fecha de recepción';
      for (let i = 0; i < items.length; i++) {
        const inventory = items[i];
        formattedString += itemsToDownload[inventory];
      }
      downloadCSV({ data: formattedString, fileName: 'inventories' });
    } else {
      Notifies('error', 'Selecciona los inventarios a descargar');
    }
  };

  const handleGetChanges = () => {
    setRefreshData(true);
    Notifies('success', 'Inventarios actualizados');
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
              label: viewMode === 'table' ? 'Imágenes' : 'Tabla',
              action: () =>
                setViewMode(viewMode === 'table' ? 'images' : 'table'),
              color: 'black',
              icon: viewMode === 'table' ? MdPhotoAlbum : FaTable,
            },
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
        />
        <TableActions
          handleSearchTerm={handleSearch}
          onCheckFilter={onCheckFilter}
          selectedFilters={searchFilters?.conditionName}
          filters={inventoryConditions}
          headers={[
            ...columns,
            {
              id: 'customField',
              value: 'Campos personalizados',
              classes: 'w-auto',
              type: 'text',
            },
          ]}
          deepSearch={searchFilters?.deepSearch}
          setDeepSearch={handleDeepSearch}
          inventoryConditions={inventoryConditions}
          onRefreshData={handleGetChanges}
          searchTerm={searchInput}
          selectedStatuses={searchFilters.status} // nuevo
          statusOptions={statusOptions} // nuevo
          onCheckStatus={handleStatusFilter} // nuevo
        />
        {/* Vista tabla e imágenes */}
        {viewMode === 'table' ? (
          <>
            {inventories && !isPending ? (
              inventories?.data?.length > 0 ? (
                <>
                  <div className="hidden md:block">
                    <Table
                      columns={columns}
                      sortBy={sortBy}
                      sortedBy={searchFilters.sortBy}
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
                                }
                              }}
                              key={inventory.id}
                              className="border-b whitespace-nowrap dark:border-gray-600 text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              {inventoryColumns?.map((column) => {
                                let content;
                                if (column.id === 'checkbox') {
                                  return (
                                    <T.Cell className="py-2" key={column.id}>
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
                                            ? 'bg-mycad-primary'
                                            : inventory.status === 'BAJA'
                                              ? 'bg-mycad-danger'
                                              : 'bg-mycad-warning'
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
                                      <span className="w-fit p-2 px-4 flex justify-center items-center gap-2 bg-sky-50 rounded-md">
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
                                              dismissOnClick={false}
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
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 md:hidden">
                    {inventories?.data?.map((inventory) => {
                      const data = {
                        image: {
                          key: 'Imagen',
                          value: inventory?.images[0] ?? [],
                        },
                        title: {
                          key: 'Inventario',
                          value: inventory?.model?.name,
                        },
                        subtitle: {
                          key: 'Marca y Tipo',
                          value: `${inventory?.model?.brand?.name} ${inventory?.model?.type?.name}`,
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
                                    dismissOnClick={false}
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
