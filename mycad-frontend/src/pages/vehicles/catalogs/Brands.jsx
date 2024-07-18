import React, { useEffect, useState } from 'react';
import { useVehicleContext } from '../../../context/VehicleContext';
import BrandForm from '../../../components/VehicleComponents/BrandForm/BrandForm';
import ModalForm from '../../../components/Modals/ModalForm';
import { Checkbox, Table } from 'flowbite-react';
import Skeleton from 'react-loading-skeleton';
import { useAuthContext } from '../../../context/AuthContext';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import ModalRemove from '../../../components/Modals/ModalRemove';

const Brands = () => {
  const {
    createVehicleBrand,
    updateVehicleBrand,
    deleteVehicleBrand,
    fetchVehicleBrands,
    loading,
    vehicleBrands,
  } = useVehicleContext();
  const { user } = useAuthContext();
  const [brands, setBrands] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeBrandId, setRemoveBrandId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    id: '',
    count: 0,
  });

  useEffect(() => {
    fetchVehicleBrands();
  }, []);

  useEffect(() => {
    const formattedBrands = vehicleBrands.map((brand) => {
      return {
        id: brand.id,
        name: brand.name,
        count: brand.count,
      };
    });
    setBrands(formattedBrands);
  }, [vehicleBrands]);

  const onEditBrand = (brand) => {
    setEditMode(true);
    setInitialValues({
      id: brand.id,
      name: brand.name,
      count: brand.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateVehicleBrand(values)
        : await createVehicleBrand(values);
      setSubmitting(false);
      resetForm();
      setIsOpenModal(false);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const onCloseModal = () => {
    setEditMode(false);
    setInitialValues({
      name: '',
      id: '',
      count: 0,
    });
    setIsOpenModal(false);
  };

  const onRemoveBrand = (id) => {
    setRemoveBrandId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteVehicleBrand = async () => {
    try {
      await deleteVehicleBrand(removeBrandId);
      setIsDeleteModalOpen(false);
      setRemoveBrandId(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center text-nowrap mb-2">
        <h1 className="text-xl font-bold ml-4 text-orange-500">
          Marcas de Vehiculos
        </h1>
        <ActionButtons
          userRole={user.roleId}
          onCreate={() => setIsOpenModal(true)}
          labelCreate={'Crear Marca de Vehiculo'}
        />
      </div>
      <div className="overflow-x-auto">
        {brands && brands.length > 0 && !loading ? (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">
                <Checkbox />
              </Table.HeadCell>
              <Table.HeadCell>#</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell># de Vehiculos de esta Marca</Table.HeadCell>
              <Table.HeadCell className="text-center">Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {brands.map((brand, index) => (
                <Table.Row
                  key={brand.id}
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
                      {brand.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <span className="text-gray-900 dark:text-white text-center">
                      {brand.count}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <ActionButtons
                      position="center"
                      userRole={user.roleId}
                      onEdit={() => onEditBrand(brand)}
                      onRemove={() => onRemoveBrand(brand.id)}
                    />
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
        title={
          editMode
            ? 'Editar Marca de Vehiculos'
            : 'Agregar Nueva Marca de Vehiculos'
        }
        isOpenModal={isOpenModal}
      >
        <BrandForm
          onSubmit={handleSubmit}
          initialValue={initialValues}
          isUpdate={editMode}
        />
      </ModalForm>
      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        removeFunction={handleDeleteVehicleBrand}
      />
    </div>
  );
};

export default Brands;
