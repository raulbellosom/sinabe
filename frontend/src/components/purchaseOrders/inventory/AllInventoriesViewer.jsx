// components/purchaseOrders/inventory/AllInventoriesViewer.jsx
import React, { useState } from 'react';
import { Button, Badge } from 'flowbite-react';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useGetAllInventoriesByPurchaseOrder,
  useRemoveInventoryFromPurchaseOrder,
} from '../../../hooks/usePurchaseOrders';
import { assignInventoriesToPurchaseOrder } from '../../../services/purchaseOrders.api';
import { useSearchInventories } from '../../../hooks/useSearchInventories';
import Notifies from '../../Notifies/Notifies';

const AllInventoriesViewer = ({ purchaseOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Obtener inventarios ya asignados a esta OC
  const { data: inventoryData, isLoading: loadingAssigned } =
    useGetAllInventoriesByPurchaseOrder(purchaseOrder?.id);

  const assignedInventories = inventoryData?.inventories || [];

  // Mutations - usando useMutation directamente para evitar problemas de caché
  const assignInventories = useMutation({
    mutationFn: (inventoryIds) =>
      assignInventoriesToPurchaseOrder(purchaseOrder?.id, inventoryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-order-inventories', purchaseOrder?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['purchase-order-all-inventories', purchaseOrder?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    },
  });

  const removeInventory = useRemoveInventoryFromPurchaseOrder(
    purchaseOrder?.id,
  );

  // Búsqueda de inventarios disponibles
  const { data: searchResults, isLoading: searching } = useSearchInventories({
    searchTerm,
    pageSize: 20,
  });

  const allInventories = searchResults?.data || [];

  // Filtrar inventarios: separar disponibles de los ya asignados
  const inventoriesStatus = allInventories.map((inv) => {
    const isAssignedToThis = assignedInventories.some((a) => a.id === inv.id);
    const hasOtherPO =
      inv.purchaseOrderId && inv.purchaseOrderId !== purchaseOrder?.id;
    const hasInvoice = inv.invoiceId;
    return {
      ...inv,
      isAssignedToThis,
      hasOtherPO,
      hasInvoice,
      canAssign: !inv.purchaseOrderId && !inv.invoiceId,
    };
  });

  const handleAssignInventory = async (inventoryId) => {
    try {
      await assignInventories.mutateAsync([inventoryId]);
      setSearchTerm('');
      Notifies('success', 'Inventario asignado correctamente');
    } catch (error) {
      console.error('Error assigning inventory:', error);
      if (error.response?.data?.conflicts) {
        const conflicts = error.response.data.conflicts.join(', ');
        Notifies('error', `No se puede asignar: ${conflicts}`);
      } else {
        Notifies(
          'error',
          error.response?.data?.error ||
            'Error al asignar inventario a la orden de compra',
        );
      }
    }
  };

  const handleRemoveInventory = async (inventoryId) => {
    if (
      window.confirm('¿Estás seguro de que deseas desasignar este inventario?')
    ) {
      try {
        await removeInventory.mutateAsync(inventoryId);
        Notifies('success', 'Inventario desasignado correctamente');
      } catch (error) {
        console.error('Error removing inventory:', error);
        Notifies(
          'error',
          'Error al desasignar inventario de la orden de compra',
        );
      }
    }
  };

  if (!purchaseOrder) {
    return (
      <div className="text-center py-8">
        No hay orden de compra seleccionada
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
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
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  const hasOtherPO = inventory.hasOtherPO;
                  const hasInvoice = inventory.hasInvoice;

                  return (
                    <div
                      key={inventory.id}
                      className={`flex items-center justify-between p-2 ${
                        alreadyAssigned
                          ? 'bg-green-50'
                          : hasOtherPO || hasInvoice
                            ? 'bg-red-50'
                            : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
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
                            ✓ Ya asignado a esta orden de compra
                          </div>
                        )}
                        {hasOtherPO && inventory.purchaseOrder && (
                          <div className="text-xs text-red-700 font-medium mt-1">
                            ⚠ Asignado a OC: {inventory.purchaseOrder.code}
                          </div>
                        )}
                        {hasInvoice && inventory.invoice && (
                          <div className="text-xs text-red-700 font-medium mt-1">
                            ⚠ Asignado a Factura: {inventory.invoice.code}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge
                          color={
                            inventory.status === 'ALTA' ? 'success' : 'warning'
                          }
                          size="sm"
                        >
                          {inventory.status}
                        </Badge>
                        {/* Solo mostrar botón de agregar si está disponible */}
                        {!alreadyAssigned && inventory.canAssign && (
                          <Button
                            size="xs"
                            color="success"
                            onClick={() => handleAssignInventory(inventory.id)}
                            disabled={assignInventories.isPending}
                          >
                            <FaPlus />
                          </Button>
                        )}
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
            {assignedInventories.map((inventory) => {
              // Determinar el origen del inventario
              const isDirect = !inventory.invoiceId;

              return (
                <div
                  key={inventory.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">
                        {inventory.model?.name}
                      </div>
                      {!isDirect && inventory.invoice && (
                        <Badge color="purple" size="xs">
                          De Factura: {inventory.invoice.code}
                        </Badge>
                      )}
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
                    <Badge
                      color={
                        inventory.status === 'ALTA' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {inventory.status}
                    </Badge>
                    {/* Solo permitir remover inventarios directos */}
                    {isDirect && (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleRemoveInventory(inventory.id)}
                        disabled={removeInventory.isPending}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllInventoriesViewer;
