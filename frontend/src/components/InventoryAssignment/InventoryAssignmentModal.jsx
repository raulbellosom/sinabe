import React, { useState, useMemo, useEffect, useCallback } from 'react';
import SideModal from '../Modals/SideModal';
import ConfirmModal from '../Modals/ConfirmModal';
import { useInventorySelection } from '../../context/InventorySelectionProvider';
import { MdInventory, MdWarning, MdCheckCircle } from 'react-icons/md';
import { FaFileInvoice, FaClipboardList, FaTimes } from 'react-icons/fa';
import ActionButtons from '../ActionButtons/ActionButtons';
import ReusableTable from '../Table/ReusableTable';
import classNames from 'classnames';
import SimpleSearchSelectInput from '../Inputs/SimpleSearchSelectInput';
import { Formik, Form, Field } from 'formik';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSearchAllInvoices,
  useCreateIndependentInvoice,
  useAssignInventoriesToIndependentInvoice,
} from '../../hooks/useInvoices';
import {
  useSearchPurchaseOrders,
  useCreatePurchaseOrderWithoutProject,
  useAssignInventoriesToPurchaseOrder,
} from '../../hooks/usePurchaseOrders';
import { useSearchInventories } from '../../hooks/useSearchInventories';
import Notifies from '../Notifies/Notifies';

