// components/invoices/InvoiceInventoryManager.jsx
import React, { useState } from 'react';
import { Badge } from 'flowbite-react';
import { FaSearch } from 'react-icons/fa';
import { MdInventory, MdLinkOff } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import {
  useIndependentInvoiceInventories,
  useAssignInventoriesToIndependentInvoice,
  useRemoveInventoryFromIndependentInvoice,
} from '../../hooks/useInvoices';
import { useSearchInventories } from '../../hooks/useSearchInventories';
import ConfirmUnassignModal from '../Modals/ConfirmUnassignModal';
import Notifies from '../Notifies/Notifies';
import ActionButtons from '../ActionButtons/ActionButtons';

const InvoiceInventoryManager = ({ invoice, isIndependent = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryToRemove, setInventoryToRemove] = useState(null);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);

  // Hooks para facturas independientes
  const { data: assignedInventories = [], isLoading: loadingAssigned } =
    useIndependentInvoiceInventories(invoice?.id);

  const assignInventories = useAssignInventoriesToIndependentInvoice(
    invoice?.id,
  );
  const removeInventory = useRemoveInventoryFromIndependentInvoice(invoice?.id);

  // Búsqueda de inventarios disponibles
  const { data: searchResults, isLoading: searching } = useSearchInventories({
    searchTerm,
    pageSize: 20,
  });

  const allInventories = searchResults?.data || [];

  // Filtrar inventarios: separar disponibles de los ya asignados
  const inventoriesStatus = allInventories.map((inv) => {
    const isAssignedToThis = assignedInventories.some((a) => a.id === inv.id);
    const hasOtherInvoice = inv.invoiceId && inv.invoiceId !== invoice?.id;
    return {
      ...inv,
      isAssignedToThis,
      hasOtherInvoice,
      canAssign: !inv.invoiceId || inv.invoiceId === invoice?.id,
    };
  });

  const handleAssignInventory = async (inventoryId) => {
    try {
      await assignInventories.mutateAsync([inventoryId]);
      setSearchTerm('');
      Notifies('success', 'Inventario asignado correctamente');
    } catch (error) {
      console.error('Error assigning inventory:', error);
      // Manejar errores específicos del backend
      if (error.response?.data?.conflicts) {
        const conflicts = error.response.data.conflicts.join(', ');
        Notifies('error', `No se puede asignar: ${conflicts}`);
      } else {
        Notifies(
          'error',
          error.response?.data?.error ||
            'Error al asignar inventario a la factura',
        );
      }
    }
  };

  const handleRemoveInventory = async (inventoryId) => {
    setInventoryToRemove(inventoryId);
    setIsUnassignModalOpen(true);
  };

  const confirmRemoveInventory = async () => {
    if (!inventoryToRemove) return;

    try {
      await removeInventory.mutateAsync(inventoryToRemove);
      Notifies('success', 'Inventario desasignado correctamente');
      setIsUnassignModalOpen(false);
      setInventoryToRemove(null);
    } catch (error) {
      console.error('Error removing inventory:', error);
      Notifies('error', 'Error al desasignar inventario de la factura');
    }
  };

  if (!invoice) {
    return <div className="text-center py-8">No hay factura seleccionada</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b pb-3 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MdInventory className="text-purple-600" />
          Gestión de Inventarios
        </h3>
        <div className="text-sm text-gray-600 mt-1">
          <p>
            Factura: <strong>{invoice?.code}</strong> - {invoice?.concept}
          </p>
          {invoice?.supplier && (
            <p className="text-gray-500">Proveedor: {invoice.supplier}</p>
          )}
        </div>
      </div>

      {/* Búsqueda de inventarios - Siempre visible */}
      <div className="mb-4">
        <h4 className="font-medium text-sm mb-2">
          Buscar Inventarios Disponibles
        </h4>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por modelo, serial, activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm.length > 0 && (
          <div className="mt-2 border rounded-lg max-h-64 overflow-y-auto bg-white">
            {searching ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Buscando inventarios...
              </div>
            ) : inventoriesStatus.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                No se encontraron inventarios
              </div>
            ) : (
              <div className="divide-y">
                {inventoriesStatus.map((inventory) => {
                  const alreadyAssigned = inventory.isAssignedToThis;
                  const hasOtherInvoice = inventory.hasOtherInvoice;

                  return (
                    <div
                      key={inventory.id}
                      className={`flex items-center justify-between p-2 ${
                        alreadyAssigned
                          ? 'bg-green-50'
                          : hasOtherInvoice
                            ? 'bg-red-50'
                            : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate flex items-center gap-2">
                          <Badge
                            color={
                              inventory.status === 'ALTA'
                                ? 'success'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {inventory.status}
                          </Badge>
                          {inventory.model?.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Serial: {inventory.serialNumber || 'N/A'} | Activo:{' '}
                          {inventory.activeNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Folio: {inventory.internalFolio}
                        </div>
                        {/* Mostrar información de asignación */}
                        {alreadyAssigned && (
                          <div className="text-xs text-green-700 font-medium mt-1">
                            ✓ Ya asignado a esta factura
                          </div>
                        )}
                        {hasOtherInvoice && inventory.invoice && (
                          <div className="text-xs text-red-700 font-medium mt-1">
                            ⚠ Asignado a: {inventory.invoice.code}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {/* Solo mostrar botón de agregar si NO está asignado a ninguna factura o si ya está en esta */}
                        {!alreadyAssigned && !hasOtherInvoice && (
                          <ActionButtons
                            extraActions={[
                              {
                                label: 'Asignar',
                                icon: FaPlus,
                                color: 'purple',
                                filled: true,
                                action: () =>
                                  handleAssignInventory(inventory.id),
                                disabled: assignInventories.isPending,
                              },
                            ]}
                          />
                        )}
                        {
                          // si el inventario esta asignado entonces que muestre un boton de eliminar siempre y cuando pertenezca a esta factura
                          alreadyAssigned && (
                            <ActionButtons
                              extraActions={[
                                {
                                  label: 'Desasignar',
                                  action: () =>
                                    handleRemoveInventory(inventory.id),
                                  icon: MdLinkOff,
                                  disabled: removeInventory.isPending,
                                  color: 'red',
                                  filled: true,
                                },
                              ]}
                            />
                          )
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inventarios asignados - Ocupa todo el espacio restante */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-sm">
            Inventarios Asignados ({assignedInventories.length})
          </h4>
        </div>

        {loadingAssigned ? (
          <div className="text-center py-8 text-gray-500">
            Cargando inventarios asignados...
          </div>
        ) : assignedInventories.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center py-8">
              <MdInventory className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">
                No hay inventarios asignados
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Busca y asigna inventarios usando el campo de arriba
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto border rounded-lg divide-y">
            {assignedInventories.map((inventory) => (
              <div
                key={inventory.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <Badge
                      color={
                        inventory.status === 'ALTA' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {inventory.status}
                    </Badge>
                    {inventory.model?.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Serial: {inventory.serialNumber || 'N/A'} | Activo:{' '}
                    {inventory.activeNumber || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Folio: {inventory.internalFolio}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <ActionButtons
                    extraActions={[
                      {
                        label: 'Desasignar',
                        icon: MdLinkOff,
                        color: 'red',
                        filled: true,
                        action: () => handleRemoveInventory(inventory.id),
                        disabled: removeInventory.isPending,
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para desasignar */}
      <ConfirmUnassignModal
        isOpen={isUnassignModalOpen}
        onClose={() => {
          setIsUnassignModalOpen(false);
          setInventoryToRemove(null);
        }}
        onConfirm={confirmRemoveInventory}
        sourceItem={
          assignedInventories.find((inv) => inv.id === inventoryToRemove)
            ?.serialNumber ||
          assignedInventories.find((inv) => inv.id === inventoryToRemove)
            ?.internalFolio ||
          'este inventario'
        }
        targetItem={invoice?.code}
        sourceLabel="inventario"
        targetLabel="factura"
        requireConfirmation={true}
      />
    </div>
  );
};

export default InvoiceInventoryManager;
