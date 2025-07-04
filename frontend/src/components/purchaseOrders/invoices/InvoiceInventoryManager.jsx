// File: frontend/src/components/purchaseOrders/invoices/InvoiceInventoryManager.jsx
import React, { useState } from 'react';
import { FaSearch, FaEye } from 'react-icons/fa';
import ReusableTable from '../../Table/ReusableTable';
import {
  useInvoiceInventories,
  useAssignInventoriesToInvoice,
  useRemoveInventoryFromInvoice,
} from '../../../hooks/useInvoices';
import Notifies from '../../Notifies/Notifies';
import InventorySearchInput from '../../InventoryComponents/InventorySearchInput';
import { MdRemoveCircle } from 'react-icons/md';

const InvoiceInventoryManager = ({ orderId, invoiceId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const { data: inventories = [], isLoading } = useInvoiceInventories(
    orderId,
    invoiceId,
  );
  const assignMutation = useAssignInventoriesToInvoice(orderId, invoiceId);
  const removeMutation = useRemoveInventoryFromInvoice(orderId, invoiceId);

  const columns = [
    {
      key: 'model.name',
      title: 'Modelo',
      render: (_, row) => row.model?.name || '—',
    },
    {
      key: 'model.brand.name',
      title: 'Marca',
      render: (_, row) => row.model?.brand?.name || '—',
    },
    {
      key: 'model.type.name',
      title: 'Tipo',
      render: (_, row) => row.model?.type?.name || '—',
    },
    {
      key: 'serialNumber',
      title: 'N° Serie',
    },
    {
      key: 'activeNumber',
      title: 'N° Activo',
    },
    {
      key: 'actions',
      title: 'Acciones',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Buscador de inventarios */}
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">
          Buscar inventarios para asignar a la factura:
        </label>
        <InventorySearchInput
          onSelect={async (inv) => {
            try {
              await assignMutation.mutateAsync([inv.id]);
              Notifies('success', 'Inventario asignado correctamente');
            } catch {
              Notifies('error', 'No se pudo asignar el inventario');
            }
          }}
        />
      </div>

      {/* Tabla de inventarios asignados */}
      <ReusableTable
        columns={columns}
        data={inventories}
        loading={isLoading}
        rowActions={(inv) => [
          {
            key: 'main',
            icon: FaEye,
            label: 'Ver',
            action: () =>
              (window.location.href = `/inventories/view/${inv.id}`),
          },
          {
            key: 'remove',
            icon: MdRemoveCircle,
            label: 'Remover de factura',
            action: async () => {
              try {
                await removeMutation.mutateAsync(inv.id);
                Notifies('success', 'Inventario removido correctamente');
              } catch {
                Notifies('error', 'No se pudo eliminar el inventario');
              }
            },
          },
        ]}
        rowKey="id"
        enableCardView={false}
        showPagination={false}
      />
    </div>
  );
};

export default InvoiceInventoryManager;
