import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import {
  useVehicleContext,
} from '../../context/VehicleContext';
import Table from '../../components/Table/Table';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import TableHeader from '../../components/Table/TableHeader';
import TableActions from '../../components/Table/TableActions';
import TableFooter from '../../components/Table/TableFooter';
import LinkButton from '../../components/ActionButtons/LinkButton';
import { FaEdit, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ModalRemove from '../../components/Modals/ModalRemove';

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
  const { vehicles, loading, deleteVehicle } = useVehicleContext();
  const navigate = useNavigate()
  console.log("vehicles ", vehicles)
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [vehiclesToDisplay, setVehiclesToDisplay] = useState(vehicles);
  const TOTAL_VALUES_PER_PAGE = 5;
  const index =
    TOTAL_VALUES_PER_PAGE * currentPageNumber - TOTAL_VALUES_PER_PAGE + 1;
  const filteredVehicles = vehicles?.filter((vehicle) =>
    JSON.stringify(vehicle).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const goOnPrevPage = () => {
    if (currentPageNumber === 1) return;
    setCurrentPageNumber((prev) => prev - 1);
  };
  const goOnNextPage = () => {
    if (currentPageNumber === filteredVehicles.length / TOTAL_VALUES_PER_PAGE)
      return;
    setCurrentPageNumber((prev) => prev + 1);
  };
  const handleSelectChange = (page) => {
    setCurrentPageNumber(page);
  };
  useEffect(() => {
    const start = (currentPageNumber - 1) * TOTAL_VALUES_PER_PAGE;
    const end = currentPageNumber * TOTAL_VALUES_PER_PAGE;
    setVehiclesToDisplay(filteredVehicles.slice(start, end));
  }, [currentPageNumber, vehicles, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };
  const handleClose = () => {
    setIsOpenModal(false)
  }
  const handleDeleteVehicle = () => {
    if (vehicleId) {
      deleteVehicle(vehicleId);
      navigate('/vehicles');
    }
  };

  if (vehiclesToDisplay?.length === 0) return <div>Loading...</div>;
  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
        <TableHeader
          title="Vehículos"
          labelButton="Nuevo vehículo"
          redirect="/vehicles/create"
        />
        <TableActions handleSearchTerm={handleSearch} />
        {vehiclesToDisplay && !loading ? (
          <Table columns={vehicleColumns}>
            {vehiclesToDisplay?.map((vehicle) => {
              const { id, name, type, brand, year } = vehicle.model;
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
                      className={`flex items-center rounded text-center text-white justify-center w-1/2 ${vehicle?.status ? 'bg-green-500' : 'bg-red-600'}`}
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
                          setIsOpenModal(true)
                          setVehicleId(vehicle.id)
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

        <TableFooter
          index={index}
          currentPage={currentPageNumber}
          totalItems={vehicles?.length}
          valuesPerPage={TOTAL_VALUES_PER_PAGE}
          goOnNextPage={goOnNextPage}
          goOnPrevPage={goOnPrevPage}
          handleSelectChange={handleSelectChange}
        />
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
