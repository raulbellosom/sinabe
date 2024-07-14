import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicleContext } from '../../context/VehicleContext';
import { useAuthContext } from '../../context/AuthContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import VehicleProperty from '../../components/VehicleComponents/VehicleView/VehicleProperty';
import { FaCar } from 'react-icons/fa';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
} from 'react-icons/md';
import { BiCategory, BiDollar } from 'react-icons/bi';
import { IoMdSpeedometer } from 'react-icons/io';
import { MdGarage } from 'react-icons/md';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ModalRemove from '../../components/Modals/ModalRemove';

const ViewVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchVehicle, vehicle, loading, deleteVehicle } = useVehicleContext();
  const { user } = useAuthContext();
  const { setBreadcrumb } = useBreadcrumb();
  const [vehicleData, setVehicleData] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    setBreadcrumb([
      {
        label: 'Vehículos',
        href: '/vehicles',
        icon: FaCar,
      },
      {
        label: 'Detalles del Vehículo',
      },
    ]);
  }, [setBreadcrumb]);

  useEffect(() => {
    fetchVehicle(id);
  }, [id, fetchVehicle]);

  useEffect(() => {
    const data = {
      type: {
        name: vehicle?.model?.type?.name,
        icon: BiCategory,
        label: 'Tipo de Vehículo',
      },
      brand: {
        name: vehicle?.model?.brand?.name,
        icon: PiTrademarkRegisteredBold,
        label: 'Marca',
      },
      model: {
        name: vehicle?.model?.name,
        icon: MdOutlineDirectionsCar,
        label: 'Modelo',
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
    };
    setVehicleData(data);
  }, [vehicle]);

  const onEdit = (e) => {
    if (e.ctrlKey) {
      window.open(`/vehicles/update/${id}`, '_blank');
    } else {
      navigate(`/vehicles/update/${id}`);
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
      <div className="flex flex-col md:flex-row items-center gap-4 w-full py-2 border-b border-gray-300">
        <div className="w-full h-full rounded-md flex items-center text-orange-500">
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
      <p className="text-gray-800 py-2 pt-4">
        Aquí puedes ver los detalles del vehículo.
      </p>
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
