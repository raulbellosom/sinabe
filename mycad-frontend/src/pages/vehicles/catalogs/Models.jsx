import React, { useEffect, useState } from 'react';
import { useVehicleContext } from '../../../context/VehicleContext';
import { Button, Checkbox, Table } from 'flowbite-react';
import ModalForm from '../../../components/Modals/ModalForm';
import ModelForm from '../../../components/VehicleComponents/ModelForm/ModelForm';
import Skeleton from 'react-loading-skeleton';

const Models = () => {
  const {
    vehicleModels,
    vehicleBrands,
    vehicleTypes,
    createVehicleModel,
    updateVehicleModel,
    loading,
  } = useVehicleContext();
  const [models, setModels] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    brandId: '',
    typeId: '',
    year: '',
    id: '',
  });

  useEffect(() => {
    const formattedModels = vehicleModels.map((model) => {
      return {
        id: model.id,
        name: model.name,
        brand: model.brand.name,
        type: model.type.name,
        year: model.year,
        typeId: model.typeId,
        brandId: model.brandId,
      };
    });
    setModels(formattedModels);
  }, [vehicleModels]);

  const onEditModel = (model) => {
    setEditMode(true);
    setInitialValues({
      id: model.id,
      name: model.name,
      brandId: model.brandId,
      typeId: model.typeId,
      year: parseInt(model.year, 10),
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateVehicleModel(values)
        : await createVehicleModel(values);
      setSubmitting(false);
      resetForm();
      setIsOpenModal(false);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const onCloseModal = () => {
    setIsOpenModal(false);
    setEditMode(false);
    setInitialValues({
      id: '',
      name: '',
      brandId: '',
      typeId: '',
      year: '',
    });
  };

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-orange-500">Modelos</h1>
        <Button color={'purple'} onClick={() => setIsOpenModal(true)}>
          Crear Modelo
        </Button>
      </div>
      <div className="overflow-x-auto">
        {models && !loading ? (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">
                <Checkbox />
              </Table.HeadCell>
              <Table.HeadCell>#</Table.HeadCell>
              <Table.HeadCell>Modelo</Table.HeadCell>
              <Table.HeadCell>Marca</Table.HeadCell>
              <Table.HeadCell>Tipo de Vehiculo</Table.HeadCell>
              <Table.HeadCell>Año</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {models.map((model, index) => (
                <Table.Row
                  key={model.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="p-4">
                    <Checkbox />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {index + 1}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-900 dark:text-white">
                      {model.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-900 dark:text-white">
                      {model.brand}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-900 dark:text-white">
                      {model.type}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-900 dark:text-white">
                      {model.year}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      type="button"
                      color={'warning'}
                      outline
                      onClick={() => onEditModel(model)}
                    >
                      Editar
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Skeleton className="w-full h-10" count={10} />
        )}
      </div>
      <ModalForm
        onClose={onCloseModal}
        title={editMode ? 'Editar Modelo' : 'Crear Nuevo Modelo'}
        isOpenModal={isOpenModal}
      >
        <ModelForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          vehicleBrands={vehicleBrands}
          vehicleTypes={vehicleTypes}
          isUpdate={editMode}
        />
      </ModalForm>
    </div>
  );
};

export default Models;
