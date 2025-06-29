// pages/PurchaseOrdersPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileInvoice,
  FaTrashAlt,
  FaEdit,
  FaUnlink,
  FaSearch,
  FaClipboardList,
} from 'react-icons/fa';
import ReusableTable from '../../components/Table/ReusableTable';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import {
  useSearchPurchaseOrders,
  useDeletePurchaseOrder,
  useRemovePurchaseOrderFromProject,
} from '../../hooks/usePurchaseOrders';
import { PurchaseOrderFormModal } from '../../components/ProjectDetails/PO/PurchaseOrderModals';
import { parseToLocalDate } from '../../utils/formatValues';
import { useProjectQueryParams } from '../../hooks/useProjectQueryParams';
import { Badge } from 'flowbite-react';
import ConfirmRemovePurchaseOrderModal from '../../components/ProjectDetails/PO/ConfirmRemovePurchaseOrderModal';
import Notifies from '../../components/Notifies/Notifies';

const statusColors = {
  PLANIFICACION: 'gray',
  EN_EJECUCION: 'blue',
  EN_REVISION: 'yellow',
  FINALIZADO: 'green',
  CANCELADO: 'red',
};

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { query, updateParams } = useProjectQueryParams();
  const { data = [], isLoading } = useSearchPurchaseOrders(null, query);
  const orders = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0,
  };

  const deletePO = useDeletePurchaseOrder();
  const removePOFromProject = useRemovePurchaseOrderFromProject();

  // Función para manejar la remoción de OC del proyecto
  const handleRemovePOFromProject = async (order) => {
    if (!order.projectId) return;

    try {
      await removePOFromProject.mutateAsync({
        projectId: order.projectId,
        purchaseOrderId: order.id,
      });

      Notifies('success', 'Orden de compra removida del proyecto exitosamente');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    } catch (error) {
      console.error('Error removiendo orden del proyecto:', error);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        title: 'Orden de compra',
        sortable: true,
        render: (code) => (
          <span className="text-nowrap font-semibold">{code}</span>
        ),
      },
      {
        key: 'supplier',
        title: 'Proveedor',
        sortable: true,
      },
      {
        key: 'status',
        title: 'Estado',
        sortable: true,
        render: (status) => (
          <Badge
            color={statusColors[status] || 'gray'}
            className="uppercase px-2 py-1"
          >
            {status.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        key: 'date',
        title: 'Fecha',
        render: (date) => parseToLocalDate(date, 'es-MX'),
      },
      {
        key: 'amount',
        title: 'Monto',
        render: (amt) => `$${amt.toLocaleString('es-MX')}`,
      },
      {
        key: 'project.name',
        title: 'Proyecto',
        render: (_, row) =>
          row.project ? (
            <a
              href={`/projects/view/${row.project.id}?tab=3`}
              className="text-blue-600 hover:underline text-nowrap"
            >
              {row.project.name}
            </a>
          ) : (
            <span className="text-gray-400 italic">—</span>
          ),
      },
      {
        key: 'invoices',
        title: 'Facturas',
        render: (_, row) => (
          <Badge
            size="sm"
            color="purple"
            className="text-center flex justify-center items-center"
          >
            {row.invoices?.length || 0}
          </Badge>
        ),
      },
      { key: 'actions', title: 'Acciones' },
    ],
    [],
  );

  return (
    <section className="space-y-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-sinabe-primary flex items-center gap-2">
          <span>
            <FaClipboardList />
          </span>
          Órdenes de Compra
        </h1>
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

      {/* 🔎 Input de búsqueda */}
      <div className="relative max-w-md">
        <input
          type="text"
          defaultValue={query.searchTerm}
          onChange={(e) =>
            updateParams({ searchTerm: e.target.value, page: 1 })
          }
          placeholder="Buscar órdenes, proveedor, facturas..."
          className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring focus:border-blue-500"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <ReusableTable
        columns={columns}
        data={orders}
        loading={isLoading}
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
            key: 'main',
            icon: FaFileInvoice,
            label: 'Facturas',
            action: () => navigate(`/purchase-orders/${order.id}/invoices`),
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
          ...(order.projectId
            ? [
                {
                  key: 'remove',
                  icon: FaUnlink,
                  label: 'Remover del proyecto',
                  action: () => {
                    setSelectedOrder(order); // importante pasar orden completa
                    setIsDeleteModalOpen(true);
                  },
                },
                {
                  key: 'viewproject',
                  label: 'Ir al Proyecto',
                  href: `/projects/view/${order.projectId}?tab=3`,
                },
              ]
            : []),
        ]}
      />

      <PurchaseOrderFormModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ConfirmRemovePurchaseOrderModal
        order={selectedOrder}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setSelectedOrder(null);
          setIsDeleteModalOpen(false);
        }}
        onConfirm={(orderId) => {
          if (selectedOrder) {
            handleRemovePOFromProject(selectedOrder);
            setIsDeleteModalOpen(false);
            setSelectedOrder(null);
          }
        }}
      />
    </section>
  );
};

export default PurchaseOrdersPage;
