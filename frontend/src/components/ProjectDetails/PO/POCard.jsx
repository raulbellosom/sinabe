// src/components/ProjectDetails/PO/POCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaFileInvoice,
  FaEye,
  FaPlus,
  FaDownload,
  FaTrashAlt,
} from 'react-icons/fa';
import ActionButtons from '../../ActionButtons/ActionButtons';
import InvoiceList from './InvoiceList';
import AddInvoiceModal from './AddInvoiceModal';
import ConfirmRemovePurchaseOrderModal from './ConfirmRemovePurchaseOrderModal';
import { useDeletePurchaseOrder } from '../../../hooks/usePurchaseOrders';
import { Tooltip } from 'flowbite-react'; // you may replace this with your own tooltip

const statusColors = {
  PLANIFICACION: 'bg-gray-200 text-gray-800',
  EN_EJECUCION: 'bg-blue-100 text-blue-800',
  EN_REVISION: 'bg-yellow-100 text-yellow-800',
  FINALIZADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const POCard = ({ order }) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const deletePO = useDeletePurchaseOrder(order.projectId);

  const handleView = () =>
    (window.location.href = `/purchase-orders/${order.id}`);
  const handleDownload = () =>
    window.open(`/api/purchase-orders/${order.id}/pdf`, '_blank');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl bg-white shadow-lg hover:shadow-2xl overflow-hidden"
      >
        {/* Card Header */}
        <div className="relative flex justify-between items-start p-4 border-b">
          {/* Delete icon */}
          <div className="absolute top-4 right-4">
            <Tooltip content="Eliminar Orden">
              <button
                onClick={() => setShowRemoveModal(true)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrashAlt size={16} />
              </button>
            </Tooltip>
          </div>

          {/* Main info */}
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 p-2 rounded-lg">
              <FaFileInvoice className="text-purple-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {order.code}
              </h3>
              <p className="text-sm text-gray-500">
                {order.supplier} · {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          {/* Status badge */}
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              statusColors[order.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-6">
          {order.description && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {order.description}
            </p>
          )}

          {/* Summary */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-800">
              <FaFileInvoice />
              <span className="font-medium">Facturas Asociadas</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              ${order.amount.toLocaleString()}
            </span>
          </div>

          {/* Invoice list */}
          <InvoiceList invoices={order.invoices} orderId={order.id} />

          {/* Actions */}
          <div className="mt-4">
            <ActionButtons
              extraActions={[
                { label: 'Ver OC', icon: FaEye, action: handleView },
                {
                  label: 'Agregar Factura',
                  icon: FaPlus,
                  action: () => setShowInvoiceModal(true),
                },
                {
                  label: 'Descargar PDF',
                  icon: FaDownload,
                  action: handleDownload,
                },
              ]}
            />
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AddInvoiceModal
        orderId={order.id}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
      <ConfirmRemovePurchaseOrderModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        order={order}
        onConfirm={(id) => deletePO.mutate(id)}
      />
    </>
  );
};

export default POCard;
