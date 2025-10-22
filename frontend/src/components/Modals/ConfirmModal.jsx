// components/Modals/ConfirmModal.jsx
import React from 'react';
import { Modal, Button } from 'flowbite-react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'red',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>{title}</Modal.Header>

      <Modal.Body>
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {message}
          </h3>

          <div className="flex justify-center gap-4">
            <Button
              color={confirmColor}
              onClick={handleConfirm}
              disabled={isLoading}
              isProcessing={isLoading}
            >
              {confirmText}
            </Button>
            <Button color="gray" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
