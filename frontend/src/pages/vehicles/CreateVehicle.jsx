import React, { useEffect, useRef, useState } from 'react';
import { useCatalogContext } from '../../context/CatalogContext';
import { useVehicleContext } from '../../context/VehicleContext';
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/VehicleComponents/ModelForm/ModelForm';
const VehicleForm = React.lazy(
  () => import('../../components/VehicleComponents/VehicleForm/VehicleForm'),
);
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { FaCar, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import withPermission from '../../utils/withPermissions';

const CreateVehicle = () => {
  const formRef = useRef(null);
  const { createVehicle, createVehicleModel } = useVehicleContext();
  const { vehicleModels, vehicleBrands, vehicleTypes, vehicleConditions } =
    useCatalogContext();
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
    economicNumber: '',
    serialNumber: '',
    plateNumber: '',
    acquisitionDate: '',
    cost: '',
    costCurrency: '',
    bookValue: '',
    bookValueCurrency: '',
    currentMarketValue: '',
    marketValueCurrency: '',
    mileage: '',
    status: '',
    images: [],
    comments: '',
    conditions: [],
    files: [],
  });

  const handleModalOpen = async () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (vehicleModels) {
      const formattedModels = vehicleModels?.map((model) => ({
        name: `(${model.type.economicGroup}) ${model.name} ${model.year} - ${model.brand.name} - ${model.type.name}`,
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

  const onCancel = () => {
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

  const handleSubmitRef = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full pb-1">
        <div className="w-full h-full rounded-md flex items-center text-purple-500">
          <FaCar size={24} className="mr-4" />
          <h1 className="text-2xl font-bold">Crear Vehículo</h1>
        </div>
        <div className="flex justify-center gap-2">
          <ActionButtons
            extraActions={[
              {
                label: 'Guardar',
                action: handleSubmitRef,
                icon: FaSave,
                color: 'green',
              },
            ]}
            onCancel={onCancel}
            labelCancel={'Descartar'}
          />
        </div>
      </div>
      <p className="mb-4 text-gray-800">
        Llena el formulario para crear un nuevo vehículo. Los campos marcados
        con * son obligatorios.
      </p>
      <VehicleForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        vehicleModels={formattedModels}
        vehicleConditions={vehicleConditions}
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

const ProtectedCreateVehicle = withPermission(CreateVehicle, 'create_vehicles');

export default ProtectedCreateVehicle;
