import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryContext } from '../../context/InventoryContext';
import { useCatalogContext } from '../../context/CatalogContext';
import { getInventory } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/InventoryComponents/ModelForm/ModelForm';
import ModalRemove from '../../components/Modals/ModalRemove';
const InventoryForm = React.lazy(
  () =>
    import('../../components/InventoryComponents/InventoryForm/InventoryForm'),
);
import ActionButtons from '../../components/ActionButtons/ActionButtons';

import { FaClipboardList, FaSave } from 'react-icons/fa';
import withPermission from '../../utils/withPermissions';
import { useCustomFieldContext } from '../../context/CustomFieldContext';

const UpdateInventory = () => {
  const formRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateInventory, deleteInventory } = useInventoryContext();
  const { customFields, createField } = useCustomFieldContext();
  const {
    createInventoryModel,
    inventoryConditions,
    inventoryTypes,
    inventoryBrands,
    inventoryModels,
  } = useCatalogContext();

  const [initialValues, setInitialValues] = useState({
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
  });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelValue, setNewModelValue] = useState({
    name: '',
    brandId: '',
    typeId: '',
  });
  const [formattedModels, setFormattedModels] = useState([]);
  const {
    data: inventory,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['inventory', id],
    queryFn: ({ signal }) => getInventory({ id, signal }),
    staleTime: 1000 * 60 * 5, // 5 minutos (ajusta según lo necesario)
    cacheTime: 1000 * 60 * 10, // 10 minutos (ajusta según lo necesario)
  });

  useEffect(() => {
    if (inventory && Object.keys(inventory).length !== 0) {
      const formatedFiles = inventory?.files?.map((file) => ({
        id: file.id,
        url: file.url,
        type: file.type,
        name: file?.metadata?.originalname || file?.id || '',
      }));
      const values = {
        ...inventory,
        modelId: inventory.model.id,
        serialNumber: inventory.serialNumber || '',
        activeNumber: inventory.activeNumber || '',
        receptionDate: inventory.receptionDate || '',
        status: inventory.status,
        images: inventory.images || [],
        files: inventory?.files ? formatedFiles : [],
        comments: inventory.comments || '',
        conditions: inventory.conditions.map(
          (condition) => condition.conditionId,
        ),
        customFields: inventory?.customField
          ? inventory.customField
              .filter(
                (field) => field.customFieldId && !isNaN(field.customFieldId),
              )
              .map((field) => ({
                id: field.id,
                name: field.customField.name,
                value: field.value,
                customFieldId: field.customFieldId,
              }))
          : [],
      };

      setInitialValues(values);
    }
  }, [inventory]);

  useEffect(() => {
    if (inventoryModels) {
      const formattedModels = inventoryModels?.map((model) => ({
        name: `${model.name} - ${model.brand.name} - ${model.type.name}`,
        id: model.id,
      }));
      setFormattedModels(formattedModels);
    }
  }, [inventoryModels]);

  const handleModalOpen = async () => {
    setIsModalOpen(true);
  };

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

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    try {
      updateInventory(values);
      resetForm();
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const onRemove = () => {
    setIsOpenModal(true);
  };

  const onCreate = () => {
    navigate('/inventories/create');
  };

  const handleDeleteInventory = () => {
    deleteInventory(id);
    navigate('/inventories');
  };

  const onShow = () => {
    navigate(`/inventories/view/${id}`);
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
    <>
      <div className="h-full bg-white p-4 rounded-md">
        <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full pb-1">
          <div className="w-full h-full rounded-md flex items-center text-purple-500">
            <FaClipboardList size={24} className="mr-4" />
            <h1 className="text-2xl font-bold">Actualizar Inventario</h1>
          </div>
          <div className="flex justify-center gap-2">
            <ActionButtons
              extraActions={[
                {
                  label: 'Actualizar',
                  action: handleSubmitRef,
                  icon: FaSave,
                  color: 'green',
                },
              ]}
              onShow={onShow}
              onRemove={onRemove}
            />
          </div>
        </div>
        <p className="mb-4 text-gray-800">
          Llena el formulario para actualizar el inventario. Los campos marcados
          con * son obligatorios.
        </p>
        {isPending ||
        isFetching ||
        (Object.keys(inventory).length == 0 &&
          inventory.constructor === Object) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 gap-y-6">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
        ) : (
          <InventoryForm
            ref={formRef}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            inventoryModels={formattedModels}
            inventoryConditions={inventoryConditions}
            isUpdate={true}
            onOtherModelSelected={() => handleModalOpen()}
            customFields={customFields}
            createCustomField={createField}
            currentCustomFields={initialValues.customFields}
          />
        )}
      </div>
      <ModalRemove
        isOpenModal={isOpenModal}
        onCloseModal={() => setIsOpenModal(false)}
        removeFunction={handleDeleteInventory}
      />
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
    </>
  );
};

const ProtectedInventoriesUpdate = withPermission(
  UpdateInventory,
  'edit_inventories',
);

export default ProtectedInventoriesUpdate;
