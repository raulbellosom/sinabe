import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VehicleForm from '../../components/VehicleComponents/VehicleForm/VehicleForm';
import { useVehicleContext } from '../../context/VehicleContext';
import Skeleton from 'react-loading-skeleton';
import { FaCar } from 'react-icons/fa';
import DateLocalParced from '../../utils/DateLocalParced';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ModalRemove from '../../components/Modals/ModalRemove';
import { useAuthContext } from '../../context/AuthContext';

const UpdateVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    updateVehicle,
    vehicle,
    vehicleTypes,
    vehicleBrands,
    vehicleModels,
    fetchVehicle,
    deleteVehicle,
    loading,
  } = useVehicleContext();
  const [initialValues, setInitialValues] = useState({
    typeId: '',
    brandId: '',
    modelId: '',
    acquisitionDate: '',
    year: '',
    cost: '',
    mileage: '',
    status: '',
  });
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    fetchVehicle(id);
  }, [id]);

  useEffect(() => {
    if (Object.keys(vehicle).length !== 0) {
      const acquisitionDate = DateLocalParced(vehicle.acquisitionDate);
      const newVehicle = {
        ...vehicle,
        acquisitionDate: acquisitionDate,
        typeId: vehicle.model.type.id,
        brandId: vehicle.model.brand.id,
        modelId: vehicle.model.id,
        year: vehicle.model.year,
      };

      setInitialValues(newVehicle);
    }
  }, [vehicle]);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    try {
      updateVehicle(values);
      resetForm();
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const onRemove = () => {
    setIsOpenModal(true);
  };

  const onCreate = () => {
    navigate('/vehicles/create');
  };

  const handleDeleteVehicle = () => {
    deleteVehicle(id);
    navigate('/vehicles');
  };

  const onShow = () => {
    navigate(`/vehicles/view/${id}`);
  };

  return (
    <>
      <div className="h-full bg-white p-4 rounded-md">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full pb-2 border-b border-gray-300">
          <div className="w-full h-full rounded-md flex items-center text-orange-500">
            <FaCar size={24} className="mr-4" />
            <h1 className="text-2xl font-bold">Actualizar Vehículo</h1>
          </div>
          <ActionButtons
            userRole={user?.roleId}
            onShow={onShow}
            onCreate={onCreate}
            onRemove={onRemove}
          />
        </div>
        <p className="mb-4 text-gray-800">
          Llena el formulario para crear un nuevo vehículo. Los campos marcados
          con * son obligatorios.
        </p>
        {loading ||
        (Object.keys(vehicle).length == 0 && vehicle.constructor === Object) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 gap-y-6">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
        ) : (
          <VehicleForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            vehicleTypes={vehicleTypes}
            vehicleModels={vehicleModels}
            vehicleBrands={vehicleBrands}
            isUpdate={true}
          />
        )}
      </div>
      <ModalRemove
        isOpenModal={isOpenModal}
        removeFunction={handleDeleteVehicle}
      />
    </>
  );
};

export default UpdateVehicle;