const InventoryAssignmentModal = () => {
  const {
    isCartOpen,
    closeCart,
    selectedInventories,
    clearSelection,
    toggleInventory,
    updateInventories,
  } = useInventorySelection();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('invoice'); // 'invoice' o 'purchaseOrder'
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Hooks para mutaciones
  const createInvoiceMutation = useCreateIndependentInvoice();
  const createPurchaseOrderMutation = useCreatePurchaseOrderWithoutProject();
  const assignToInvoiceMutation =
    useAssignInventoriesToIndependentInvoice(selectedInvoiceId);
  const assignToPurchaseOrderMutation = useAssignInventoriesToPurchaseOrder(
    selectedPurchaseOrderId,
  );

  // Queries para facturas y órdenes de compra
  const { data: invoicesData } = useSearchAllInvoices({
    searchTerm: '',
    page: 1,
    pageSize: 1000,
  });

  const { data: purchaseOrdersData } = useSearchPurchaseOrders(null, {
    searchTerm: '',
    page: 1,
    pageSize: 1000,
  });

  const invoices = invoicesData?.data || [];
  const purchaseOrders = purchaseOrdersData?.data || [];

  // Obtener IDs de los inventarios seleccionados
  const selectedInventoryIds = useMemo(
    () => selectedInventories.map((inv) => inv.id),
    [selectedInventories],
  );

  // Hook para obtener los datos frescos de los inventarios seleccionados
  const { data: freshInventoriesData, refetch: refetchInventories } =
    useSearchInventories({
      searchTerm: '',
      page: 1,
      pageSize: 1000,
      advancedSearch: 'false',
    });

  // Obtener los inventarios frescos que coincidan con los seleccionados
  const freshSelectedInventories = useMemo(() => {
    if (!freshInventoriesData?.data) return selectedInventories;

    const freshData = freshInventoriesData.data;
    return selectedInventories.map((selected) => {
      const fresh = freshData.find((inv) => inv.id === selected.id);
      return fresh || selected;
    });
  }, [freshInventoriesData, selectedInventories]);

  // Refrescar inventarios cuando se abre el modal
  useEffect(() => {
    if (isCartOpen) {
      refetchInventories();
    }
  }, [isCartOpen, refetchInventories]);

  // Opciones para los selects
  const invoiceOptions = invoices.map((inv) => ({
    value: inv.id,
    label: `${inv.code} - ${inv.supplier?.name || 'Sin proveedor'}`,
  }));

  const purchaseOrderOptions = purchaseOrders.map((po) => ({
    value: po.id,
    label: `${po.code} - ${po.project?.name || 'Sin proyecto'}`,
  }));

  // Clasificar inventarios según disponibilidad - USAR DATOS FRESCOS
  const classifiedInventories = useMemo(() => {
    const currentId =
      activeTab === 'invoice' ? selectedInvoiceId : selectedPurchaseOrderId;

    return freshSelectedInventories.map((inventory) => {
      let status = 'available';
      let message = 'Disponible para asignación';

      if (activeTab === 'invoice') {
        if (inventory.invoiceId) {
          if (inventory.invoiceId === currentId) {
            status = 'already-assigned';
            message = 'Ya está asignado a esta factura';
          } else {
            status = 'unavailable';
            message = `Ya tiene factura asignada: ${inventory.invoice?.code || 'N/A'}`;
          }
        }
      } else {
        if (inventory.purchaseOrderId) {
          if (inventory.purchaseOrderId === currentId) {
            status = 'already-assigned';
            message = 'Ya está asignado a esta orden de compra';
          } else {
            status = 'unavailable';
            message = `Ya tiene orden de compra asignada: ${inventory.purchaseOrder?.code || 'N/A'}`;
          }
        }
      }

      return {
        ...inventory,
        assignmentStatus: status,
        assignmentMessage: message,
      };
    });
  }, [
    freshSelectedInventories,
    activeTab,
    selectedInvoiceId,
    selectedPurchaseOrderId,
  ]);

  const availableInventories = classifiedInventories.filter(
    (inv) => inv.assignmentStatus === 'available',
  );
  const unavailableInventories = classifiedInventories.filter(
    (inv) => inv.assignmentStatus === 'unavailable',
  );
  const alreadyAssignedInventories = classifiedInventories.filter(
    (inv) => inv.assignmentStatus === 'already-assigned',
  );

  // Handlers
  const handleAssignInvoice = async () => {
    if (!selectedInvoiceId) {
      Notifies('warning', 'Selecciona una factura');
      return;
    }

    if (availableInventories.length === 0) {
      Notifies('warning', 'No hay inventarios disponibles para asignar');
      return;
    }

    try {
      const inventoryIds = availableInventories.map((inv) => inv.id);

      // Asignar inventarios
      await assignToInvoiceMutation.mutateAsync(inventoryIds);

      // Invalidar queries - React Query se encarga del resto
      await queryClient.invalidateQueries({ queryKey: ['search-inventories'] });
      await queryClient.invalidateQueries({ queryKey: ['inventories'] });

      // Refetch para obtener datos frescos INMEDIATAMENTE
      await refetchInventories();

      Notifies(
        'success',
        `✅ ${inventoryIds.length} inventario${inventoryIds.length > 1 ? 's' : ''} asignado${inventoryIds.length > 1 ? 's' : ''} a la factura exitosamente`,
      );

      // No limpiar la selección, solo actualizar el estado
      setSelectedInvoiceId(null);
    } catch (error) {
      console.error('Error asignando inventarios a factura:', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al asignar inventarios',
      );
    }
  };

  const handleAssignPurchaseOrder = async () => {
    if (!selectedPurchaseOrderId) {
      Notifies('warning', 'Selecciona una orden de compra');
      return;
    }

    if (availableInventories.length === 0) {
      Notifies('warning', 'No hay inventarios disponibles para asignar');
      return;
    }

    try {
      const inventoryIds = availableInventories.map((inv) => inv.id);

      // Asignar inventarios
      await assignToPurchaseOrderMutation.mutateAsync(inventoryIds);

      // Invalidar queries - React Query se encarga del resto
      await queryClient.invalidateQueries({ queryKey: ['search-inventories'] });
      await queryClient.invalidateQueries({ queryKey: ['inventories'] });

      // Refetch para obtener datos frescos INMEDIATAMENTE
      await refetchInventories();

      Notifies(
        'success',
        `✅ ${inventoryIds.length} inventario${inventoryIds.length > 1 ? 's' : ''} asignado${inventoryIds.length > 1 ? 's' : ''} a la orden de compra exitosamente`,
      );

      // No limpiar la selección, solo actualizar el estado
      setSelectedPurchaseOrderId(null);
    } catch (error) {
      console.error('Error asignando inventarios a orden de compra:', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al asignar inventarios',
      );
    }
  };

  const handleClearAll = () => {
    setShowConfirmClear(true);
  };

  const confirmClearSelection = () => {
    clearSelection();
    closeCart();
    setShowConfirmClear(false);
  };

  // Función para crear nueva factura
  const handleCreateInvoice = async (inputData) => {
    try {
      // Extraer el código del input (puede venir como string o como objeto {name: "..."})
      const code = typeof inputData === 'string' ? inputData : inputData?.name;

      // Crear FormData para la factura
      const formData = new FormData();
      formData.append('code', code);
      formData.append('concept', `Factura ${code}`);

      const newInvoice = await createInvoiceMutation.mutateAsync(formData);

      Notifies('success', `Factura "${newInvoice.code}" creada exitosamente`);

      // Seleccionar automáticamente la factura recién creada
      setSelectedInvoiceId(newInvoice.id);

      return newInvoice;
    } catch (error) {
      console.error('Error creando factura:', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al crear la factura',
      );
      throw error;
    }
  };

  // Función para crear nueva orden de compra
  const handleCreatePurchaseOrder = async (inputData) => {
    try {
      // Extraer el código del input (puede venir como string o como objeto {name: "..."})
      const code = typeof inputData === 'string' ? inputData : inputData?.name;

      const data = {
        code: code,
        description: `Orden de Compra ${code}`,
      };

      const newPurchaseOrder =
        await createPurchaseOrderMutation.mutateAsync(data);

      Notifies(
        'success',
        `Orden de compra "${newPurchaseOrder.code}" creada exitosamente`,
      );

      // Seleccionar automáticamente la orden recién creada
      setSelectedPurchaseOrderId(newPurchaseOrder.id);

      return newPurchaseOrder;
    } catch (error) {
      console.error('Error creando orden de compra:', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al crear la orden de compra',
      );
      throw error;
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      key: 'remove',
      title: '',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => toggleInventory(row)}
          className="p-1 hover:bg-red-100 rounded-full transition-colors"
          title="Remover de la selección"
        >
          <FaTimes className="hover:text-red-600 w-4 h-4" />
        </button>
      ),
    },
    {
      key: 'model.name',
      title: 'Modelo',
      sortable: false,
      render: (_, row) => (
        <ActionButtons
          extraActions={[
            {
              label:
                row.model?.brand?.name +
                ' ' +
                (row.model?.name || 'Sin modelo'),
              href: `/inventories/view/${row.id}`,
              color: 'purple',
              className:
                'text-sm font-medium hover:underline border-0 text-nowrap',
              filled: false,
              outline: true,
            },
          ]}
        />
      ),
    },
    {
      key: 'model.type.name',
      title: 'Tipo',
      sortable: false,
      render: (_, row) => row.model?.type?.name || '-',
    },
    {
      key: 'status',
      title: 'Estado',
      sortable: false,
      render: (val) => (
        <span
          className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
            val === 'ALTA'
              ? 'bg-green-600'
              : val === 'BAJA'
                ? 'bg-red-600'
                : 'bg-yellow-600'
          }`}
        >
          {val === 'PROPUESTA' ? 'PROP. BAJA' : val}
        </span>
      ),
    },
    {
      key: 'serialNumber',
      title: 'Serial',
      sortable: false,
      render: (val) => val || 'N/A',
    },
    {
      key: 'activeNumber',
      title: 'Activo',
      sortable: false,
      render: (val) => <span className="text-nowrap">{val || 'N/A'}</span>,
    },
    {
      key: 'purchaseOrder.code',
      title: 'O.C.',
      sortable: false,
      render: (_, row) => (
        <span className="text-nowrap">{row.purchaseOrder?.code || '-'}</span>
      ),
    },
    {
      key: 'invoice.code',
      title: 'Factura',
      sortable: false,
      render: (_, row) => (
        <span className="text-nowrap">{row.invoice?.code || '-'}</span>
      ),
    },
  ];

  return (
    <SideModal
      isOpen={isCartOpen}
      onClose={closeCart}
      title="Asignación Masiva de Inventarios"
      icon={MdInventory}
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Header Info */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <MdInventory className="text-xl text-purple-600" />
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  {selectedInventories.length}{' '}
                  {selectedInventories.length === 1
                    ? 'Inventario Seleccionado'
                    : 'Inventarios Seleccionados'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {availableInventories.length} disponibles |{' '}
                  {unavailableInventories.length} no disponibles
                </p>
              </div>
            </div>
            <ActionButtons
              extraActions={[
                {
                  label: 'Limpiar',
                  icon: FaTimes,
                  action: handleClearAll,
                  color: 'red',
                  filled: true,
                },
              ]}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('invoice')}
              className={classNames(
                'px-4 py-2 font-medium transition-colors border-b-2 text-sm',
                activeTab === 'invoice'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800',
              )}
            >
              <div className="flex items-center gap-2">
                <FaFileInvoice />
                <span>Facturas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('purchaseOrder')}
              className={classNames(
                'px-4 py-2 font-medium transition-colors border-b-2 text-sm',
                activeTab === 'purchaseOrder'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800',
              )}
            >
              <div className="flex items-center gap-2">
                <FaClipboardList />
                <span>Ordenes de Compra</span>
              </div>
            </button>
          </div>
        </div>

        {/* Formulario de Asignación */}
        <div className="space-y-3">
          {activeTab === 'invoice' ? (
            <Formik
              initialValues={{ invoiceId: selectedInvoiceId || '' }}
              onSubmit={handleAssignInvoice}
            >
              {({ setFieldValue, values }) => (
                <Form className="space-y-3 w-full flex flex-col md:flex-row gap-2">
                  <div className="w-full">
                    <Field
                      name="invoiceId"
                      component={SimpleSearchSelectInput}
                      options={invoiceOptions}
                      placeholder="Buscar o crear factura..."
                      label="Seleccionar Factura"
                      isClearable
                      onSelect={(value) => setSelectedInvoiceId(value)}
                      createOption={handleCreateInvoice}
                    />
                  </div>
                  <div className="flex items-end text-nowrap">
                    <ActionButtons
                      extraActions={[
                        {
                          label: 'Asignar Factura',
                          icon: FaFileInvoice,
                          action: handleAssignInvoice,
                          color: 'purple',
                          filled: true,
                          disabled:
                            !selectedInvoiceId ||
                            availableInventories.length === 0 ||
                            assignToInvoiceMutation.isPending,
                          type: 'button',
                        },
                      ]}
                    />
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{ purchaseOrderId: selectedPurchaseOrderId || '' }}
              onSubmit={handleAssignPurchaseOrder}
            >
              {({ setFieldValue, values }) => (
                <Form className="space-y-3 w-full flex flex-col md:flex-row gap-2">
                  <div className="w-full">
                    <Field
                      name="purchaseOrderId"
                      component={SimpleSearchSelectInput}
                      options={purchaseOrderOptions}
                      placeholder="Buscar o crear orden de compra..."
                      label="Seleccionar Orden de Compra"
                      isClearable
                      onSelect={(value) => setSelectedPurchaseOrderId(value)}
                      createOption={handleCreatePurchaseOrder}
                    />
                  </div>
                  <div className="flex items-end text-nowrap">
                    <ActionButtons
                      extraActions={[
                        {
                          label: 'Asignar Orden de Compra',
                          icon: FaClipboardList,
                          action: handleAssignPurchaseOrder,
                          color: 'purple',
                          filled: true,
                          disabled:
                            !selectedPurchaseOrderId ||
                            availableInventories.length === 0 ||
                            assignToPurchaseOrderMutation.isPending,
                          type: 'button',
                        },
                      ]}
                    />
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>

        {/* Tablas de Inventarios */}
        <div className="space-y-4">
          {/* Inventarios Disponibles */}
          {availableInventories.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2 text-sm">
                <MdCheckCircle />
                Disponibles ({availableInventories.length})
              </h3>
              <ReusableTable
                columns={columns}
                data={availableInventories}
                showPagination={false}
                striped
                rowClassName={() =>
                  'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
                }
              />
            </div>
          )}

          {/* Inventarios No Disponibles */}
          {unavailableInventories.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2 text-sm">
                <MdWarning />
                No Disponibles ({unavailableInventories.length})
              </h3>
              <ReusableTable
                columns={columns}
                data={unavailableInventories}
                showPagination={false}
                striped
                rowClassName={() =>
                  'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                }
              />
            </div>
          )}

          {/* Inventarios Ya Asignados */}
          {alreadyAssignedInventories.length > 0 && (
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                <MdCheckCircle />
                Ya Asignados ({alreadyAssignedInventories.length})
              </h3>
              <ReusableTable
                columns={columns}
                data={alreadyAssignedInventories}
                showPagination={false}
                striped
                rowClassName={() =>
                  'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación para Limpiar Selección */}
      <ConfirmModal
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={confirmClearSelection}
        title="Limpiar Selección"
        message="¿Estás seguro de que deseas limpiar toda la selección de inventarios?"
        confirmText="Sí, limpiar"
        cancelText="Cancelar"
        confirmColor="red"
      />
    </SideModal>
  );
};

export default InventoryAssignmentModal;
