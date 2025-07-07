// src/components/Modals/ConfirmRemoveInventoryModal.jsx
import React, { useState, useEffect } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import { MdRemoveCircle } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

const ConfirmRemoveInventoryModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!isOpen) setConfirmText('');
  }, [isOpen]);

  const canRemove = confirmText.trim().toLowerCase() === 'remover';

  const handleConfirm = () => {
    if (canRemove) {
      onConfirm?.();
      onClose?.();
      setConfirmText('');
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={() => {
        setConfirmText('');
        onClose();
      }}
      title={
        <span className="flex items-center gap-2 text-red-600 font-semibold">
          <MdRemoveCircle /> Confirmar remoción de inventario
        </span>
      }
      size="sm"
      actions={[
        {
          label: 'Cancelar',
          color: 'stone',
          icon: IoMdClose,
          action: () => {
            setConfirmText('');
            onClose();
          },
        },
        {
          label: 'Remover',
          color: 'red',
          filled: true,
          icon: MdRemoveCircle,
          action: handleConfirm,
          disabled: !canRemove,
        },
      ]}
    >
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        Esta acción removerá el inventario de la fecha límite actual. Para
        confirmar, escribe <strong>remover</strong> en el campo de abajo.
      </p>
      <input
        type="text"
        className="mt-2 mb-4 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Escribe 'remover' para confirmar"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />
    </ReusableModal>
  );
};

export default ConfirmRemoveInventoryModal;
