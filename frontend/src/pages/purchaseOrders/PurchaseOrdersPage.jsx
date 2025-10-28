// pages/PurchaseOrdersPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaFileInvoice,
  FaTrashAlt,
  FaEdit,
  FaSearch,
  FaClipboardList,
  FaExternalLinkAlt,
  FaEye,
} from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import ReusableTable from '../../components/Table/ReusableTable';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import {
  useSearchPurchaseOrders,
  useDeletePurchaseOrder,
} from '../../hooks/usePurchaseOrders';
import { PurchaseOrderFormModal } from '../../components/ProjectDetails/PO/PurchaseOrderModals';
import { parseToLocalDate } from '../../utils/formatValues';
import { useProjectQueryParams } from '../../hooks/useProjectQueryParams';
import { Badge } from 'flowbite-react';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import PurchaseOrderDetailModal from '../../components/purchaseOrders/PurchaseOrderDetailModal';
import Notifies from '../../components/Notifies/Notifies';

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const { data = [], isLoading } = useSearchPurchaseOrders(null, searchQuery);
  const orders = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    pageSize: query.pageSize,
    totalPages: 1,
    totalRecords: 0,
  };

  const deletePO = useDeletePurchaseOrder();

  // Función para manejar la eliminación de OC
  const handleDeletePO = async () => {
    if (!selectedOrder) return;

    try {
      await deletePO.mutateAsync(selectedOrder.id);
      Notifies('success', 'Orden de compra eliminada exitosamente');
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error eliminando orden de compra:', error);
      Notifies('error', 'Error eliminando la orden de compra');
    }
  };

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
        key: 'supplier',
        title: 'Proveedor',
        sortable: true,
        render: (supplier) =>
          supplier || <span className="text-gray-400 italic">—</span>,
      },
      {
        key: 'description',
        title: 'Descripción',
        sortable: true,
        render: (description) =>
          description || <span className="text-gray-400 italic">—</span>,
      },
      {
        key: 'invoices',
        title: 'Facturas',
        render: (_, row) => {
          const invoiceCount = row.invoices?.length || 0;
          return invoiceCount > 0 ? (
            <button
              onClick={() =>
                navigate(`/invoices?search=${encodeURIComponent(row.code)}`)
              }
              className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 hover:underline transition-colors text-sm font-medium whitespace-nowrap"
            >
              <FaExternalLinkAlt size={12} />
              {invoiceCount} Factura{invoiceCount !== 1 ? 's' : ''}
            </button>
          ) : (
            <Badge className="whitespace-nowrap" color="gray">
              0 Facturas
            </Badge>
          );
        },
      },
      {
        key: 'inventories',
        title: 'Inventarios',
        render: (_, row) => {
          const inventoryCount = row.inventories?.length || 0;
          return inventoryCount > 0 ? (
            <button
              onClick={() =>
                navigate(
                  `/inventories?purchaseOrderCode=${encodeURIComponent(row.code)}`,
                )
              }
              className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline transition-colors text-sm font-medium whitespace-nowrap"
            >
              <MdInventory size={14} />
              {inventoryCount} Inventario{inventoryCount !== 1 ? 's' : ''}
            </button>
          ) : (
            <Badge className="whitespace-nowrap" color="gray">
              0 Inventarios
            </Badge>
          );
        },
      },
      {
        key: 'createdAt',
        title: 'Fecha creación',
        sortable: true,
        render: (createdAt) => parseToLocalDate(createdAt, 'es-MX'),
      },
      { key: 'actions', title: 'Acciones' },
    ],
    [],
  );

  return (
    <section className="space-y-4 bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-sinabe-primary flex items-center gap-2">
          <span>
            <FaClipboardList />
          </span>
          Órdenes de Compra
        </h1>
        <div>
          <ActionButtons
            extraActions={[
              {
                label: 'Nueva OC',
                icon: FaFileInvoice,
                action: () => {
                  setSelectedOrder(null);
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
          placeholder="Buscar órdenes, proveedor, facturas..."
          className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring focus:border-blue-500"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <ReusableTable
        columns={columns}
        data={orders}
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
        rowActions={(order) => [
          {
            key: 'view',
            icon: FaEye,
            label: 'Ver detalles',
            action: () => {
              setSelectedOrder(order);
              setIsDetailModalOpen(true);
            },
          },
          {
            key: 'edit',
            icon: FaEdit,
            label: 'Editar',
            action: () => {
              setSelectedOrder(order);
              setIsModalOpen(true);
            },
          },
          {
            key: 'delete',
            icon: FaTrashAlt,
            label: 'Eliminar',
            action: () => {
              setSelectedOrder(order);
              setIsDeleteModalOpen(true);
            },
          },
        ]}
      />

      <PurchaseOrderFormModal
        projectId={null}
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeletePO}
        title="Eliminar Orden de Compra"
        message={`¿Estás seguro de que deseas eliminar la orden de compra ${selectedOrder?.code}? Esta acción no se puede deshacer.`}
        isLoading={deletePO.isLoading}
      />

      <PurchaseOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        purchaseOrder={selectedOrder}
        onEdit={(order) => {
          setSelectedOrder(order);
          setIsDetailModalOpen(false);
          setIsModalOpen(true);
        }}
      />
    </section>
  );
};

export default PurchaseOrdersPage;
