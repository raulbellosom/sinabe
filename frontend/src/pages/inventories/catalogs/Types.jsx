import React, { useEffect, useState } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import CatalogList from '../../../components/InventoryComponents/CatalogList';
import ModalRemove from '../../../components/Modals/ModalRemove';
import TypeFormFields from '../../../components/InventoryComponents/TypeForm/TypeFormFields';
import { TypeFormSchema } from '../../../components/InventoryComponents/TypeForm/TypeFormSchema';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { BiCategory } from 'react-icons/bi';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import withPermission from '../../../utils/withPermissions';

const Types = () => {
  const {
    inventoryTypes,
    createInventoryType,
    updateInventoryType,
    deleteInventoryType,
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
    count: 0,
  });

  useEffect(() => {
    const formattedTypes = inventoryTypes.map((type) => {
      return {
        id: type?.id,
        name: type?.name,
        count: type?.count,
      };
    });
    formattedTypes.sort((a, b) =>
      a?.name?.toLowerCase().localeCompare(b?.name?.toLowerCase()),
    );
    setTypes(formattedTypes);
  }, [inventoryTypes]);

  const onEditType = (type) => {
    setEditMode(true);
    let selectedType = inventoryTypes.find((t) => t.id === type.id);
    setInitialValues({
      id: selectedType?.id,
      name: selectedType?.name,
      count: selectedType?.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateInventoryType(values)
        : await createInventoryType(values);
      setSubmitting(false);
      resetForm();
      setInitialValues({
        id: '',
        name: '',
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
      await deleteInventoryType(removeTypeId);
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
      count: 0,
    });
    setIsOpenModal(false);
  };

  const onRemoveType = (id) => {
    setRemoveTypeId(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions('create_inventories_types');
  const isEditPermission = useCheckPermissions('edit_inventories_types');
  const isDeletePermission = useCheckPermissions('delete_inventories_types');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="h-full overflow-auto">
        {types && !loading ? (
          <CatalogList
            icon={BiCategory}
            data={types}
            title="Tipos de Inventarios"
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
            editMode ? 'Editar Tipo de Inventario' : 'Crear Tipo de Inventario'
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

const ProtectedTypesView = withPermission(Types, 'view_inventories_types');

export default ProtectedTypesView;
