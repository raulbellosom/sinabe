import React, { useState } from 'react';
import VehicleForm from '../../components/VehicleComponents/VehicleForm/VehicleForm';
import { useVehicleContext } from '../../context/VehicleContext';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CreateVehicle = () => {
  const { createVehicle, vehicleTypes, vehicleBrands, vehicleModels } =
    useVehicleContext();
  const navigate = useNavigate();

  const initialValues = {
    typeId: '',
    brandId: '',
    modelId: '',
    acquisitionDate: '',
    year: '',
    cost: '',
    mileage: '',
    status: '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const vehicle = await createVehicle(values);
      setSubmitting(false);
      resetForm();
      navigate(`/vehicles/view/${vehicle.id}`);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex items-center mb-2 text-white bg-orange-500 w-full p-2 rounded-md">
        <FaCar size={24} className="mr-4" />
        <h1 className="text-2xl font-bold">Crear Vehículo</h1>
      </div>
      <p className="mb-4 text-gray-800">
        Llena el formulario para crear un nuevo vehículo. Los campos marcados
        con * son obligatorios.
      </p>
      <VehicleForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        vehicleTypes={vehicleTypes}
        vehicleBrands={vehicleBrands}
        vehicleModels={vehicleModels}
      />
    </div>
  );
};

export default CreateVehicle;
