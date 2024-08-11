import React, { useCallback, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useVehicleContext } from '../../context/VehicleContext';
const Table = React.lazy(() => import('../../components/Table/Table'));
const ModalRemove = React.lazy(
  () => import('../../components/Modals/ModalRemove'),
);
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
import { FaEdit, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Table as T } from 'flowbite-react';
import { useQuery } from '@tanstack/react-query';
import { searchVehicles } from '../../services/api';

const vehicleColumns = [
  {
    id: 'name',
    value: 'Nombre',
    classes: 'w-auto',
  },
  {
    id: 'type',
    value: 'Tipo',
    classes: 'w-auto',
  },
  {
    id: 'brand',
    value: 'Marca',
    classes: 'w-auto',
  },
  {
    id: 'year',
    value: 'Año',
    classes: 'w-auto',
  },
  {
    id: 'status',
    value: 'Estatus',
    classes: 'w-auto',
  },
  {
    id: 'actions',
    value: '',
    classes: ' w-1',
  },
];

const Vehicles = () => {
  const { deleteVehicle } = useVehicleContext();

  const navigate = useNavigate();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const lastChange = useRef();
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    pageSize: 5,
    page: currentPageNumber,
  });
  console.log('searchFilters ', searchFilters);
  // const { refetch, isLoading, isFetching } = searchVehicles({searchTerm: searchTerm, pageSize: TOTAL_VALUES_PER_PAGE, page: currentPageNumber})
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

  const handleDeleteVehicle = () => {
    if (vehicleId) {
      deleteVehicle(vehicleId);
      navigate('/vehicles');
      setIsOpenModal(false);
    }
  };
  // const { pagination } = data
  console.log('vehicles data ', vehicles?.data);
  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
        <TableHeader
          title="Vehículos"
          labelButton="Nuevo vehículo"
          redirect="/vehicles/create"
        />
        <TableActions
          handleSearchTerm={handleSearch}
          value={searchFilters?.searchTerm}
        />
        {vehicles && !isPending ? (
          <Table columns={vehicleColumns}>
            {vehicles?.data?.map((vehicle) => {
              const { name, type, brand, year } = vehicle.model;
              return (
                <T.Row
                  key={vehicle.id}
                  className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <T.Cell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {name}
                  </T.Cell>
                  <T.Cell>
                    {/* <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300"> */}
                    {type?.name}
                    {/* </span> */}
                  </T.Cell>
                  <T.Cell>{brand?.name}</T.Cell>
                  <T.Cell>{year}</T.Cell>
                  <T.Cell>
                    <div
                      className={`flex items-center rounded text-center text-white justify-center w-2/3 ${vehicle?.status ? 'bg-green-500' : 'bg-red-600'}`}
                    >
                      {vehicle?.status ? 'Activo' : 'Inactivo'}
                    </div>
                  </T.Cell>
                  <T.Cell className="p-4">
                    <div className="w-full flex justify-center md:justify-end items-center gap-2 border border-gray-200 rounded-md p-2 md:border-none md:p-0">
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
                </T.Row>
              );
            })}
          </Table>
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
      <ModalRemove
        isOpenModal={isOpenModal}
        onCloseModal={() => setIsOpenModal(false)}
        removeFunction={handleDeleteVehicle}
      />
    </div>
  );
};

export default Vehicles;
