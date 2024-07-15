import React, { useState } from 'react';
import VehicleForm from '../../components/VehicleComponents/VehicleForm/VehicleForm';
import { useVehicleContext } from '../../context/VehicleContext';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { useAuthContext } from '../../context/AuthContext';
import ModalForm from '../../components/Modals/ModalForm';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { MdGarage } from 'react-icons/md';

const CreateVehicle = () => {
  const {
    createVehicle,
    vehicleTypes,
    vehicleBrands,
    vehicleModels,
    createVehicleModel,
  } = useVehicleContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);

  const handleModalOpen = (fields) => {
    setModalFields(fields);
    setIsModalOpen(true);
  };

  let initialValues = {
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

  const onRemove = () => {
    navigate('/vehicles');
  };

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full pb-2 border-b border-gray-300">
        <div className="w-full h-full rounded-md flex items-center text-orange-500">
          <FaCar size={24} className="mr-4" />
          <h1 className="text-2xl font-bold">Crear Vehículo</h1>
        </div>
        <ActionButtons userRole={user?.roleId} onRemove={onRemove} />
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
        onOtherModelSelected={() =>
          handleModalOpen([
            {
              label: 'Ingrese el nombre del modelo',
              inputType: 'text',
              icon: FaCar,
            },
            {
              label: 'Ingrese el año del modelo',
              inputType: 'text',
              icon: MdGarage,
            },
            {
              label: 'Seleccione el tipo de vehículo',
              values: vehicleTypes,
              inputType: 'select',
              icon: BiCategory,
            },
            {
              label: 'Seleccione la marca de vehículo',
              values: vehicleBrands,
              inputType: 'select',
              icon: PiTrademarkRegisteredBold,
            },
          ])
        }
      />
      <ModalForm
        title="Añadir Nuevo Modelo"
        inputs={modalFields}
        isOpenModal={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => console.log(data)}
      />
    </div>
  );
};

export default CreateVehicle;
