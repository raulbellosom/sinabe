// components/purchaseOrders/invoices/PurchaseOrderInvoicesManager.jsx
import React, { useState } from 'react';
import { Button, Badge } from 'flowbite-react';
import {
  FaPlus,
  FaTrash,
  FaSearch,
  FaFilePdf,
  FaFileCode,
} from 'react-icons/fa';
import { FaFileInvoice } from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import {
  useGetInvoicesByOrderId,
  useAssignInvoiceToPurchaseOrder,
  useRemoveInvoiceFromPurchaseOrder,
  useSearchAllInvoices,
} from '../../../hooks/useInvoices';
import { getFileUrl } from '../../../utils/getFileUrl';
import Notifies from '../../Notifies/Notifies';

const PurchaseOrderInvoicesManager = ({ purchaseOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener facturas ya asignadas a esta OC
  const { data: assignedInvoices = [], isLoading: loadingAssigned } =
    useGetInvoicesByOrderId(purchaseOrder?.id);

  // Mutations
  const assignInvoice = useAssignInvoiceToPurchaseOrder();
  const removeInvoice = useRemoveInvoiceFromPurchaseOrder();

  // Búsqueda de facturas disponibles
  const { data: searchResults, isLoading: searching } = useSearchAllInvoices({
    searchTerm,
    pageSize: 20,
  });

  const allInvoices = searchResults?.data || [];

  // Filtrar facturas: separar disponibles de las ya asignadas
  const invoicesStatus = allInvoices.map((inv) => {
    const isAssignedToThis = assignedInvoices.some((a) => a.id === inv.id);
    const hasOtherPO =
      inv.purchaseOrderId && inv.purchaseOrderId !== purchaseOrder?.id;
    return {
      ...inv,
      isAssignedToThis,
      hasOtherPO,
      canAssign: !inv.purchaseOrderId, // Solo facturas sin OC pueden ser asignadas
    };
  });

  const handleAssignInvoice = async (invoiceId) => {
    try {
      await assignInvoice.mutateAsync({
        invoiceId,
        purchaseOrderId: purchaseOrder?.id,
      });
      setSearchTerm('');
      Notifies('success', 'Factura asignada correctamente');
    } catch (error) {
      console.error('Error assigning invoice:', error);
      Notifies(
        'error',
        error.response?.data?.error ||
          'Error al asignar factura a la orden de compra',
      );
    }
  };

  const handleRemoveInvoice = async (invoiceId) => {
    if (
      window.confirm('¿Estás seguro de que deseas desasignar esta factura?')
    ) {
      try {
        await removeInvoice.mutateAsync(invoiceId);
        Notifies('success', 'Factura desasignada correctamente');
      } catch (error) {
        console.error('Error removing invoice:', error);
        Notifies('error', 'Error al desasignar factura de la orden de compra');
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
      {/* Búsqueda de facturas - Siempre visible */}
      <div className="mb-4">
        <h4 className="font-medium text-sm mb-2">
          Buscar Facturas Disponibles
        </h4>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, concepto, proveedor..."
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
                Buscando facturas...
              </div>
            ) : invoicesStatus.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                No se encontraron facturas
              </div>
            ) : (
              <div className="divide-y">
                {invoicesStatus.map((invoice) => {
                  const alreadyAssigned = invoice.isAssignedToThis;
                  const hasOtherPO = invoice.hasOtherPO;
                  const inventoryCount = invoice.inventories?.length || 0;

                  return (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between p-2 ${
                        alreadyAssigned
                          ? 'bg-purple-50'
                          : hasOtherPO
                            ? 'bg-red-50'
                            : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {invoice.code}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {invoice.concept || 'Sin concepto'}
                        </div>
                        {invoice.supplier && (
                          <div className="text-xs text-gray-500">
                            Proveedor: {invoice.supplier}
                          </div>
                        )}
                        {inventoryCount > 0 && (
                          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <MdInventory size={12} />
                            {inventoryCount} inventario
                            {inventoryCount !== 1 ? 's' : ''}
                          </div>
                        )}
                        {/* Mostrar información de asignación */}
                        {alreadyAssigned && (
                          <div className="text-xs text-purple-700 font-medium mt-1">
                            ✓ Ya asignada a esta orden de compra
                          </div>
                        )}
                        {hasOtherPO && invoice.purchaseOrder && (
                          <div className="text-xs text-red-700 font-medium mt-1">
                            ⚠ Asignada a OC: {invoice.purchaseOrder.code}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {/* Archivos */}
                        <div className="flex items-center gap-1">
                          {invoice.fileUrl && (
                            <a
                              href={getFileUrl(invoice.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700"
                              title="Ver PDF"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaFilePdf size={14} />
                            </a>
                          )}
                          {invoice.xmlUrl && (
                            <a
                              href={getFileUrl(invoice.xmlUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                              title="Ver XML"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaFileCode size={14} />
                            </a>
                          )}
                        </div>
                        {/* Solo mostrar botón de agregar si está disponible */}
                        {!alreadyAssigned && invoice.canAssign && (
                          <Button
                            size="xs"
                            color="purple"
                            onClick={() => handleAssignInvoice(invoice.id)}
                            disabled={assignInvoice.isPending}
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

      {/* Facturas asignadas - Ocupa todo el espacio restante */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-sm">
            Facturas Asignadas ({assignedInvoices.length})
          </h4>
        </div>

        {loadingAssigned ? (
          <div className="text-center py-8 text-gray-500">
            Cargando facturas asignadas...
          </div>
        ) : assignedInvoices.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center py-8">
              <FaFileInvoice className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No hay facturas asignadas</p>
              <p className="text-gray-400 text-xs mt-1">
                Busca y asigna facturas usando el campo de arriba
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto border rounded-lg divide-y">
            {assignedInvoices.map((invoice) => {
              const inventoryCount = invoice.inventories?.length || 0;

              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{invoice.code}</div>
                      {inventoryCount > 0 && (
                        <Badge color="success" size="xs">
                          {inventoryCount} inv.
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {invoice.concept || 'Sin concepto'}
                    </div>
                    {invoice.supplier && (
                      <div className="text-xs text-gray-500">
                        Proveedor: {invoice.supplier}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {/* Archivos */}
                    <div className="flex items-center gap-2">
                      {invoice.fileUrl && (
                        <a
                          href={getFileUrl(invoice.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700"
                          title="Ver PDF"
                        >
                          <FaFilePdf />
                        </a>
                      )}
                      {invoice.xmlUrl && (
                        <a
                          href={getFileUrl(invoice.xmlUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                          title="Ver XML"
                        >
                          <FaFileCode />
                        </a>
                      )}
                    </div>
                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleRemoveInvoice(invoice.id)}
                      disabled={removeInvoice.isPending}
                    >
                      <FaTrash />
                    </Button>
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

export default PurchaseOrderInvoicesManager;
