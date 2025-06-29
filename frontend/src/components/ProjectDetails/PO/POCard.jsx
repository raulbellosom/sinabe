// src/components/ProjectDetails/PO/POCard.jsx
import React, { useState } from 'react';
import {
  FaFileInvoice,
  FaEye,
  FaPlus,
  FaDownload,
  FaTrashAlt,
  FaEdit,
} from 'react-icons/fa';
import { Badge, Dropdown } from 'flowbite-react';
import ActionButtons from '../../ActionButtons/ActionButtons';
import InvoiceModal from './InvoiceModal';
import ConfirmRemovePurchaseOrderModal from './ConfirmRemovePurchaseOrderModal';
import { useDeletePurchaseOrder } from '../../../hooks/usePurchaseOrders';
import ReusableTable from '../../Table/ReusableTable';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { parseToCurrency, parseToLocalDate } from '../../../utils/formatValues';
import { useDeleteInvoice } from '../../../hooks/useInvoices';
import { API_URL } from '../../../services/api';
import { useInvoices } from '../../../hooks/useInvoices';
import { MdInventory } from 'react-icons/md';
import SideModal from '../../Modals/SideModal';
import InvoiceInventoryManager from '../../purchaseOrders/invoices/InvoiceInventoryManager';

const statusColors = {
  PLANIFICACION: 'gray',
  EN_EJECUCION: 'blue',
  EN_REVISION: 'yellow',
  FINALIZADO: 'green',
  CANCELADO: 'red',
};

const getFileUrl = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file);
  } else if (file.url.startsWith('http') || file.url.startsWith('https')) {
    return file.url;
  } else {
    return `${API_URL}${file.url}`;
  }
};

