import React, { useEffect, useState } from 'react';
import { useVehicleContext } from '../../../context/VehicleContext';
import TypeForm from '../../../components/VehicleComponents/TypeForm/TypeForm';
import ModalForm from '../../../components/Modals/ModalForm';
import ModalRemove from '../../../components/Modals/ModalRemove';
import CatalogList from '../../../components/VehicleComponents/CatalogList';

const Conditions = () => {
  const {
    createVehicleCondition,
    updateVehicleCondition,
    deleteVehicleCondition,
    fetchVehicleConditions,
    loading,
    vehicleConditions,
  } = useVehicleContext();
  const [conditions, setConditions] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeConditionId, setRemoveConditionId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    id: '',
    count: 0,
  });

  useEffect(() => {
    fetchVehicleConditions();
  }, []);

  useEffect(() => {
    const formattedConditions = vehicleConditions.map((condition) => {
      return {
        id: condition.id,
        name: condition.name,
        count: condition.count,
      };
    });
    setConditions(formattedConditions);
  }, [vehicleConditions]);

  const onEditCondition = (condition) => {
    setEditMode(true);
    setInitialValues({
      id: condition.id,
      name: condition.name,
      count: condition.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateVehicleCondition(values)
        : await createVehicleCondition(values);
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
      await deleteVehicleCondition(removeConditionId);
      setIsDeleteModalOpen(false);
      setRemoveConditionId(null);
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

  const onRemoveCondition = (id) => {
    setRemoveConditionId(id);
    setIsDeleteModalOpen(true);
  };
  return (
    <div className="w-full h-full">
      {conditions && conditions.length > 0 && !loading ? (
        <CatalogList
          data={conditions}
          title="Condiciones de los Vehiculos"
          onCreate={() => setIsOpenModal(true)}
          position="center"
          onEdit={(type) => onEditCondition(type)}
          onRemove={(type) => onRemoveCondition(type.id)}
        />
      ) : (
        <CatalogList.Skeleton />
      )}
      <ModalForm
        onClose={onCloseModal}
        isOpenModal={isOpenModal}
        title={
          editMode
            ? 'Editar Condicion del Vehiculo'
            : 'Crear Condicion del Vehiculo'
        }
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

export default Conditions;
