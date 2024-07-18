import React, { useEffect, useState } from 'react';
import { useVehicleContext } from '../../../context/VehicleContext';
import TypeForm from '../../../components/VehicleComponents/TypeForm/TypeForm';
import ModalForm from '../../../components/Modals/ModalForm';
import { Checkbox, Table } from 'flowbite-react';
import Skeleton from 'react-loading-skeleton';
import { useAuthContext } from '../../../context/AuthContext';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import ModalRemove from '../../../components/Modals/ModalRemove';

const Types = () => {
  const {
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    fetchVehicleTypes,
    loading,
    vehicleTypes,
  } = useVehicleContext();
  const { user } = useAuthContext();
  const [types, setTypes] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeTypeId, setRemoveTypeId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    id: '',
    count: 0,
  });

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    const formattedTypes = vehicleTypes.map((type) => {
      return {
        id: type.id,
        name: type.name,
        count: type.count,
      };
    });
    setTypes(formattedTypes);
  }, [vehicleTypes]);

  const onEditType = (type) => {
    setEditMode(true);
    setInitialValues({
      id: type.id,
      name: type.name,
      count: type.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateVehicleType(values)
        : await createVehicleType(values);
      setSubmitting(false);
      resetForm();
      setInitialValues({
        name: '',
        id: '',
        count: 0,
      });
      setIsOpenModal(false);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVehicleType(removeTypeId);
      setIsDeleteModalOpen(false);
      setRemoveTypeId(null);
    } catch (error) {
      console.log(error);
      setIsDeleteModalOpen(false);
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

  const onRemoveType = (id) => {
    setRemoveTypeId(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-nowrap mb-2">
        <h1 className="text-xl font-bold ml-4 text-orange-500">
          Tipos de vehículos
        </h1>
        <ActionButtons
          userRole={user.roleId}
          onCreate={() => setIsOpenModal(true)}
          labelCreate={'Crear Tipo de Vehiculo'}
        />
      </div>
      {types && types.length > 0 && !loading ? (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox />
            </Table.HeadCell>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>Nombre</Table.HeadCell>
            <Table.HeadCell># de Vehiculos de este Tipo</Table.HeadCell>
            <Table.HeadCell className="text-center">Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {types.map((type, index) => (
              <Table.Row
                key={type.id}
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
                    {type.name}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-gray-900 dark:text-white text-center">
                    {type.count}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <ActionButtons
                    position="center"
                    userRole={user.roleId}
                    onEdit={() => onEditType(type)}
                    onRemove={() => onRemoveType(type.id)}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <Skeleton className="w-full h-10" count={10} />
      )}
      <ModalForm
        onClose={onCloseModal}
        isOpenModal={isOpenModal}
        title={editMode ? 'Editar Tipo de Vehiculo' : 'Crear Tipo de Vehiculo'}
      >
        <TypeForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isUpdate={editMode}
        />
      </ModalForm>
      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        removeFunction={handleDelete}
      />
    </div>
  );
};

export default Types;
