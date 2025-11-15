import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryContext } from '../../context/InventoryContext';
import { useCatalogContext } from '../../context/CatalogContext';
import { getInventory } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import ModalForm from '../../components/Modals/ModalForm';
import ModelForm from '../../components/InventoryComponents/ModelForm/ModelForm';
import PurchaseOrderForm from '../../components/Forms/PurchaseOrderForm';
import InvoiceForm from '../../components/Forms/InvoiceForm';
import LocationForm from '../../components/Forms/LocationForm';
import ModalRemove from '../../components/Modals/ModalRemove';
const InventoryForm = React.lazy(
  () =>
    import('../../components/InventoryComponents/InventoryForm/InventoryForm'),
);
import ActionButtons from '../../components/ActionButtons/ActionButtons';

import { FaClipboardList, FaSave } from 'react-icons/fa';
import withPermission from '../../utils/withPermissions';
import { useCustomFieldContext } from '../../context/CustomFieldContext';
import NotFound from '../notFound/NotFound';
import { ThreeCircles } from 'react-loader-spinner';

const UpdateInventory = () => {
  const formRef = useRef(null);
  const locationFormRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    updateInventory,
    deleteInventory,
    purchaseOrders,
    invoices,
    locations,
    fetchPurchaseOrders,
    fetchInvoices,
    fetchLocations,
    createPurchaseOrder,
    createInvoice,
    createLocation,
  } = useInventoryContext();
  const { customFields, createField } = useCustomFieldContext();
  const {
    createInventoryModel,
    inventoryConditions,
    inventoryTypes,
    inventoryBrands,
    inventoryModels,
    createInventoryBrand,
    createInventoryType,
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
    purchaseOrderId: '',
    invoiceId: '',
    locationId: '',
  });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [lastCreatedPOId, setLastCreatedPOId] = useState(null);
  const [lastCreatedInvoiceId, setLastCreatedInvoiceId] = useState(null);
  const [lastCreatedLocationId, setLastCreatedLocationId] = useState(null);
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
    error,
  } = useQuery({
    queryKey: ['inventory', id],
    queryFn: ({ signal }) => getInventory({ id, signal }),
    staleTime: 1000 * 60 * 5, // 5 minutos (ajusta según lo necesario)
    cacheTime: 1000 * 60 * 10, // 10 minutos (ajusta según lo necesario)
  });

  useEffect(() => {
    // Auto-seleccionar la nueva PO cuando se crea
    if (lastCreatedPOId && purchaseOrders.length > 0) {
      const newPO = purchaseOrders.find((po) => po.id === lastCreatedPOId);
      if (newPO) {
        setInitialValues((prevValues) => ({
          ...prevValues,
          purchaseOrderId: newPO.value,
        }));
        setLastCreatedPOId(null); // Reset
      }
    }
  }, [purchaseOrders, lastCreatedPOId]);

  useEffect(() => {
    // Auto-seleccionar la nueva invoice cuando se crea
    if (lastCreatedInvoiceId && invoices.length > 0) {
      const newInvoice = invoices.find(
        (inv) => inv.id === lastCreatedInvoiceId,
      );
      if (newInvoice) {
        setInitialValues((prevValues) => ({
          ...prevValues,
          invoiceId: newInvoice.value,
        }));
        setLastCreatedInvoiceId(null); // Reset
      }
    }
  }, [invoices, lastCreatedInvoiceId]);

  useEffect(() => {
    // Auto-seleccionar la nueva ubicación cuando se crea
    if (lastCreatedLocationId && locations.length > 0) {
      const newLocation = locations.find(
        (loc) => loc.id === lastCreatedLocationId,
      );
      if (newLocation) {
        setInitialValues((prevValues) => ({
          ...prevValues,
          locationId: newLocation.value,
        }));
        setLastCreatedLocationId(null); // Reset
      }
    }
  }, [locations, lastCreatedLocationId]);

  useEffect(() => {
    // Cargar listas de PO, invoices y ubicaciones al montar el componente
    fetchPurchaseOrders();
    fetchInvoices();
    fetchLocations();
  }, [fetchPurchaseOrders, fetchInvoices, fetchLocations]);

  useEffect(() => {
    if (inventory && Object.keys(inventory).length !== 0) {
      console.log('Inventory data:', inventory);
      console.log('Inventory location:', inventory.location);
      console.log('Inventory locationId:', inventory.locationId);

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
        purchaseOrderId: inventory.purchaseOrderId || '',
        invoiceId: inventory.invoiceId || '',
        locationId: inventory.locationId || '',
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

  const handlePOModalOpen = async () => {
    setIsPOModalOpen(true);
  };

  const handleInvoiceModalOpen = async () => {
    setIsInvoiceModalOpen(true);
  };

  const handleLocationModalOpen = async () => {
    setIsLocationModalOpen(true);
  };

  const handleNewPurchaseOrderSubmit = async (values) => {
    try {
      const newPO = await createPurchaseOrder(values);
      setLastCreatedPOId(newPO.id); // Guardar ID para auto-seleccionar
    } catch (error) {
      console.error(error);
    } finally {
      setIsPOModalOpen(false);
    }
  };

  const handleNewInvoiceSubmit = async (values) => {
    try {
      const newInvoice = await createInvoice(values);
      setLastCreatedInvoiceId(newInvoice.id); // Guardar ID para auto-seleccionar
    } catch (error) {
      console.error(error);
    } finally {
      setIsInvoiceModalOpen(false);
    }
  };

  const handleNewLocationSubmit = async (values) => {
    try {
      const newLocation = await createLocation(values);
      setLastCreatedLocationId(newLocation.id); // Guardar ID para auto-seleccionar
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocationModalOpen(false);
    }
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Values being sent to backend in UPDATE:', values);
      console.log('LocationId specifically in UPDATE:', values.locationId);
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

  const onCloseLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const handleSubmitRef = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  if (isPending) {
    return (
      <div className="h-full bg-white p-3 rounded-md">
        <div className="flex flex-col items-center justify-center h-full">
          <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#7e3af2"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperclassName=""
          />
          <p className="text-gray-500 text-lg mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <NotFound />;
  }

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
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
          <>
            {console.log('Locations in UpdateInventory:', locations)}
            {console.log('InitialValues in UpdateInventory:', initialValues)}
            <InventoryForm
              ref={formRef}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              inventoryModels={formattedModels}
              inventoryConditions={inventoryConditions}
              isUpdate={true}
              onOtherModelSelected={() => handleModalOpen()}
              onOtherPurchaseOrderSelected={() => handlePOModalOpen()}
              onOtherInvoiceSelected={() => handleInvoiceModalOpen()}
              onOtherLocationSelected={() => handleLocationModalOpen()}
              purchaseOrders={purchaseOrders}
              invoices={invoices}
              locations={locations}
              customFields={customFields}
              createCustomField={createField}
              currentCustomFields={initialValues.customFields}
              inventoryId={id}
            />
          </>
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
          createBrand={createInventoryBrand}
          createType={createInventoryType}
          isUpdate={true}
        />
      </ModalForm>
      {isPOModalOpen && (
        <ModalForm
          onClose={() => setIsPOModalOpen(false)}
          title={'Crear Orden de Compra'}
          isOpenModal={isPOModalOpen}
        >
          <PurchaseOrderForm
            onSubmit={handleNewPurchaseOrderSubmit}
            onCancel={() => setIsPOModalOpen(false)}
          />
        </ModalForm>
      )}
      {isInvoiceModalOpen && (
        <ModalForm
          onClose={() => setIsInvoiceModalOpen(false)}
          title={'Crear Factura'}
          isOpenModal={isInvoiceModalOpen}
        >
          <InvoiceForm
            onSubmit={handleNewInvoiceSubmit}
            onCancel={() => setIsInvoiceModalOpen(false)}
          />
        </ModalForm>
      )}
      {isLocationModalOpen && (
        <ModalForm
          onClose={onCloseLocationModal}
          title={'Crear Ubicación'}
          isOpenModal={isLocationModalOpen}
          size="md"
          actions={[
            {
              label: 'Cancelar',
              action: onCloseLocationModal,
              color: 'gray',
              type: 'button',
            },
            {
              label: 'Crear Ubicación',
              action: () => {
                if (locationFormRef.current) {
                  locationFormRef.current.submitForm();
                }
              },
              color: 'purple',
              type: 'submit',
              filled: true,
            },
          ]}
        >
          <LocationForm
            ref={locationFormRef}
            onSubmit={handleNewLocationSubmit}
            onCancel={onCloseLocationModal}
          />
        </ModalForm>
      )}
    </>
  );
};

const ProtectedInventoriesUpdate = withPermission(
  UpdateInventory,
  'edit_inventories',
);

export default ProtectedInventoriesUpdate;