const POCard = ({ order, onEdit }) => {
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices(
    order.id,
  );
  const deletePO = useDeletePurchaseOrder(order.projectId);
  const deleteInvoice = useDeleteInvoice(order.id, order.projectId);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [invoiceToManageInventory, setInvoiceToManageInventory] =
    useState(null);

  // acciones OC
  const handleView = () =>
    (window.location.href = `/purchase-orders/${order.id}`);
  const handleDownload = () =>
    window.open(`/api/purchase-orders/${order.id}/pdf`, '_blank');
  const handleEditPO = () => onEdit(order);
  const handleDeletePO = () => setShowRemoveModal(true);

  // datos tabla facturas

  const invoiceData = invoices.map((inv) => ({
    id: inv.id,
    code: inv.code,
    concept: inv.concept,
    amount: inv.amount,
    status: inv.status,
    date: inv.date,
    pdf: inv.fileUrl ? getFileUrl({ url: inv.fileUrl }) : null,
    xml: inv.xmlUrl ? getFileUrl({ url: inv.xmlUrl }) : null,
  }));

  // collapsed menu OC
  const collapsedActions = [
    { label: 'Editar OC', icon: FaEdit, action: handleEditPO },
    { label: 'Eliminar OC', icon: FaTrashAlt, action: handleDeletePO },
    { label: 'Descargar PDF', icon: FaDownload, action: handleDownload },
  ];

  return (
    <div className="overflow-hidden h-full">
      <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-sinabe-primary">
        {/* Header */}
        <div className="flex-col px-2 py-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-50 p-1 md:p-3 rounded-lg">
                <FaFileInvoice className="text-purple-600 md:w-6 md:h-6 w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm lg:text-lg font-semibold text-gray-800">
                  {order.code}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {order.supplier} · {parseToLocalDate(order.date, 'es-MX')} ·{' '}
                  <span className="font-medium text-green-500">
                    {parseToCurrency(order.amount)}
                  </span>
                </p>
              </div>
            </div>
            <Badge
              color={statusColors[order.status] || 'gray'}
              size="sm"
              className="text-xs uppercase px-2 py-1 text-nowrap"
            >
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          {order.description && (
            <p className="text-gray-700 text-xs pt-2 leading-relaxed whitespace-pre-line">
              {order.description}
            </p>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-2 space-y-2 w-full text-nowrap">
          {/* Tabla de Facturas */}
          <ReusableTable
            columns={[
              {
                key: 'code',
                title: 'ID Factura',
                headerClassName: 'pl-4',
                cellClassName: 'font-medium',
              },
              { key: 'concept', title: 'Concepto' },
              {
                key: 'amount',
                title: 'Monto',
                render: (amt) => `$${amt.toLocaleString('es-MX')}`,
              },
              {
                key: 'status',
                title: 'Estado',
                render: (st) => (
                  <Badge
                    color={
                      st === 'PAGADA'
                        ? 'green'
                        : st === 'PENDIENTE'
                          ? 'yellow'
                          : 'red'
                    }
                    size="xs"
                    className="uppercase px-2 py-1"
                  >
                    {st}
                  </Badge>
                ),
              },
              {
                key: 'date',
                title: 'Fecha',
                render: (d) => parseToLocalDate(d, 'es-MX'),
              },
              { key: 'actions', title: 'Acciones' },
            ]}
            data={invoiceData}
            rowKey="id"
            enableCardView={false}
            showPagination={false}
            rowActions={(inv) => [
              {
                key: 'main',
                icon: MdInventory,
                label: 'Inventario',
                action: () => {
                  setInvoiceToManageInventory(inv);
                  setShowInventoryModal(true);
                },
              },
              {
                key: 'edit',
                icon: FaEdit,
                label: 'Editar',
                action: () => {
                  setInvoiceToEdit(inv);
                  setShowInvoiceModal(true);
                },
              },
              {
                key: 'download',
                icon: FaDownload,
                label: 'Descargar PDF',
                action: () => window.open(inv.pdf, '_blank'),
              },
              {
                key: 'downloadXml',
                icon: FaDownload,
                label: 'Descargar XML',
                action: () => window.open(inv.xml, '_blank'),
              },
              {
                key: 'delete',
                icon: FaTrashAlt,
                label: 'Eliminar',
                action: () => {
                  setInvoiceToEdit(inv);
                  setShowInvoiceModal(true);
                },
              },
            ]}
          />

          {/* Botones OC */}
          <div className="pt-2 flex justify-end space-x-2">
            <ActionButtons
              extraActions={[
                {
                  label: 'Ver OC completa',
                  icon: FaEye,
                  href: '/purchase-orders/' + order.id,
                },
                {
                  label: 'Agregar Factura',
                  icon: FaPlus,
                  action: () => {
                    setInvoiceToEdit(null);
                    setShowInvoiceModal(true);
                  },
                },
              ]}
            />
            <Dropdown
              renderTrigger={() => (
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center">
                  <BsThreeDotsVertical />
                </button>
              )}
              placement="bottom-end"
            >
              {collapsedActions.map((a, i) => (
                <Dropdown.Item key={i} icon={a.icon} onClick={a.action}>
                  {a.label}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar/Eliminar Factura */}
      <InvoiceModal
        orderId={order.id}
        projectId={order.projectId}
        invoice={invoiceToEdit}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onDelete={(invoiceId) => deleteInvoice.mutate(invoiceId)}
      />

      {/* Modal Eliminar OC */}
      <ConfirmRemovePurchaseOrderModal
        order={order}
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={(id) => deletePO.mutate(id)}
      />
      <SideModal
        isOpen={showInventoryModal}
        onClose={() => {
          setShowInventoryModal(false);
          setInvoiceToManageInventory(null);
        }}
        title={`Inventario de ${invoiceToManageInventory?.code || ''}`}
        icon={MdInventory}
        size="xl"
      >
        {invoiceToManageInventory && (
          <InvoiceInventoryManager
            invoiceId={invoiceToManageInventory.id}
            orderId={order.id}
          />
        )}
      </SideModal>
    </div>
  );
};

export default POCard;
