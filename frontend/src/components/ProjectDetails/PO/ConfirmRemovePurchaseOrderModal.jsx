// src/components/ProjectDetails/PO/ConfirmRemovePurchaseOrderModal.jsx
import React, { useState, useEffect } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import { FaTrashAlt } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import Notifies from '../../Notifies/Notifies';

const ConfirmRemovePurchaseOrderModal = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}) => {
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!isOpen) setConfirmation('');
  }, [isOpen]);

  if (!order) return null;

  const canRemove = confirmation.trim().toLowerCase() === 'acepto';

  const handleRemove = () => {
    if (canRemove) {
      onConfirm(order.id);
      Notifies('success', `Orden ${order.code} eliminada`);
      onClose();
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-red-600 font-semibold">
          <FaTrashAlt /> Confirmar remoción
        </span>
      }
      size="md"
      actions={[
        { label: 'Cancelar', color: 'stone', icon: IoMdClose, action: onClose },
        {
          label: 'Remover OC del proyecto',
          color: 'red',
          filled: true,
          icon: FaTrashAlt,
          action: handleRemove,
          disabled: !canRemove,
        },
      ]}
    >
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Estás por remover la orden de compra{' '}
        <strong className="font-medium text-gray-800 dark:text-white">
          {order.code}
        </strong>{' '}
        del proyecto actual. Esto removerá también las siguientes facturas:
      </p>
      <ul className="mb-4 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
        {order.invoices.length > 0 ? (
          order.invoices.map((inv) => (
            <li
              key={inv.id}
              className="text-gray-800 dark:text-gray-200 text-sm mb-1"
            >
              • {inv.code} — {inv.concept} —{' '}
              {new Date(inv.createdAt).toLocaleDateString()}
            </li>
          ))
        ) : (
          <li className="text-gray-500 dark:text-gray-400 italic text-sm">
            No hay facturas asociadas.
          </li>
        )}
      </ul>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        Para confirmar esta acción escribe{' '}
        <span className="font-semibold text-red-500">acepto</span>:
      </p>
      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder='Escribe "acepto" para confirmar'
        className="w-full mb-4 border border-gray-300 dark:border-gray-600 p-2 rounded-md"
      />
    </ReusableModal>
  );
};

export default ConfirmRemovePurchaseOrderModal;
