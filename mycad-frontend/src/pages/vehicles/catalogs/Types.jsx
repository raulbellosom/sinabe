import React, { useEffect, useState } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import CatalogList from '../../../components/VehicleComponents/CatalogList';
import ModalRemove from '../../../components/Modals/ModalRemove';
import TypeFormFields from '../../../components/VehicleComponents/TypeForm/TypeFormFields';
import { TypeFormSchema } from '../../../components/VehicleComponents/TypeForm/TypeFormSchema';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { BiCategory } from 'react-icons/bi';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import withPermission from '../../../utils/withPermissions';

const Types = () => {
  const {
    vehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    loading,
  } = useCatalogContext();
  const [types, setTypes] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeTypeId, setRemoveTypeId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    id: '',
    name: '',
    economicGroup: '',
    count: 0,
  });

  useEffect(() => {
    const formattedTypes = vehicleTypes.map((type) => {
      return {
        id: type?.id,
        name: `${type?.economicGroup} ${type?.name}`,
        economicGroup: type?.economicGroup,
        count: type?.count,
      };
    });
    formattedTypes.sort((a, b) =>
      a?.economicGroup?.localeCompare(b?.economicGroup),
    );
    setTypes(formattedTypes);
  }, [vehicleTypes]);

  const onEditType = (type) => {
    setEditMode(true);
    let selectedType = vehicleTypes.find((t) => t.id === type.id);
    setInitialValues({
      id: selectedType?.id,
      name: selectedType?.name,
      economicGroup: selectedType?.economicGroup,
      count: selectedType?.count,
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
        id: '',
        name: '',
        economicGroup: '',
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
      id: '',
      name: '',
      economicGroup: '',
      count: 0,
    });
    setIsOpenModal(false);
  };

  const onRemoveType = (id) => {
    setRemoveTypeId(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions('create_vehicles_types');
  const isEditPermission = useCheckPermissions('edit_vehicles_types');
  const isDeletePermission = useCheckPermissions('delete_vehicles_types');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="h-full overflow-auto">
        {types && !loading ? (
          <CatalogList
            icon={BiCategory}
            data={types}
            title="Tipos de Vehiculos"
            onCreate={
              isCreatePermission.hasPermission
                ? () => setIsOpenModal(true)
                : null
            }
            onEdit={
              isEditPermission.hasPermission ? (type) => onEditType(type) : null
            }
            onRemove={
              isDeletePermission.hasPermission
                ? (type) => onRemoveType(type.id)
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
          title={
            editMode ? 'Editar Tipo de Vehículo' : 'Crear Tipo de Vehículo'
          }
          schema={TypeFormSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          formFields={<TypeFormFields />}
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

const ProtectedTypesView = withPermission(Types, 'view_vehicles_types');

export default ProtectedTypesView;
