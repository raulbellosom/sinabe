import React, { useEffect, useState } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import CatalogList from '../../../components/VehicleComponents/CatalogList';
import ModalForm from '../../../components/Modals/ModalForm';
import ModalRemove from '../../../components/Modals/ModalRemove';
const TypeForm = React.lazy(
  () => import('../../../components/VehicleComponents/TypeForm/TypeForm'),
);

const Types = () => {
  const {
    vehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    fetchVehicleTypes,
    loading,
  } = useCatalogContext();
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
      {types && types.length > 0 && !loading ? (
        <CatalogList
          data={types}
          title="Tipos de Vehiculos"
          onCreate={() => setIsOpenModal(true)}
          position="center"
          onEdit={(type) => onEditType(type)}
          onRemove={(type) => onRemoveType(type.id)}
        />
      ) : (
        <CatalogList.Skeleton />
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
        onCloseModal={() => setIsDeleteModalOpen(false)}
        removeFunction={handleDelete}
      />
    </div>
  );
};

export default Types;
