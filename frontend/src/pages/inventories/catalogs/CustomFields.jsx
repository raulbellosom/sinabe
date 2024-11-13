import React, { useEffect, useState } from 'react';
import CatalogList from '../../../components/InventoryComponents/CatalogList';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import withPermission from '../../../utils/withPermissions';
import { useCustomFieldContext } from '../../../context/CustomFieldContext';
import { CustomFieldFormSchema } from '../../../components/InventoryComponents/CustomField/CustomFieldFormSchema';
import CustomFieldFields from '../../../components/InventoryComponents/CustomField/CustomFieldFields';
import { RiInputField } from 'react-icons/ri';

const InitValues = {
  name: '',
  id: '',
};

const CustomFields = () => {
  const {
    customFields,
    isLoadingCustomFields,
    createField,
    updateField,
    deleteField,
  } = useCustomFieldContext();
  const [cFields, setCFields] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeCField, setRemoveCField] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState(InitValues);

  useEffect(() => {
    const formattedCFields = customFields.map((condition) => {
      return {
        id: condition.id,
        name: condition.name,
      };
    });
    formattedCFields.sort((a, b) => a.name.localeCompare(b.name));
    setCFields(formattedCFields);
  }, [customFields]);

  const onEditCondition = (condition) => {
    setEditMode(true);
    setInitialValues({
      id: condition.id,
      name: condition.name,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode ? await updateField(values) : await createField(values);
      setSubmitting(false);
      resetForm();
      setInitialValues(InitValues);
      setIsOpenModal(false);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteField(removeCField);
      setIsDeleteModalOpen(false);
      setRemoveCField(null);
    } catch (error) {
      console.log(error);
      setIsDeleteModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setEditMode(false);
    setInitialValues(InitValues);
    setIsOpenModal(false);
  };

  const onRemoveCondition = (id) => {
    setRemoveCField(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions(
    'create_inventories_custom_fields',
  );
  const isEditPermission = useCheckPermissions(
    'edit_inventories_custom_fields',
  );
  const isDeletePermission = useCheckPermissions(
    'delete_inventories_custom_fields',
  );
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="h-full overflow-auto">
        {cFields && !isLoadingCustomFields ? (
          <CatalogList
            icon={RiInputField}
            data={cFields}
            title="Campos Personalizados"
            onCreate={
              isCreatePermission.hasPermission
                ? () => setIsOpenModal(true)
                : null
            }
            onEdit={
              isEditPermission.hasPermission
                ? (cfield) => onEditCondition(cfield)
                : null
            }
            onRemove={
              isDeletePermission.hasPermission
                ? (cfield) => onRemoveCondition(cfield.id)
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
            editMode
              ? 'Editar Campo Personalizado'
              : 'Crear Campo Personalizado'
          }
          schema={CustomFieldFormSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          formFields={<CustomFieldFields />}
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
  CustomFields,
  'view_inventories_custom_fields',
);

export default ProtectedConditionsView;
