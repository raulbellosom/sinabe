// pages/invoices/InvoicesPage.jsx - INDEPENDIENTE
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaFileInvoice,
  FaFilePdf,
  FaFileCode,
  FaExternalLinkAlt,
  FaClipboardList,
} from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import {
  useSearchAllInvoices,
  useDeleteIndependentInvoice,
  useRemoveInvoiceFromPurchaseOrder,
} from '../../hooks/useInvoices';
import ReusableTable from '../../components/Table/ReusableTable';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import SideModal from '../../components/Modals/SideModal';
import ReusableModal from '../../components/Modals/ReusableModal';
import InvoiceInventoryManager from '../../components/invoices/InvoiceInventoryManager';
import AssignToPurchaseOrderModal from '../../components/invoices/AssignToPurchaseOrderModal';
import { parseToLocalDate } from '../../utils/formatValues';
import { Badge } from 'flowbite-react';
import { getFileUrl } from '../../utils/getFileUrl';
import { useProjectQueryParams } from '../../hooks/useProjectQueryParams';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados del componente
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isAssignToPOModalOpen, setIsAssignToPOModalOpen] = useState(false);
  const [isUnassignPOModalOpen, setIsUnassignPOModalOpen] = useState(false);
  const [poCodeConfirmation, setPoCodeConfirmation] = useState('');

  // Leer parámetros de búsqueda de URL
  const urlSearch = searchParams.get('search') || '';
  const { query, updateParams } = useProjectQueryParams();

  // Si hay un parámetro de búsqueda en URL, usarlo
  const searchQuery = useMemo(
    () => ({
      ...query,
      searchTerm: urlSearch || query.searchTerm,
    }),
    [query, urlSearch],
  );

  // Query para todas las facturas (independientes + con OC)
  const { data = {}, isLoading } = useSearchAllInvoices(searchQuery);

  const invoices = data.data || [];
  const pagination = data.pagination || {
    currentPage: 1,
    pageSize: query.pageSize,
    totalPages: 1,
    totalRecords: 0,
  };

  const deleteInvoice = useDeleteIndependentInvoice();
  const removeInvoiceFromPO = useRemoveInvoiceFromPurchaseOrder();

  // Handlers para búsqueda y navegación
  const handleSearch = (term) => {
    // Limpiar parámetro de URL si existe
    if (urlSearch) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams);
    }
    // Actualizar búsqueda normal
    updateParams({ searchTerm: term, page: 1 });
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      await deleteInvoice.mutateAsync(selectedInvoice.id);
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleManageInventories = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInventoryModalOpen(true);
  };

  const handleAssignToPurchaseOrder = (invoice) => {
    setSelectedInvoice(invoice);
    setIsAssignToPOModalOpen(true);
  };

  const handleUnassignFromPurchaseOrder = (invoice) => {
    setSelectedInvoice(invoice);
    setPoCodeConfirmation('');
    setIsUnassignPOModalOpen(true);
  };

  const handleConfirmUnassignPO = async () => {
    if (!selectedInvoice || !selectedInvoice.purchaseOrder) return;

    // Validar que el código de OC coincida
    if (poCodeConfirmation !== selectedInvoice.purchaseOrder.code) {
      return; // No hacer nada si no coincide
    }

    try {
      await removeInvoiceFromPO.mutateAsync(selectedInvoice.id);
      setIsUnassignPOModalOpen(false);
      setSelectedInvoice(null);
      setPoCodeConfirmation('');
    } catch (error) {
      console.error('Error unassigning invoice from purchase order:', error);
    }
  };

  // Navegación cruzada a Purchase Orders
  const navigateToPurchaseOrder = (purchaseOrderCode) => {
    navigate(
      `/purchase-orders?search=${encodeURIComponent(purchaseOrderCode)}`,
    );
  };

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        key: 'code',
        title: 'Código',
        sortable: true,
        render: (code) => (
          <span className="text-nowrap font-semibold">{code}</span>
        ),
      },
      {
        key: 'concept',
        title: 'Concepto',
        sortable: true,
        render: (value) => (
          <div className="max-w-xs truncate" title={value}>
            {value}
          </div>
        ),
      },
      {
        key: 'supplier',
        title: 'Proveedor',
        sortable: false,
        render: (value) =>
          value ? (
            <div className="max-w-xs truncate" title={value}>
              {value}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          ),
      },
      {
        key: 'purchaseOrder',
        title: 'Orden de Compra',
        sortable: false,
        render: (_, invoice) =>
          invoice.purchaseOrder ? (
            <button
              onClick={() =>
                navigateToPurchaseOrder(invoice.purchaseOrder.code)
              }
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm font-medium whitespace-nowrap"
            >
              <FaExternalLinkAlt size={12} />
              {invoice.purchaseOrder.code}
            </button>
          ) : (
            <Badge color="gray">Independiente</Badge>
          ),
      },
      {
        key: 'inventories',
        title: 'Inventarios',
        sortable: false,
        render: (_, invoice) => {
          const inventoryCount = invoice.inventories?.length || 0;
          return inventoryCount > 0 ? (
            <button
              onClick={() =>
                navigate(
                  `/inventories?invoiceCode=${encodeURIComponent(invoice.code)}`,
                )
              }
              className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline transition-colors text-sm font-medium"
            >
              <MdInventory size={14} />
              {inventoryCount}
            </button>
          ) : (
            <Badge color="gray">0</Badge>
          );
        },
      },
      {
        key: 'fileUrl',
        title: 'PDF',
        sortable: false,
        render: (fileUrl) =>
          fileUrl ? (
            <a
              href={getFileUrl(fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800"
            >
              <FaFilePdf size={16} />
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        key: 'xmlUrl',
        title: 'XML',
        sortable: false,
        render: (xmlUrl) =>
          xmlUrl ? (
            <a
              href={getFileUrl(xmlUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800"
            >
              <FaFileCode size={16} />
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        key: 'createdAt',
        title: 'Fecha creación',
        sortable: true,
        render: (createdAt) => parseToLocalDate(createdAt, 'es-MX'),
      },
      { key: 'actions', title: 'Acciones' },
    ],
    [navigate],
  );

  return (
    <section className="space-y-4 bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-sinabe-primary flex items-center gap-2">
          <span>
            <FaFileInvoice />
          </span>
          Facturas
        </h1>
        <div>
          <ActionButtons
            extraActions={[
              {
                label: 'Nueva Factura',
                icon: FaFileInvoice,
                action: () => {
                  setSelectedInvoice(null);
                  setIsModalOpen(true);
                },
              },
            ]}
          />
        </div>
      </div>

      {/* 🔎 Input de búsqueda */}
      <div className="relative max-w-md">
        <input
          type="search"
          value={urlSearch || query.searchTerm || ''}
          onChange={(e) => {
            const value = e.target.value;
            // Limpiar parámetro de URL si existe
            if (urlSearch) {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('search');
              setSearchParams(newParams);
            }
            // Actualizar búsqueda normal
            updateParams({ searchTerm: value, page: 1 });
          }}
          placeholder="Buscar facturas, concepto, código..."
          className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring focus:border-blue-500"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <ReusableTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        enableCardView={false}
        striped={true}
        sortConfig={{ key: query.sortBy, direction: query.order }}
        onSort={(key) =>
          updateParams({
            sortBy: key,
            order: query.order === 'asc' ? 'desc' : 'asc',
          })
        }
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalPages: pagination.totalPages,
          totalRecords: pagination.totalRecords,
        }}
        onPageChange={(page) => updateParams({ page })}
        onPageSizeChange={(size) => updateParams({ pageSize: size })}
        emptyMessage="No hay facturas registradas"
        rowActions={(invoice) => [
          {
            key: 'inventory',
            icon: MdInventory,
            label: 'Gestionar inventarios',
            action: () => handleManageInventories(invoice),
          },
          // Solo mostrar "Asignar a OC" si la factura no tiene purchaseOrderId
          ...(invoice.purchaseOrderId
            ? [
                {
                  key: 'unassign-po',
                  icon: FaClipboardList,
                  label: 'Desasignar de OC',
                  action: () => handleUnassignFromPurchaseOrder(invoice),
                },
              ]
            : [
                {
                  key: 'assign-po',
                  icon: FaClipboardList,
                  label: 'Asignar a OC',
                  action: () => handleAssignToPurchaseOrder(invoice),
                },
              ]),
          {
            key: 'edit',
            icon: FaEdit,
            label: 'Editar',
            action: () => handleEditInvoice(invoice),
          },
          {
            key: 'delete',
            icon: FaTrashAlt,
            label: 'Eliminar',
            action: () => {
              setSelectedInvoice(invoice);
              setIsDeleteModalOpen(true);
            },
          },
        ]}
      />

      {/* Modals */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        isIndependent={true}
      />

      <SideModal
        isOpen={isInventoryModalOpen}
        onClose={() => {
          setIsInventoryModalOpen(false);
          setSelectedInvoice(null);
        }}
        title={`Inventarios - ${selectedInvoice?.code}`}
        size="lg"
      >
        {selectedInvoice && (
          <InvoiceInventoryManager
            invoice={selectedInvoice}
            isIndependent={true}
          />
        )}
      </SideModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Eliminar Factura"
        message={`¿Estás seguro de que deseas eliminar la factura ${selectedInvoice?.code}?`}
        isLoading={deleteInvoice.isLoading}
      />

      <AssignToPurchaseOrderModal
        isOpen={isAssignToPOModalOpen}
        onClose={() => {
          setIsAssignToPOModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSuccess={() => {
          setIsAssignToPOModalOpen(false);
          setSelectedInvoice(null);
        }}
      />

      {/* Modal para desasignar OC con confirmación */}
      <ReusableModal
        isOpen={isUnassignPOModalOpen}
        onClose={() => {
          setIsUnassignPOModalOpen(false);
          setSelectedInvoice(null);
          setPoCodeConfirmation('');
        }}
        title="Desasignar de Orden de Compra"
        size="md"
        actions={[
          {
            label: 'Cancelar',
            action: () => {
              setIsUnassignPOModalOpen(false);
              setSelectedInvoice(null);
              setPoCodeConfirmation('');
            },
            color: 'gray',
            disabled: removeInvoiceFromPO.isPending,
          },
          {
            label: removeInvoiceFromPO.isPending
              ? 'Desasignando...'
              : 'Desasignar',
            action: handleConfirmUnassignPO,
            color: 'red',
            filled: true,
            disabled:
              poCodeConfirmation !== selectedInvoice?.purchaseOrder?.code ||
              removeInvoiceFromPO.isPending,
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Estás a punto de desasignar la factura{' '}
            <strong className="text-gray-900 dark:text-white">
              {selectedInvoice?.code}
            </strong>{' '}
            de la orden de compra{' '}
            <strong className="text-gray-900 dark:text-white">
              {selectedInvoice?.purchaseOrder?.code}
            </strong>
            .
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
            Para confirmar, escribe el código de la orden de compra:
          </p>
          <input
            type="text"
            value={poCodeConfirmation}
            onChange={(e) => setPoCodeConfirmation(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            placeholder={selectedInvoice?.purchaseOrder?.code}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            autoFocus
            autoComplete="off"
          />
          {poCodeConfirmation &&
            poCodeConfirmation !== selectedInvoice?.purchaseOrder?.code && (
              <p className="text-xs text-red-600 dark:text-red-400">
                El código no coincide. Verifica e intenta nuevamente.
              </p>
            )}
        </div>
      </ReusableModal>
    </section>
  );
};

export default InvoicesPage;
