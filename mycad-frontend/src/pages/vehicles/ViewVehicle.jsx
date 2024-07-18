import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicleContext } from '../../context/VehicleContext';
import { useAuthContext } from '../../context/AuthContext';
import VehicleProperty from '../../components/VehicleComponents/VehicleView/VehicleProperty';
import { FaCar } from 'react-icons/fa';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
  MdOutlineTextsms,
} from 'react-icons/md';
import { BiCategory, BiDollar } from 'react-icons/bi';
import { IoMdSpeedometer } from 'react-icons/io';
import { MdGarage } from 'react-icons/md';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ModalRemove from '../../components/Modals/ModalRemove';
import { Badge } from 'flowbite-react';

const ViewVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchVehicle, vehicle, loading, deleteVehicle } = useVehicleContext();
  const { user } = useAuthContext();
  const [vehicleData, setVehicleData] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    fetchVehicle(id);
  }, [id, fetchVehicle]);

  useEffect(() => {
    const data = {
      model: {
        name: vehicle?.model?.name,
        icon: MdOutlineDirectionsCar,
        label: 'Modelo',
      },
      brand: {
        name: vehicle?.model?.brand?.name,
        icon: PiTrademarkRegisteredBold,
        label: 'Marca',
      },
      type: {
        name: vehicle?.model?.type?.name,
        icon: BiCategory,
        label: 'Tipo de Vehículo',
      },
      year: {
        name: vehicle?.model?.year,
        icon: MdGarage,
        label: 'Año del Modelo',
      },
      acquisitionDate: {
        name: vehicle.acquisitionDate,
        icon: MdCalendarToday,
        label: 'Fecha de Adquisición',
      },
      cost: {
        name: vehicle.cost,
        icon: BiDollar,
        label: 'Costo de Adquisición',
      },
      mileage: {
        name: vehicle.mileage,
        icon: IoMdSpeedometer,
        label: 'Kilometraje',
      },
      status: {
        name: vehicle.status,
        icon: MdInfo,
        label: 'Estado',
      },
      comments: {
        name: vehicle.comments,
        icon: MdOutlineTextsms,
        label: 'Comentarios',
      },
    };
    setVehicleData(data);
  }, [vehicle]);

  const onEdit = (e) => {
    if (e.ctrlKey) {
      window.open(`/vehicles/edit/${id}`, '_blank');
    } else {
      navigate(`/vehicles/edit/${id}`);
    }
  };

  const handleDeleteVehicle = () => {
    deleteVehicle(id);
    navigate('/vehicles');
  };

  const onRemove = () => {
    setIsOpenModal(true);
  };

  const onCreate = () => {
    navigate('/vehicles/create');
  };
  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-4 pb-1">
        <div className="w-full rounded-md flex items-center text-orange-500">
          <FaCar size={24} className="mr-4" />
          <h1 className="text-2xl font-bold">Detalles del Vehículo</h1>
        </div>
        <ActionButtons
          userRole={user?.roleId}
          onEdit={onEdit}
          onCreate={onCreate}
          onRemove={onRemove}
        />
      </div>
      <div className="flex gap-2 items-center justify-start pb-4">
        {vehicle?.conditions &&
          vehicle?.conditions?.length > 0 &&
          vehicle?.conditions?.map((condition, index) => (
            <Badge size={'sm'} key={index} color="indigo">
              {condition.condition.name}
            </Badge>
          ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading || !vehicleData || Object?.keys(vehicle)?.length == 0 ? (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <VehicleProperty.Skeleton key={index} />
            ))}
          </>
        ) : (
          Object?.keys(vehicleData) &&
          Object?.keys(vehicleData)?.map((key) => {
            const { name, icon, label } = vehicleData[key];
            return (
              <VehicleProperty
                key={key}
                label={label}
                value={name}
                icon={icon}
              />
            );
          })
        )}
      </div>
      <ModalRemove
        isOpenModal={isOpenModal}
        removeFunction={handleDeleteVehicle}
      />
    </div>
  );
};

export default ViewVehicle;
