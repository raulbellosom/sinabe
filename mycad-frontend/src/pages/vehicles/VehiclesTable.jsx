import React, { useState } from "react";
import Table from "../../components/Table/Table";
import { Table as T} from 'flowbite-react';
import ActionButtons from "../../components/ActionButtons/ActionButtons";
import LinkButton from "../../components/ActionButtons/LinkButton";
import Skeleton from 'react-loading-skeleton';
import { FaEdit, FaEye } from "react-icons/fa";
import ModalRemove from "../../components/Modals/ModalRemove";
import { useVehicleContext } from "../../context/VehicleContext";
import { useNavigate } from "react-router-dom";


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
const VehiclesTable = React.memo(({vehicles}) => {
    const navigate = useNavigate()
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [vehicleId, setVehicleId] = useState(null);
    const { deleteVehicle } = useVehicleContext();
    const handleDeleteVehicle = () => {
        if (vehicleId) {
          deleteVehicle(vehicleId);
          navigate('/vehicles');
        }
      };
    return (
        <div>
        {vehicles ? (
          <Table columns={vehicleColumns}>
            {vehicles?.map((vehicle) => {
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
        <ModalRemove
            isOpenModal={isOpenModal}
            onCloseModal={() => setIsOpenModal(false)}
            removeFunction={handleDeleteVehicle}
        />
        </div>
    );
})
 
export default VehiclesTable;