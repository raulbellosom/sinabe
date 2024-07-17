import React, { useEffect, useState } from 'react';
import VehicleForm from '../../components/VehicleComponents/VehicleForm/VehicleForm';
import { useVehicleContext } from '../../context/VehicleContext';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { useAuthContext } from '../../context/AuthContext';
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/VehicleComponents/ModelForm/ModelForm';

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
  const [newModelValue, setNewModelValue] = useState({
    name: '',
    year: '',
    brandId: '',
    typeId: '',
  });
  const [formattedModels, setFormattedModels] = useState([]);
  const [initialValues, setInitialValues] = useState({
    modelId: '',
    acquisitionDate: '',
    cost: '',
    mileage: '',
    status: '',
    comments: '',
  });

  const handleModalOpen = async () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (vehicleModels) {
      const formattedModels = vehicleModels?.map((model) => ({
        name: `${model.name} ${model.year} - ${model.brand.name} - ${model.type.name}`,
        id: model.id,
      }));
      setFormattedModels(formattedModels);
    }
  }, [vehicleModels]);

  const handleNewModelSubmit = async (values) => {
    try {
      const newModel = await createVehicleModel(values);
      setFormattedModels([
        ...formattedModels,
        {
          name: `${newModel.name} ${newModel.year} - ${newModel.brand.name} - ${newModel.type.name}`,
          id: newModel.id,
        },
      ]);
      setInitialValues((prevValues) => ({
        ...prevValues,
        modelId: newModel.id,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalOpen(false);
    }
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

  const onCloseModal = () => {
    setIsModalOpen(false);
    setNewModelValue({
      name: '',
      year: '',
      brandId: '',
      typeId: '',
    });
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
        vehicleModels={formattedModels}
        onOtherModelSelected={() => handleModalOpen()}
      />
      <ModalForm
        onClose={onCloseModal}
        title={'Crear Modelo'}
        isOpenModal={isModalOpen}
      >
        <ModelForm
          onSubmit={handleNewModelSubmit}
          initialValues={newModelValue}
          vehicleBrands={vehicleBrands}
          vehicleTypes={vehicleTypes}
        />
      </ModalForm>
    </div>
  );
};

export default CreateVehicle;
