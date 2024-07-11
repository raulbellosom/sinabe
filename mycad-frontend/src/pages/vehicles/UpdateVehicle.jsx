import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VehicleForm from '../../components/VehicleForm/VehicleForm';
import { useVehicle } from '../../hooks/useVehicle';
import { getVehicleTypes } from '../../services/vehicleService';

const UpdateVehicle = () => {
  const { id } = useParams();
  const { getVehicle, updateVehicle } = useVehicle();
  const [vehicle, setVehicle] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    getVehicle(id).then(setVehicle);
    getVehicleTypes().then(setVehicleTypes);
  }, [id]);

  const handleSubmit = (values, { setSubmitting }) => {
    updateVehicle(id, values).finally(() => setSubmitting(false));
  };

  if (!vehicle) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Actualizar Vehículo</h1>
      <VehicleForm
        initialValues={vehicle}
        onSubmit={handleSubmit}
        vehicleTypes={vehicleTypes}
      />
    </div>
  );
};

export default UpdateVehicle;
