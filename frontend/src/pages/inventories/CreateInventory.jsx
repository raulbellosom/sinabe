import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCatalogContext } from '../../context/CatalogContext';
import { useInventoryContext } from '../../context/InventoryContext';
import ModalForm from '../../components/Modals/ModalForm';
import ReusableModal from '../../components/Modals/ReusableModal';
import ModelForm from '../../components/InventoryComponents/ModelForm/ModelForm';
import PurchaseOrderForm from '../../components/Forms/PurchaseOrderForm';
import InvoiceForm from '../../components/Forms/InvoiceForm';
import LocationForm from '../../components/Forms/LocationForm';
const InventoryForm = React.lazy(
  () =>
    import('../../components/InventoryComponents/InventoryForm/InventoryForm'),
);
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { FaClipboardList, FaSave } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import withPermission from '../../utils/withPermissions';
import { MdCancel, MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { useCustomFieldContext } from '../../context/CustomFieldContext';
import Notifies from '../../components/Notifies/Notifies';

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
  purchaseOrderId: '',
  invoiceId: '',
  locationId: '',
};

const CreateInventory = () => {
  const formRef = useRef(null);
  const locationFormRef = useRef(null);
  const {
    createInventory,
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
    inventoryModels,
    inventoryBrands,
    inventoryTypes,
    inventoryConditions,
    createInventoryModel,
    createInventoryBrand,
    createInventoryType,
  } = useCatalogContext();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [initialValues, setInitialValues] = useState({ ...initValues });

  // Estados para funcionalidades de pin y cambios sin guardar
  const [isPinMode, setIsPinMode] = useState(false);
  const [pinnedFields, setPinnedFields] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState({ ...initValues });

  const handleModalOpen = async () => {
    setIsModalOpen(true);
  };

  const handlePOModalOpen = async () => {
    setIsPOModalOpen(true);
  };

  const handleInvoiceModalOpen = async () => {
    setIsInvoiceModalOpen(true);
  };

  const handleLocationModalOpen = async () => {
    console.log('Opening location modal - "Otro" was selected');
    setIsLocationModalOpen(true);
  };

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
    console.log(
      'Location useEffect triggered - lastCreatedLocationId:',
      lastCreatedLocationId,
      'locations:',
      locations,
    );
    if (lastCreatedLocationId && locations.length > 0) {
      const newLocation = locations.find(
        (loc) => loc.id === lastCreatedLocationId,
      );
      console.log('Found new location:', newLocation);
      if (newLocation) {
        console.log('Auto-selecting location with value:', newLocation.value);
        setInitialValues((prevValues) => ({
          ...prevValues,
          locationId: newLocation.value,
        }));
        setLastCreatedLocationId(null); // Reset
      }
    }
  }, [locations, lastCreatedLocationId]);

  useEffect(() => {
    console.log('Locations changed:', locations);
  }, [locations]);

  useEffect(() => {
    // Cargar listas de PO, invoices y ubicaciones al montar el componente
    console.log(
      'Loading initial data - calling fetchPurchaseOrders, fetchInvoices, fetchLocations',
    );
    fetchPurchaseOrders();
    fetchInvoices();
    fetchLocations();
  }, [fetchPurchaseOrders, fetchInvoices, fetchLocations]);

  useEffect(() => {
    if (inventoryModels) {
      const formattedModels = inventoryModels?.map((model) => ({
        name: `${model?.name} - ${model?.brandName} - ${model?.typeName}`,
        id: model?.id,
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
      console.log('Creating new location with values:', values);
      const newLocation = await createLocation(values);
      console.log('New location created:', newLocation);
      setLastCreatedLocationId(newLocation.id); // Guardar ID para auto-seleccionar
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocationModalOpen(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Values being sent to backend:', values);
      console.log('LocationId specifically:', values.locationId);
      const inventory = await createInventory(values);
      if (inventory?.id) {
        // Limpiar localStorage después del éxito
        clearLocalStorage();
        setSubmitting(false);
        resetForm({ values: initValues });
        setInitialValues({ ...initValues, ...pinnedFields }); // Mantener campos pinned
      }
    } catch (error) {
      Notifies('error', error?.response?.data?.message);
      setSubmitting(false);
      console.error(error);
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

  const onClosePOModal = () => {
    setIsPOModalOpen(false);
  };

  const onCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
  };

  const onCloseLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  // Funciones para manejar pin de campos
  const togglePinMode = () => {
    const newPinMode = !isPinMode;
    setIsPinMode(newPinMode);

    // Si se está desactivando el modo pin, limpiar todos los pins
    if (!newPinMode) {
      setPinnedFields({});
      localStorage.removeItem('pinnedInventoryFields');
      // También resetear el formulario a los valores iniciales sin pins
      setInitialValues({ ...initValues });
    }
  };

  const pinField = (fieldName, value) => {
    const newPinnedFields = { ...pinnedFields, [fieldName]: value };
    setPinnedFields(newPinnedFields);
    localStorage.setItem(
      'pinnedInventoryFields',
      JSON.stringify(newPinnedFields),
    );
  };

  const unpinField = (fieldName) => {
    const newPinnedFields = { ...pinnedFields };
    delete newPinnedFields[fieldName];
    setPinnedFields(newPinnedFields);
    localStorage.setItem(
      'pinnedInventoryFields',
      JSON.stringify(newPinnedFields),
    );
  };

  // Funciones para manejar cambios sin guardar
  const saveToLocalStorage = useCallback((values) => {
    setCurrentFormValues(values);
    setHasUnsavedChanges(true);
    localStorage.setItem('unsavedInventoryForm', JSON.stringify(values));
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem('unsavedInventoryForm');
    localStorage.removeItem('pinnedInventoryFields');
    setHasUnsavedChanges(false);
    setCurrentFormValues({ ...initValues });
  };

  const loadFromLocalStorage = () => {
    const savedForm = localStorage.getItem('unsavedInventoryForm');
    const savedPinnedFields = localStorage.getItem('pinnedInventoryFields');

    if (savedPinnedFields) {
      setPinnedFields(JSON.parse(savedPinnedFields));
    }

    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      setInitialValues({ ...initValues, ...pinnedFields, ...parsedForm });
      setShowUnsavedModal(true);
    }
  };

  const restoreUnsavedChanges = () => {
    const savedForm = localStorage.getItem('unsavedInventoryForm');
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      setInitialValues({ ...initValues, ...pinnedFields, ...parsedForm });
    }
    setShowUnsavedModal(false);
  };

  const discardUnsavedChanges = () => {
    localStorage.removeItem('unsavedInventoryForm');
    setHasUnsavedChanges(false);
    setInitialValues({ ...initValues, ...pinnedFields });
    setShowUnsavedModal(false);
  };

  // useEffect para cargar datos al montar el componente
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // useEffect para detectar cambios en el formulario
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        const message =
          'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmitRef = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex flex-col-reverse md:flex-row items-center gap-4 w-full pb-1">
        <div className="w-full h-full rounded-md flex items-center text-purple-500">
          <FaClipboardList size={24} className="mr-4" />
          <h1 className="md:text-2xl font-bold">Crear Inventario</h1>
        </div>
        <div className="flex justify-center gap-2 w-full md:w-fit text-nowrap">
          <ActionButtons
            extraActions={[
              {
                label: 'Cancelar',
                action: onCancel,
                color: 'red',
                icon: MdCancel,
              },
              {
                label: isPinMode ? 'Desactivar Pin' : 'Activar Pin',
                action: togglePinMode,
                color: isPinMode ? 'green' : 'blue',
                icon: isPinMode ? MdPushPin : MdOutlinePushPin,
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
      <p className="text-xs md:text-base mb-4 text-gray-800">
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
        onOtherPurchaseOrderSelected={() => handlePOModalOpen()}
        onOtherInvoiceSelected={() => handleInvoiceModalOpen()}
        onOtherLocationSelected={() => handleLocationModalOpen()}
        purchaseOrders={purchaseOrders}
        invoices={invoices}
        locations={locations}
        customFields={customFields}
        createCustomField={createField}
        currentCustomFields={initialValues.customFields}
        // Nuevas props para pin y localStorage
        isPinMode={isPinMode}
        pinnedFields={pinnedFields}
        onPinField={pinField}
        onUnpinField={unpinField}
        onFormChange={saveToLocalStorage}
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
            createBrand={createInventoryBrand}
            createType={createInventoryType}
          />
        </ModalForm>
      )}
      {isPOModalOpen && (
        <ModalForm
          onClose={onClosePOModal}
          title={'Crear Orden de Compra'}
          isOpenModal={isPOModalOpen}
        >
          <PurchaseOrderForm
            onSubmit={handleNewPurchaseOrderSubmit}
            onCancel={onClosePOModal}
          />
        </ModalForm>
      )}
      {isInvoiceModalOpen && (
        <ModalForm
          onClose={onCloseInvoiceModal}
          title={'Crear Factura'}
          isOpenModal={isInvoiceModalOpen}
        >
          <InvoiceForm
            onSubmit={handleNewInvoiceSubmit}
            onCancel={onCloseInvoiceModal}
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

      {/* Modal para cambios sin guardar */}
      {showUnsavedModal && (
        <ReusableModal
          isOpen={showUnsavedModal}
          onClose={() => setShowUnsavedModal(false)}
          title="Cambios sin guardar detectados"
          size="md"
          actions={[
            {
              label: 'Descartar cambios',
              action: discardUnsavedChanges,
              color: 'red',
            },
            {
              label: 'Recuperar cambios',
              action: restoreUnsavedChanges,
              color: 'green',
              filled: true,
            },
          ]}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Se encontró información sin guardar
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Parece que estabas creando un inventario anteriormente y la
                  página se cerró sin guardar. ¿Quieres recuperar esa
                  información o empezar de nuevo?
                </p>
              </div>
            </div>
          </div>
        </ReusableModal>
      )}
    </div>
  );
};

const ProtectedCreateInventory = withPermission(
  CreateInventory,
  'create_inventories',
);

export default React.memo(ProtectedCreateInventory);
