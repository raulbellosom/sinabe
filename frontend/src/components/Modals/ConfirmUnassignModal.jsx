// components/Modals/ConfirmUnassignModal.jsx
import React, { useState, useEffect } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { MdLinkOff } from 'react-icons/md';
import ReusableModal from './ReusableModal';

const ConfirmUnassignModal = ({
  isOpen,
  onClose,
  onConfirm,
  sourceItem,
  targetItem,
  sourceLabel = 'elemento',
  targetLabel = 'destino',
  requireConfirmation = true,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (requireConfirmation && targetItem) {
      setIsValid(confirmationText.trim() === targetItem.trim());
    } else {
      setIsValid(true);
    }
  }, [confirmationText, targetItem, requireConfirmation]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setConfirmationText('');
    }
  };

  const modalActions = [
    {
      label: 'Cancelar',
      action: onClose,
      color: 'gray',
    },
    {
      label: 'Desasignar',
      action: handleConfirm,
      color: 'red',
      filled: true,
      disabled: !isValid,
    },
  ];

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <HiExclamationCircle size={24} className="text-orange-500" />
          <span className="text-orange-500">Desasignar {sourceLabel}</span>
        </div>
      }
      size="md"
      actions={modalActions}
    >
      <div className="text-center space-y-4">
        <MdLinkOff className="mx-auto h-24 w-24 text-orange-500 dark:text-orange-400" />

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Estás a punto de desasignar {sourceLabel === 'factura' ? 'la' : 'el'}{' '}
          {sourceLabel}{' '}
          <strong className="text-gray-900 dark:text-white">
            {sourceItem}
          </strong>{' '}
          de {targetLabel === 'orden de compra' ? 'la' : 'el'} {targetLabel}{' '}
          <strong className="text-gray-900 dark:text-white">
            {targetItem}
          </strong>
          .
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Esta acción <strong className="text-orange-600">no eliminará</strong>{' '}
          ningún elemento, solo removerá la relación entre ellos.
        </p>

        {requireConfirmation && targetItem && (
          <div className="text-left space-y-2">
            <Label htmlFor="confirmCode">
              Para confirmar, escribe el código de{' '}
              {targetLabel === 'orden de compra' ? 'la' : 'el'} {targetLabel}:
            </Label>
            <TextInput
              id="confirmCode"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              placeholder={targetItem}
              autoFocus
              autoComplete="off"
              className={confirmationText && !isValid ? 'border-red-500' : ''}
            />
            {confirmationText && !isValid && (
              <p className="text-xs text-red-600">
                El código no coincide. Por favor, escribe exactamente:{' '}
                <strong>{targetItem}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </ReusableModal>
  );
};

export default ConfirmUnassignModal;
