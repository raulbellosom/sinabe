// components/Modals/ConfirmDeleteModal.jsx
import React, { useState, useEffect } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import ReusableModal from './ReusableModal';

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'registro',
  requireNameConfirmation = false,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (requireNameConfirmation) {
      setIsValid(confirmationText.trim() === itemName?.trim());
    } else {
      setIsValid(true);
    }
  }, [confirmationText, itemName, requireNameConfirmation]);

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
      label: 'No, cancelar',
      action: onClose,
      color: 'gray',
    },
    {
      label: 'Sí, eliminar',
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
          <HiExclamationCircle size={24} className="text-red-500" />
          <span className="text-red-500">Eliminar {itemType}</span>
        </div>
      }
      size="md"
      actions={modalActions}
    >
      <div className="text-center space-y-4">
        <RiDeleteBin2Fill className="mx-auto h-24 w-24 text-red-500 dark:text-gray-200" />

        <h3 className="text-xl font-normal text-gray-500 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar{' '}
          {requireNameConfirmation ? 'esta' : 'este'} {itemType}?
        </h3>

        {requireNameConfirmation && itemName && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {itemName}
            </p>
          </div>
        )}

        <p className="text-base text-gray-400 dark:text-gray-300">
          Recuerda que esta acción es{' '}
          <strong className="text-red-600">definitiva</strong> y{' '}
          <strong className="text-red-600">NO</strong> se puede deshacer.
        </p>

        {requireNameConfirmation && (
          <div className="text-left space-y-2">
            <Label htmlFor="confirmName">
              Para confirmar, escribe el{' '}
              {itemType === 'factura'
                ? 'código de la factura'
                : itemType === 'orden de compra'
                  ? 'código de la orden de compra'
                  : 'nombre'}{' '}
              exactamente:
            </Label>
            <TextInput
              id="confirmName"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={itemName}
              className={confirmationText && !isValid ? 'border-red-500' : ''}
            />
            {confirmationText && !isValid && (
              <p className="text-sm text-red-600">
                El texto no coincide. Por favor, escribe exactamente:{' '}
                <strong>{itemName}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </ReusableModal>
  );
};

export default ConfirmDeleteModal;
