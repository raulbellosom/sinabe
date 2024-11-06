import React, { useEffect, useState } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import CatalogList from '../../../components/VehicleComponents/CatalogList';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { ConditionFormSchema } from '../../../components/VehicleComponents/ConditionForm/ConditionFormSchema';
import ConditionFormFields from '../../../components/VehicleComponents/ConditionForm/ConditionFormFields';
import { FaListAlt } from 'react-icons/fa';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import withPermission from '../../../utils/withPermissions';

const Conditions = () => {
  const {
    vehicleConditions,
    createVehicleCondition,
    updateVehicleCondition,
    deleteVehicleCondition,
    loading,
  } = useCatalogContext();
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
    const formattedConditions = vehicleConditions.map((condition) => {
      return {
        id: condition.id,
        name: condition.name,
        count: condition.count,
      };
    });
    formattedConditions.sort((a, b) => a.name.localeCompare(b.name));
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

  const isCreatePermission = useCheckPermissions('create_vehicles_conditions');
  const isEditPermission = useCheckPermissions('edit_vehicles_conditions');
  const isDeletePermission = useCheckPermissions('delete_vehicles_conditions');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="h-full overflow-auto">
        {conditions && conditions.length > 0 && !loading ? (
          <CatalogList
            icon={FaListAlt}
            data={conditions}
            title="Condición de los Vehiculos"
            onCreate={
              isCreatePermission.hasPermission
                ? () => setIsOpenModal(true)
                : null
            }
            onEdit={
              isEditPermission.hasPermission
                ? (type) => onEditCondition(type)
                : null
            }
            onRemove={
              isDeletePermission.hasPermission
                ? (type) => onRemoveCondition(type.id)
                : null
            }
          />
        ) : (
          <CatalogList.Skeleton />
        )}
      </div>
      {isOpenModal && (
        <ModalFormikForm
          onClose={onCloseModal}
          isOpenModal={isOpenModal}
          dismissible
          title={editMode ? 'Editar Condición' : 'Crear Condición'}
          schema={ConditionFormSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          formFields={<ConditionFormFields />}
          saveLabel={editMode ? 'Actualizar' : 'Guardar'}
        />
      )}
      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        onCloseModal={() => setIsDeleteModalOpen(false)}
        removeFunction={handleDelete}
      />
    </div>
  );
};

const ProtectedConditionsView = withPermission(
  Conditions,
  'view_vehicles_conditions',
);

export default ProtectedConditionsView;
