import React, { useCallback, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useVehicleContext } from '../../context/VehicleContext';
import ModalRemove from '../../components/Modals/ModalRemove';
import ModalViewer from '../../components/Modals/ModalViewer';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { FaEdit, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Table as T } from 'flowbite-react';
import { useQuery } from '@tanstack/react-query';
import { searchVehicles } from '../../services/api';
import Card from '../../components/Card/Card';
import { parseToCurrency, parseToLocalDate } from '../../utils/formatValues';
import { MdCloudUpload } from 'react-icons/md';
import { RiAddBoxFill } from 'react-icons/ri';
import CreateMultipleVehicle from './CreateMultipleVehicle';
const Table = React.lazy(() => import('../../components/Table/Table'));
const ActionButtons = React.lazy(
  () => import('../../components/ActionButtons/ActionButtons'),
);
const TableHeader = React.lazy(
  () => import('../../components/Table/TableHeader'),
);
const TableActions = React.lazy(
  () => import('../../components/Table/TableActions'),
);
const TableFooter = React.lazy(
  () => import('../../components/Table/TableFooter'),
);
const LinkButton = React.lazy(
  () => import('../../components/ActionButtons/LinkButton'),
);

const vehicleColumns = [
  {
    id: 'checkbox',
    value: '',
    classes: 'w-20',
  },
  {
    id: 'images',
    value: 'Imagen',
    classes: 'w-20',
  },
  {
    id: 'model.name',
    value: 'Nombre',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'model.type.name',
    value: 'Tipo',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'model.brand.name',
    value: 'Marca',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'model.year',
    value: 'Año',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'economicNumber',
    value: 'Número económico',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'serialNumber',
    value: 'Número de serie',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'plateNumber',
    value: 'Número de placa',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'acquisitionDate',
    value: 'Fecha de adquisición',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'cost',
    value: 'Costo de adquisición',
    classes: 'w-auto',
    order: 'asc',
  },
  {
    id: 'status',
    value: 'Estatus',
    classes: 'w-fit',
    order: 'asc',
  },
  {
    id: 'actions',
    value: 'Acciones',
    classes: 'text-center w-1',
  },
];
const formatVehicle = (vehicleData) => {
  const {model, acquisitionDate, plateNumber, serialNumber, economicNumber, cost } = vehicleData
  const vehicle = `\n${model.name},${model.type.name},${model.brand.name},${model.year},${economicNumber},${serialNumber},${plateNumber},${acquisitionDate},${cost}`
  /* let vehicle = {
    name: model.name,
    type: model.type.name,
    brand: model.brand.name,
    year: model.year,
    economicNumber,
    serialNumber,
    plateNumber,
    acquisitionDate,
    cost
  } */
  return vehicle
}
const Vehicles = () => {
  const { deleteVehicle } = useVehicleContext();
  const [columns, setColumns] = useState([...vehicleColumns]);
  const [selectAllCheckbox, setSelectAllCheckbox] = useState(false)
  const [itemsToDownload, setItemsToDownload] = useState({})
  const navigate = useNavigate();
  const lastChange = useRef();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalUpload, setIsOpenModalUpload] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    pageSize: 5,
    page: currentPageNumber,
    sortBy: 'createdAt',
    order: 'asc',
    conditionName: [],
  });

  const {
    data: vehicles,
    refetch,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ['vehicles', { ...searchFilters }],
    queryFn: ({ signal }) => searchVehicles({ ...searchFilters, signal }),
    staleTime: Infinity,
  });

  useEffect(() => {
    refetch();
  }, [searchFilters]);

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
    const { data: items } = vehicles
    setSelectAllCheckbox(prevState => !prevState)
    let vehiclesObj = {}
    for (let i = 0; i< items?.length; i++) {
      vehiclesObj[items[i].id] = formatVehicle(items[i])
    }
    setItemsToDownload(!selectAllCheckbox ? vehiclesObj : {})
  }
  const onCheckFilter = (value) => {
    if (value !== '') {
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
  };
  const handleDeleteVehicle = () => {
    if (vehicleId) {
      deleteVehicle(vehicleId);
      navigate('/vehicles');
      setIsOpenModal(false);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value[key], obj);
  };
  const vehiclesToDownload = (vehicleId, vehicle) => {
    if (vehicleId) {
      let items = {...itemsToDownload}
      if (!items[vehicleId]) {
        items[vehicleId] = formatVehicle(vehicle)
      } else {
        delete items[vehicleId]
      }
      setItemsToDownload(items)
    }
  }
  const downloadVehiclesCSV = () => {
    const items = Object.keys(itemsToDownload);
    if (items && items?.length > 0) {
      let formattedString = "Nombre,Tipo,Marca,Año,Número económico,Número de serie,Número de placa,Fecha de adquisición,Costo"
      for(let i=0; i< items.length; i++){
        const vehicle = items[i];
        formattedString+= itemsToDownload[vehicle]
      }
      downloadCSV({data: formattedString, fileName: "vehicles"})
    } else {
      Notifies('error', 'Selecciona los vehículos a descargar');
    }

  }
  return (
    <>
      <section className="flex flex-col gap-3 bg-white rounded-md dark:bg-gray-900 p-3 antialiased">
        <TableHeader title="Vehículos" />
        <TableActions
          handleSearchTerm={handleSearch}
          onCheckFilter={onCheckFilter}
          filters={searchFilters?.conditionName}
          value={searchFilters?.searchTerm}
          actions={[
            {
              label: 'Cargar',
              action: () => setIsOpenModalUpload(true),
              color: 'indigo',
              icon: MdCloudUpload,
            },
            {
              label: 'CSV',
              action: downloadVehiclesCSV,
              color: 'indigo',
              icon: FaFileCsv,
            },
            {
              label: 'Nuevo',
              href: '/vehicles/create',
              color: 'green',
              icon: RiAddBoxFill,
            },
          ]}
        />
        {vehicles && !isPending ? (
          <>
            <div className="hidden md:block">
              <Table columns={columns} sortBy={sortBy} selectAll={selectAll}>
                {vehicles &&
                  !isPending &&
                  vehicles?.data?.map((vehicle) => {
                    if (selectAllCheckbox) {
                      vehicle = {
                        ...vehicle,
                        checked: true
                      }
                    }
                    return (
                      <T.Row
                        onDoubleClick={() =>
                          navigate(`/vehicles/view/${vehicle.id}`)
                        }
                        onClick={(event) => {
                          if (event.ctrlKey) {
                            window.open(
                              `/vehicles/view/${vehicle.id}`,
                              '_blank',
                            );
                          }
                        }}
                        key={vehicle.id}
                        className="border-b dark:border-gray-600 text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {vehicleColumns?.map((column) => {
                          let content;
                          if (column.id === 'checkbox') {
                            return (
                              <T.Cell key={column.id}>
                                <Checkbox onChange={() => vehiclesToDownload(vehicle?.id, vehicle)} checked={itemsToDownload[vehicle?.id] ? true : false} />
                              </T.Cell>
                            )
                          } else if (column.id === 'cost') {
                            content = parseToCurrency(
                              getNestedValue(vehicle, column.id),
                            );
                          } else if (column.id === 'acquisitionDate') {
                            content = parseToLocalDate(
                              getNestedValue(vehicle, column.id),
                            );
                          } else {
                            content = getNestedValue(vehicle, column.id);
                          }

                          if (
                            column.id === 'images' &&
                            vehicle?.images?.length > 0
                          ) {
                            return (
                              <T.Cell key={column.id} className="w-20">
                                <ImageViewer
                                  images={[vehicle?.images[0]]}
                                  imageClassName={
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
                                className="font-semibold whitespace-nowrap dark:text-white"
                              >
                                {getNestedValue(vehicle, column.id)}
                              </T.Cell>
                            );
                          }
                          if (column.id === 'status') {
                            return (
                              <T.Cell key={column.id}>
                                <span
                                  className={`px-4 py-1 rounded-full text-xs font-medium ${
                                    vehicle.status
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {vehicle.status ? 'Activo' : 'Inactivo'}
                                </span>
                              </T.Cell>
                            );
                          }
                          if (column.id === 'actions') {
                            return (
                              <T.Cell key={column.id}>
                                <div className="flex justify-center items-center gap-2">
                                  <LinkButton
                                    route={`/vehicles/edit/${vehicle.id}`}
                                    label="Editar"
                                    icon={FaEdit}
                                    color="yellow"
                                  />
                                  <LinkButton
                                    route={`/vehicles/view/${vehicle.id}`}
                                    label="Ver"
                                    icon={FaEye}
                                    color="cyan"
                                  />
                                  <ActionButtons
                                    onRemove={() => {
                                      setIsOpenModal(true);
                                      setVehicleId(vehicle.id);
                                    }}
                                  />
                                </div>
                              </T.Cell>
                            );
                          }
                          return (
                            <T.Cell className="text-nowrap" key={column.id}>
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
              {vehicles?.data?.map((vehicle) => {
                const data = {
                  image: { key: 'Imagen', value: vehicle?.images[0] ?? [] },
                  title: {
                    key: 'Vehiculo',
                    value: `${vehicle.model.name} ${vehicle.model.year} (${vehicle.model.brand.name} ${vehicle.model.type.name})`,
                  },
                  subtitle: { key: 'Año', value: vehicle.economicNumber },
                  tags: {
                    key: 'Condiciones',
                    value: vehicle.conditions.map(
                      (condition) => condition.condition.name,
                    ),
                  },
                  serialNumber: {
                    key: 'Número de serie',
                    value: vehicle.serialNumber,
                  },
                  plateNumber: {
                    key: 'Número de placa',
                    value: vehicle.plateNumber,
                  },
                  cost: {
                    key: 'Costo de Adquisición',
                    value: vehicle?.cost ? parseToCurrency(vehicle.cost) : '',
                  },
                  acquisitionDate: {
                    key: 'F. de adquisición',
                    value: vehicle?.acquisitionDate
                      ? parseToLocalDate(vehicle.acquisitionDate)
                      : '',
                  },
                  status: {
                    key: 'Estatus',
                    value: vehicle.status ? 'Activo' : 'Inactivo',
                  },
                  actions: {
                    key: 'Acciones',
                    value: (
                      <div className="flex justify-center items-center gap-2">
                        <LinkButton
                          route={`/vehicles/edit/${vehicle.id}`}
                          label="Editar"
                          icon={FaEdit}
                          color="yellow"
                        />
                        <LinkButton
                          route={`/vehicles/view/${vehicle.id}`}
                          label="Ver"
                          icon={FaEye}
                          color="cyan"
                        />
                        <ActionButtons
                          onRemove={() => {
                            setIsOpenModal(true);
                            setVehicleId(vehicle.id);
                          }}
                        />
                      </div>
                    ),
                  },
                };
                return <Card key={vehicle.id} data={data} showImage />;
              })}
            </div>
          </>
        ) : (
          <Skeleton className="w-full h-10" count={10} />
        )}
        {vehicles?.pagination && (
          <TableFooter
            pagination={vehicles?.pagination}
            goOnNextPage={goOnNextPage}
            goOnPrevPage={goOnPrevPage}
            handleSelectChange={handleSelectChange}
          />
        )}
      </section>
      <ModalViewer
        isOpenModal={isOpenModalUpload}
        onCloseModal={() => setIsOpenModalUpload(false)}
        title="Cargar vehículos"
        dismissible
      >
        <CreateMultipleVehicle />
      </ModalViewer>
      <ModalRemove
        isOpenModal={isOpenModal}
        onCloseModal={() => setIsOpenModal(false)}
        removeFunction={handleDeleteVehicle}
      />
    </>
  );
};

export default Vehicles;
