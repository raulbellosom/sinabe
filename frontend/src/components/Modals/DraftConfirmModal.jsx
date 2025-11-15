import React from 'react';
import { Modal, Button } from 'flowbite-react';
import { HiExclamationTriangle } from 'react-icons/hi2';

const DraftConfirmModal = ({
  isOpen,
  onClose,
  onLoadDraft,
  onDiscardDraft,
  draftTimestamp,
}) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        <div className="flex items-center gap-3">
          <HiExclamationTriangle className="w-6 h-6 text-amber-500" />
          Inventario en progreso encontrado
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-4">
        <p className="text-gray-700">
          Se encontró un inventario que estaba en proceso de creación desde el{' '}
          <span className="font-semibold text-gray-900">
            {formatDate(draftTimestamp)}
          </span>
          .
        </p>

        <p className="text-gray-600">
          ¿Deseas continuar editando ese inventario o crear uno nuevo?
        </p>
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-3">
        <Button color="gray" onClick={onDiscardDraft}>
          Crear nuevo
        </Button>
        <Button onClick={onLoadDraft}>Continuar editando</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DraftConfirmModal;
