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
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/VehicleComponents/ModelForm/ModelForm';

const UpdateVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    updateVehicle,
    fetchVehicle,
    deleteVehicle,
    vehicle,
    vehicleTypes,
    vehicleBrands,
    vehicleModels,
    vehicleConditions,
    loading,
    createVehicleModel,
  } = useVehicleContext();
  const [initialValues, setInitialValues] = useState({
    modelId: '',
    acquisitionDate: '',
    cost: '',
    mileage: '',
    status: '',
    comments: '',
    conditions: [],
  });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelValue, setNewModelValue] = useState({
    name: '',
    year: '',
    brandId: '',
    typeId: '',
  });
  const [formattedModels, setFormattedModels] = useState([]);

  useEffect(() => {
    fetchVehicle(id);
  }, [id]);

  useEffect(() => {
    if (Object.keys(vehicle).length !== 0) {
      const acquisitionDate = DateLocalParced(vehicle.acquisitionDate);
      const newVehicle = {
        ...vehicle,
        acquisitionDate: acquisitionDate,
        modelId: vehicle.model.id,
        comments: vehicle.comments || '',
      };

      setInitialValues(newVehicle);
    }
  }, [vehicle]);

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
    <>
      <div className="h-full bg-white p-4 rounded-md">
        <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full pb-1">
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
            vehicleModels={formattedModels}
            vehicleConditions={vehicleConditions}
            isUpdate={true}
            onOtherModelSelected={() => handleModalOpen()}
          />
        )}
      </div>
      <ModalRemove
        isOpenModal={isOpenModal}
        onCloseModal={() => setIsOpenModal(false)}
        removeFunction={handleDeleteVehicle}
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
    </>
  );
};

export default UpdateVehicle;
