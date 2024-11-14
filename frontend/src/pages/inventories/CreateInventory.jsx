import React, { useEffect, useRef, useState } from 'react';
import { useCatalogContext } from '../../context/CatalogContext';
import { useInventoryContext } from '../../context/InventoryContext';
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/InventoryComponents/ModelForm/ModelForm';
const InventoryForm = React.lazy(
  () =>
    import('../../components/InventoryComponents/InventoryForm/InventoryForm'),
);
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { FaClipboardList, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import withPermission from '../../utils/withPermissions';
import { MdCancel } from 'react-icons/md';
import { useCustomFieldContext } from '../../context/CustomFieldContext';

const initValues = {
  modelId: '',
  serialNumber: '',
  activeNumber: '',
  receptionDate: '',
  status: '',
  images: [],
  comments: '',
  conditions: [],
  files: [],
  customFields: [],
};

const CreateInventory = () => {
  const formRef = useRef(null);
  const { createInventory } = useInventoryContext();
  const { customFields, createField } = useCustomFieldContext();
  const {
    inventoryModels,
    inventoryBrands,
    inventoryTypes,
    inventoryConditions,
    createInventoryModel,
  } = useCatalogContext();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelValue, setNewModelValue] = useState({
    name: '',
    brandId: '',
    typeId: '',
  });
  const [formattedModels, setFormattedModels] = useState([]);
  const [initialValues, setInitialValues] = useState({ ...initValues });

  const handleModalOpen = async () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (inventoryModels) {
      const formattedModels = inventoryModels?.map((model) => ({
        name: `${model.name} - ${model.brand.name} - ${model.type.name}`,
        id: model.id,
      }));
      setFormattedModels(formattedModels);
    }
  }, [inventoryModels]);

  const handleNewModelSubmit = async (values) => {
    try {
      const newModel = await createInventoryModel(values);
      setFormattedModels([
        ...formattedModels,
        {
          name: `${newModel.name} - ${newModel.brand.name} - ${newModel.type.name}`,
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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const inventory = await createInventory(values);
      setSubmitting(false);
      resetForm({ values: initValues });
      // navigate(`/inventories/view/${inventory.id}`);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    navigate('/inventories');
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    setNewModelValue({
      name: '',
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
    <div className="h-full bg-white p-4 rounded-md">
      <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full pb-1">
        <div className="w-full h-full rounded-md flex items-center text-purple-500">
          <FaClipboardList size={24} className="mr-4" />
          <h1 className="text-2xl font-bold">Crear Inventario</h1>
        </div>
        <div className="flex justify-center gap-2 w-full md:w-fit">
          <ActionButtons
            extraActions={[
              {
                label: 'Cancelar',
                action: onCancel,
                color: 'red',
                icon: MdCancel,
              },
              {
                label: 'Guardar',
                action: handleSubmitRef,
                icon: FaSave,
                color: 'green',
              },
            ]}
          />
        </div>
      </div>
      <p className="mb-4 text-gray-800">
        Llena el formulario para crear un nuevo inventario. Los campos marcados
        con * son obligatorios.
      </p>
      <InventoryForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        inventoryModels={formattedModels}
        inventoryConditions={inventoryConditions}
        onOtherModelSelected={() => handleModalOpen()}
        customFields={customFields}
        createCustomField={createField}
        currentCustomFields={initialValues.customFields}
      />
      {isModalOpen && (
        <ModalForm
          onClose={onCloseModal}
          title={'Crear Modelo'}
          isOpenModal={isModalOpen}
        >
          <ModelForm
            onSubmit={handleNewModelSubmit}
            initialValues={newModelValue}
            inventoryBrands={inventoryBrands}
            inventoryTypes={inventoryTypes}
          />
        </ModalForm>
      )}
    </div>
  );
};

const ProtectedCreateInventory = withPermission(
  CreateInventory,
  'create_inventories',
);

export default ProtectedCreateInventory;
