import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVehicleContext } from '../../context/VehicleContext';
import { FaCar } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
} from 'react-icons/md';
import { BiCategory, BiDollar } from 'react-icons/bi';
import { IoMdSpeedometer } from 'react-icons/io';
import { MdGarage } from 'react-icons/md';

const ViewVehicle = () => {
  const { fetchVehicle, vehicle } = useVehicleContext();
  const { id } = useParams();

  useEffect(() => {
    fetchVehicle(id);
  }, [id, fetchVehicle]);

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex items-center mb-2 text-white bg-orange-500 w-full p-2 rounded-md">
        <FaCar size={24} className="mr-4" />
        <h1 className="text-2xl font-semibold">Detalles del Vehículo</h1>
      </div>
      <p className="mb-4 text-gray-800">
        Aquí puedes ver los detalles del vehículo.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold">Tipo de Vehículo</h2>
          <p className="flex items-center gap-2 justify-start">
            <BiCategory size={20} className="mr-2 inline" />
            {vehicle?.model?.type?.name || (
              <Skeleton className="h-6 rounded-md" />
            )}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Marca</h2>
          <p className="flex items-center gap-2 justify-start">
            <PiTrademarkRegisteredBold size={20} className="mr-2 inline" />
            {vehicle?.model?.brand?.name || (
              <Skeleton className="h-6 rounded-md" />
            )}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Modelo</h2>
          <p className="flex items-center gap-2 justify-start">
            <MdOutlineDirectionsCar size={20} className="mr-2 inline" />
            {vehicle?.model?.name || <Skeleton className="h-6 rounded-md" />}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Año del Modelo</h2>
          <p className="flex items-center gap-2 justify-start">
            <MdGarage size={20} className="mr-2 inline" />
            {vehicle?.model?.year || <Skeleton className="h-6 rounded-md" />}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Fecha de Adquisición</h2>
          <p className="flex items-center gap-2 justify-start">
            <MdCalendarToday size={20} className="mr-2 inline" />
            {vehicle.acquisitionDate || <Skeleton className="h-6 rounded-md" />}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Costo de Adquisición</h2>
          <p className="flex items-center gap-2 justify-start">
            <BiDollar size={20} className="mr-2 inline" />
            {vehicle.cost || <Skeleton className="h-6 rounded-md" />}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Kilometraje</h2>
          <p className="flex items-center gap-2 justify-start">
            <IoMdSpeedometer size={20} className="mr-2 inline" />
            {vehicle.mileage?.toString() || (
              <Skeleton className="h-6 rounded-md" />
            )}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Estado</h2>
          <p className="flex items-center text-indigo-600">
            <MdInfo size={20} className="mr-2 inline" />
            {vehicle.status || <Skeleton className="h-6 rounded-md" />}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewVehicle;
