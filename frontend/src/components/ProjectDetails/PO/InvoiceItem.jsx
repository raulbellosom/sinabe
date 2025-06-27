// src/components/ProjectDetails/PO/InvoiceItem.jsx
import React, { useState } from 'react';
import { Table } from 'flowbite-react';
import { FaEye, FaBoxes, FaTrashAlt, FaEdit } from 'react-icons/fa';
import ActionButtons from '../../ActionButtons/ActionButtons';
import { useDeleteInvoice } from '../../../hooks/useInvoices';
import { InvoiceFormModal, ConfirmRemoveInvoiceModal } from './InvoiceModals';

const InvoiceItem = ({ invoice, orderId }) => {
  const deleteInvoice = useDeleteInvoice(orderId);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleView = () => (window.location.href = `/invoices/${invoice.id}`);
  const handleEdit = () => setShowFormModal(true);
  const handleInventories = () => {
    // abrir modal de inventarios (implementación pendiente)
  };
  const handleRemove = () => setShowRemoveModal(true);

  return (
    <>
      <Table.Row className="hover:bg-gray-50">
        <Table.Cell>{invoice.code}</Table.Cell>
        <Table.Cell>{invoice.concept}</Table.Cell>
        <Table.Cell>${invoice.amount.toLocaleString()}</Table.Cell>
        <Table.Cell>{new Date(invoice.date).toLocaleDateString()}</Table.Cell>
        <Table.Cell className="text-right">
          <ActionButtons
            extraActions={[
              { label: 'Ver', icon: FaEye, action: handleView },
              { label: 'Editar', icon: FaEdit, action: handleEdit },
              {
                label: 'Inventarios',
                icon: FaBoxes,
                action: handleInventories,
              },
              { label: 'Eliminar', icon: FaTrashAlt, action: handleRemove },
            ]}
          />
        </Table.Cell>
      </Table.Row>

      {/* Modal unificado para crear/editar factura */}
      <InvoiceFormModal
        orderId={orderId}
        invoice={invoice}
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
      />

      {/* Modal para confirmar eliminación de factura */}
      <ConfirmRemoveInvoiceModal
        invoice={invoice}
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={(id) => deleteInvoice.mutate(id)}
      />
    </>
  );
};

export default InvoiceItem;
