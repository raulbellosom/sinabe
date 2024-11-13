import React, { useCallback, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useInventoryContext } from '../../context/InventoryContext';
import ModalRemove from '../../components/Modals/ModalRemove';
import ModalViewer from '../../components/Modals/ModalViewer';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { useNavigate } from 'react-router-dom';
import { LuFileSpreadsheet } from 'react-icons/lu';
import { FaClipboardList, FaEdit, FaEye } from 'react-icons/fa';
import { Checkbox, Table as T } from 'flowbite-react';
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
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [refreshData, setRefreshData] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    pageSize: 5,
    page: currentPageNumber,
    sortBy: 'createdAt',
    order: 'asc',
    conditionName: [],
    deepSearch: [],
  });

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
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        page: prevState?.page - 1,
      };
    });
  }, []);

  const goOnNextPage = useCallback(() => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        page: prevState?.page + 1,
      };
    });
  }, []);

  const handleSelectChange = useCallback((page) => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        page,
      };
    });
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (lastChange.current) {
        clearTimeout(lastChange.current);
      }
      lastChange.current = setTimeout(() => {
        lastChange.current = null;
        setSearchFilters((prevState) => {
          return {
            ...prevState,
            searchTerm: e.target.value,
          };
        });
      }, 600);
    },
    [searchFilters?.searchTerm],
  );

  const handleDeepSearch = (value) => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        deepSearch: value,
      };
    });
  };

  const changePageSize = (e) => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        pageSize: e.target.value,
      };
    });
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
      setSearchFilters((prevState) => {
        return {
          ...prevState,
          sortBy: column,
          order: updatedHeader?.order,
        };
      });
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
        setSearchFilters((prevState) => {
          return {
            ...prevState,
            conditionName: inventoryConditions.map(
              (condition) => condition.name,
            ),
          };
        });
      } else if (value === 'Quitar todos') {
        setSearchFilters((prevState) => {
          return {
            ...prevState,
            conditionName: [],
          };
        });
      } else {
        let currentValues = [...searchFilters?.conditionName];
        if (currentValues?.includes(value)) {
          currentValues = currentValues.filter(
            (condition) => condition !== value,
          );
        } else {
          currentValues.push(value);
        }
        setSearchFilters((prevState) => {
          return {
            ...prevState,
            conditionName: currentValues,
          };
        });
      }
    }
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
    if (items && items?.length > 0) {
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

  const isCreatePermission = useCheckPermissions('create_inventories');

  return (
    <>
      <section className="flex flex-col gap-3 bg-white shadow-md rounded-md dark:bg-gray-900 p-4 antialiased">
        <TableHeader
          icon={FaClipboardList}
          title="Inventario"
          actions={[
            {
              label: 'Descargar',
              action: downloadInventoriesCSV,
              color: 'green',
              icon: LuFileSpreadsheet,
              disabled: Object.keys(itemsToDownload).length === 0,
            },
            {
              label: 'Cargar',
              action: isCreatePermission.hasPermission
                ? () => setIsOpenModalUpload(true)
                : null,
              color: 'blue',
              icon: MdOutlineFileUpload,
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
          headers={columns}
          deepSearch={searchFilters?.deepSearch}
          setDeepSearch={handleDeepSearch}
          inventoryConditions={inventoryConditions}
          onRefreshData={handleGetChanges}
        />
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
                            navigate(`/inventories/view/${inventory.id}`)
                          }
                          onClick={(event) => {
                            if (event.ctrlKey) {
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
                                        inventory?.id,
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
                            } else if (column.id === 'receptionDate') {
                              content = parseToLocalDate(
                                getNestedValue(inventory, column.id),
                              );
                            } else {
                              content = getNestedValue(inventory, column.id);
                            }

                            if (
                              column.id === 'images' &&
                              inventory?.images?.length > 0
                            ) {
                              return (
                                <T.Cell key={column.id} className="w-20 py-2">
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
                            if (column.id === 'actions') {
                              return (
                                <T.Cell className="py-2" key={column.id}>
                                  <div className="flex justify-center items-center gap-2">
                                    <LinkButton
                                      route={`/inventories/edit/${inventory.id}`}
                                      label="Editar"
                                      icon={FaEdit}
                                      color="yellow"
                                    />
                                    <LinkButton
                                      route={`/inventories/view/${inventory.id}`}
                                      label="Ver"
                                      icon={FaEye}
                                      color="cyan"
                                    />
                                    <ActionButtons
                                      onRemove={() => {
                                        setIsOpenModal(true);
                                        setInventoryId(inventory.id);
                                      }}
                                    />
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
                    image: { key: 'Imagen', value: inventory?.images[0] ?? [] },
                    title: {
                      key: 'Inventario',
                      value: inventory?.model?.name,
                    },
                    subtitle: {
                      key: 'Marca y Tipo',
                      value: `${inventory?.model?.brand?.name} ${inventory?.model?.type?.name}`,
                    },
                    tags: {
                      key: 'Condiciones',
                      value: inventory?.conditions?.map(
                        (condition) => condition?.condition?.name,
                      ),
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
                    status: {
                      key: 'Estatus',
                      value:
                        inventory?.status === 'PROPUESTA'
                          ? 'PROPUESTA DE BAJA'
                          : inventory.status,
                    },
                    actions: {
                      key: 'Acciones',
                      value: (
                        <ActionButtons
                          extraActions={[
                            {
                              label: 'Ver',
                              icon: FaEye,
                              color: 'cyan',
                              action: () =>
                                navigate(`/inventories/view/${inventory.id}`),
                            },
                            {
                              label: 'Editar',
                              icon: FaEdit,
                              color: 'yellow',
                              action: () =>
                                navigate(`/inventories/edit/${inventory.id}`),
                            },
                          ]}
                          onRemove={() => {
                            setIsOpenModal(true);
                            setInventoryId(inventory.id);
                          }}
                        />
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

const ProtectedInventoriesView = withPermission(
  Inventories,
  'view_inventories',
);

export default ProtectedInventoriesView;
