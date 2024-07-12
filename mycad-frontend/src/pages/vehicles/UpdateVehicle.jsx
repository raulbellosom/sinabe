import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VehicleForm from '../../components/VehicleForm/VehicleForm';
import { useVehicleContext } from '../../context/VehicleContext';
import Skeleton from 'react-loading-skeleton';
import { FaCar } from 'react-icons/fa';
import DateLocalParced from '../../utils/DateLocalParced';

const UpdateVehicle = () => {
  const { id } = useParams();
  const {
    updateVehicle,
    vehicle,
    vehicleTypes,
    vehicleBrands,
    vehicleModels,
    fetchVehicle,
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

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex items-center mb-2 text-white bg-orange-500 w-full p-2 rounded-md">
        <FaCar size={24} className="mr-4" />
        <h1 className="text-2xl font-bold">Actualizar Vehículo</h1>
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
        />
      )}
    </div>
  );
};

export default UpdateVehicle;
