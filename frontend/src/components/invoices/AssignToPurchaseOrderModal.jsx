// components/invoices/AssignToPurchaseOrderModal.jsx
import React, { useState, useMemo } from 'react';
import { Modal, Button, Badge, TextInput } from 'flowbite-react';
import { FaSearch, FaTimes, FaClipboardList } from 'react-icons/fa';
import { useSearchPurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useAssignInvoiceToPurchaseOrder } from '../../hooks/useInvoices';
import { parseToLocalDate } from '../../utils/formatValues';
import Notifies from '../Notifies/Notifies';

const AssignToPurchaseOrderModal = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

  // Buscar órdenes de compra disponibles
  const searchQuery = useMemo(
    () => ({
      searchTerm,
      page: 1,
      pageSize: 20,
    }),
    [searchTerm],
  );

  const {
    data: purchaseOrdersData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchPurchaseOrders(null, searchQuery); // null = buscar en todas, no solo de un proyecto

  const assignInvoiceMutation = useAssignInvoiceToPurchaseOrder();

  const handleAssign = async () => {
    if (!selectedPurchaseOrder) return;

    try {
      await assignInvoiceMutation.mutateAsync({
        invoiceId: invoice.id,
        purchaseOrderId: selectedPurchaseOrder.id,
      });

      Notifies('success', 'Factura asignada a la orden de compra exitosamente');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning invoice to purchase order:', error);
      Notifies('error', 'Error al asignar la factura a la orden de compra');
    }
  };

  const availablePurchaseOrders = purchaseOrdersData?.data || [];

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <FaClipboardList className="text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Asignar a Orden de Compra</h3>
            <p className="text-sm text-gray-600">
              Factura: {invoice?.code} - {invoice?.concept}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <TextInput
              placeholder="Buscar órdenes de compra por código, proveedor o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de órdenes de compra */}
        <div className="max-h-96 overflow-y-auto">
          {searchLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                Buscando órdenes de compra...
              </p>
            </div>
          )}

          {searchError && (
            <div className="text-center py-4 text-red-600">
              Error al buscar órdenes de compra
            </div>
          )}

          {!searchLoading && availablePurchaseOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaClipboardList className="mx-auto text-4xl mb-2" />
              <p>No se encontraron órdenes de compra</p>
              <p className="text-sm">
                Intenta con diferentes términos de búsqueda
              </p>
            </div>
          )}

          {!searchLoading &&
            availablePurchaseOrders.map((purchaseOrder) => (
              <div
                key={purchaseOrder.id}
                className={`p-4 border rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedPurchaseOrder?.id === purchaseOrder.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPurchaseOrder(purchaseOrder)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {purchaseOrder.code}
                      </h4>
                      {purchaseOrder.projectId ? (
                        <Badge color="blue" size="sm">
                          Con Proyecto
                        </Badge>
                      ) : (
                        <Badge color="gray" size="sm">
                          Sin Proyecto
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Proveedor:</strong>{' '}
                      {purchaseOrder.supplier || 'No especificado'}
                    </p>

                    {purchaseOrder.description && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Descripción:</strong>{' '}
                        {purchaseOrder.description}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">
                      Creada: {parseToLocalDate(purchaseOrder.createdAt)}
                    </p>

                    {/* Mostrar información adicional */}
                    <div className="flex gap-2 mt-2">
                      {purchaseOrder.invoices &&
                        purchaseOrder.invoices.length > 0 && (
                          <Badge color="info" size="sm">
                            {purchaseOrder.invoices.length} factura(s)
                          </Badge>
                        )}
                      {purchaseOrder.inventories &&
                        purchaseOrder.inventories.length > 0 && (
                          <Badge color="success" size="sm">
                            {purchaseOrder.inventories.length} inventario(s)
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between w-full">
          <Button color="gray" onClick={onClose}>
            <FaTimes className="mr-2" />
            Cancelar
          </Button>

          <Button
            color="blue"
            onClick={handleAssign}
            disabled={!selectedPurchaseOrder || assignInvoiceMutation.isPending}
          >
            {assignInvoiceMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Asignando...
              </div>
            ) : (
              <>
                <FaClipboardList className="mr-2" />
                Asignar a OC
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignToPurchaseOrderModal;
