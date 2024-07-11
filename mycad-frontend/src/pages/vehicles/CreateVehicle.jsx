import React, { useState } from 'react';
import VehicleForm from '../../components/VehicleForm/VehicleForm';
import { useVehicleContext } from '../../context/VehicleContext';
import { FaCar } from 'react-icons/fa';

const CreateVehicle = () => {
  const { createVehicle, vehicleTypes } = useVehicleContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    typeId: '',
    brand: '',
    model: '',
    acquisitionDate: '',
    cost: '',
    mileage: '',
    status: '',
  };

  const handleSubmit = (values) => {
    setIsSubmitting(true);
    createVehicle(values);
    setIsSubmitting(false);
  };

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex items-center mb-4 text-white bg-orange-500 w-fit p-2 rounded-md">
        <FaCar size={24} className="mr-4" />
        <h1 className="text-2xl font-bold">Crear Vehículo</h1>
      </div>
      <VehicleForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        vehicleTypes={vehicleTypes}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreateVehicle;
