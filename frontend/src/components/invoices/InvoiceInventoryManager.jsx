// components/invoices/InvoiceInventoryManager.jsx
import React, { useState } from 'react';
import { Button, Badge, Alert } from 'flowbite-react';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import {
  useIndependentInvoiceInventories,
  useAssignInventoriesToIndependentInvoice,
  useRemoveInventoryFromIndependentInvoice,
} from '../../hooks/useInvoices';
import { useSearchInventories } from '../../hooks/useSearchInventories';
import { parseToLocalDate } from '../../utils/formatValues';

const InvoiceInventoryManager = ({ invoice, isIndependent = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInventorySearch, setShowInventorySearch] = useState(false);

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
    // Excluir inventarios ya asignados a esta factura
    excludeInvoiceId: invoice?.id,
  });

  const availableInventories = searchResults?.data || [];

  const handleAssignInventory = async (inventoryId) => {
    try {
      await assignInventories.mutateAsync([inventoryId]);
      setSearchTerm('');
      setShowInventorySearch(false);
    } catch (error) {
      console.error('Error assigning inventory:', error);
    }
  };

  const handleRemoveInventory = async (inventoryId) => {
    if (
      window.confirm('¿Estás seguro de que deseas desasignar este inventario?')
    ) {
      try {
        await removeInventory.mutateAsync(inventoryId);
      } catch (error) {
        console.error('Error removing inventory:', error);
      }
    }
  };

  if (!invoice) {
    return <div className="text-center py-8">No hay factura seleccionada</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MdInventory className="text-purple-600" />
          Gestión de Inventarios
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Factura: <strong>{invoice.code}</strong> - {invoice.concept}
        </p>
      </div>

      {/* Inventarios asignados */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">
            Inventarios Asignados ({assignedInventories.length})
          </h4>
          <Button
            size="sm"
            color="purple"
            onClick={() => setShowInventorySearch(!showInventorySearch)}
          >
            <FaPlus className="mr-2" />
            Asignar Inventario
          </Button>
        </div>

        {loadingAssigned ? (
          <div className="text-center py-4">
            Cargando inventarios asignados...
          </div>
        ) : assignedInventories.length === 0 ? (
          <Alert color="info">
            <span>No hay inventarios asignados a esta factura.</span>
          </Alert>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {assignedInventories.map((inventory) => (
              <div
                key={inventory.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="font-medium">{inventory.model?.name}</div>
                  <div className="text-sm text-gray-600">
                    Serial: {inventory.serialNumber || 'N/A'} | Activo:{' '}
                    {inventory.activeNumber || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Folio: {inventory.internalFolio}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    color={inventory.status === 'ALTA' ? 'success' : 'warning'}
                  >
                    {inventory.status}
                  </Badge>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleRemoveInventory(inventory.id)}
                    disabled={removeInventory.isLoading}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Búsqueda y asignación de inventarios */}
      {showInventorySearch && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Buscar Inventarios Disponibles</h4>

          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por modelo, serial, activo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-300 rounded-md w-full"
            />
          </div>

          {searching ? (
            <div className="text-center py-4">Buscando inventarios...</div>
          ) : searchTerm.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableInventories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No se encontraron inventarios disponibles
                </div>
              ) : (
                availableInventories.map((inventory) => (
                  <div
                    key={inventory.id}
                    className="flex items-center justify-between p-3 bg-white rounded border hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{inventory.model?.name}</div>
                      <div className="text-sm text-gray-600">
                        Serial: {inventory.serialNumber || 'N/A'} | Activo:{' '}
                        {inventory.activeNumber || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Folio: {inventory.internalFolio} | Creado:{' '}
                        {parseToLocalDate(inventory.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        color={
                          inventory.status === 'ALTA' ? 'success' : 'warning'
                        }
                      >
                        {inventory.status}
                      </Badge>
                      <Button
                        size="xs"
                        color="purple"
                        onClick={() => handleAssignInventory(inventory.id)}
                        disabled={assignInventories.isLoading}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Escribe para buscar inventarios disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceInventoryManager;
