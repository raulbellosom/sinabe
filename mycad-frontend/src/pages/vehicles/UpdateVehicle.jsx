import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicleContext } from '../../context/VehicleContext';
import { useCatalogContext } from '../../context/CatalogContext';
import { getVehicle } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/VehicleComponents/ModelForm/ModelForm';
import ModalRemove from '../../components/Modals/ModalRemove';
const VehicleForm = React.lazy(
  () => import('../../components/VehicleComponents/VehicleForm/VehicleForm'),
);
import ActionButtons from '../../components/ActionButtons/ActionButtons';

import { FaCar, FaSave } from 'react-icons/fa';

const UpdateVehicle = () => {
  const formRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateVehicle, deleteVehicle } = useVehicleContext();
  const {
    createVehicleModel,
    vehicleConditions,
    vehicleTypes,
    vehicleBrands,
    vehicleModels,
  } = useCatalogContext();

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
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelValue, setNewModelValue] = useState({
    name: '',
    year: '',
    brandId: '',
    typeId: '',
  });
  const [formattedModels, setFormattedModels] = useState([]);
  const {
    data: vehicle,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: ({ signal }) => getVehicle({ id, signal }),
  });

  useEffect(() => {
    if (vehicle && Object.keys(vehicle).length !== 0) {
      const formatedFiles = vehicle?.files?.map((file) => ({
        id: file.id,
        url: file.url,
        type: file.type,
        name: file?.metadata?.originalname || file?.id || '',
      }));
      const values = {
        ...vehicle,
        modelId: vehicle.model.id,
        economicNumber: vehicle.economicNumber || '',
        serialNumber: vehicle.serialNumber || '',
        plateNumber: vehicle.plateNumber || '',
        acquisitionDate: vehicle.acquisitionDate,
        cost: vehicle.cost || '',
        mileage: vehicle.mileage,
        status: vehicle.status == 'true' || vehicle.status == true,
        images: vehicle.images || [],
        files: vehicle?.files ? formatedFiles : [],
        comments: vehicle.comments || '',
        conditions: vehicle.conditions.map(
          (condition) => condition.conditionId,
        ),
      };

      setInitialValues(values);
    }
  }, [vehicle]);

  useEffect(() => {
    if (vehicleModels) {
      const formattedModels = vehicleModels?.map((model) => ({
        name: `${model.name} ${model.year} - ${model.brand.name} - ${model.type.name}`,
        id: model.id,
      }));
      setFormattedModels(formattedModels);
    }
  }, [vehicleModels]);

  const handleModalOpen = async () => {
    setIsModalOpen(true);
  };

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

  const handleSubmitRef = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };
  return (
    <>
      <div className="h-full bg-white p-4 rounded-md">
        <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full pb-1">
          <div className="w-full h-full rounded-md flex items-center text-orange-500">
            <FaCar size={24} className="mr-4" />
            <h1 className="text-2xl font-bold">Actualizar Vehículo</h1>
          </div>
          <div className="flex justify-center gap-2">
            <ActionButtons
              extraActions={[
                {
                  label: 'Actualizar',
                  action: handleSubmitRef,
                  icon: FaSave,
                  color: 'green',
                },
              ]}
              onShow={onShow}
              onRemove={onRemove}
            />
          </div>
        </div>
        <p className="mb-4 text-gray-800">
          Llena el formulario para actualizar el vehículo. Los campos marcados
          con * son obligatorios.
        </p>
        {isPending ||
        isFetching ||
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
            ref={formRef}
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
