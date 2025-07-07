// File: src/components/ProjectDetails/ConfirmDeleteDeadlineModal.jsx
import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useDeleteDeadline } from '../../hooks/useDeadlines';
import ReusableModal from '../Modals/ReusableModal';
import Notifies from '../Notifies/Notifies';

const ConfirmDeleteDeadlineModal = ({
  isOpen,
  deadline,
  onClose,
  onSuccess,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const deleteDeadline = useDeleteDeadline();

  if (!deadline) return null;

  const handleDelete = async () => {
    if (confirmation !== 'acepto') return;

    try {
      await deleteDeadline.mutateAsync(deadline.id);
      Notifies('success', 'Deadline eliminada con éxito');
      onSuccess?.();
      onClose();
    } catch (err) {
      Notifies('error', 'Error al eliminar el deadline');
      console.error('Error al eliminar el deadline:', err);
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      size="md"
      actions={[
        {
          label: 'Cancelar',
          color: 'stone',
          icon: IoMdClose,
          action: onClose,
        },
        {
          label: 'Eliminar Deadline',
          color: 'red',
          icon: FaTrashAlt,
          filled: true,
          action: handleDelete,
          disabled: confirmation !== 'acepto',
        },
      ]}
    >
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Esta acción eliminará el deadline{' '}
        <strong className="text-gray-800 dark:text-white">
          {deadline.name}
        </strong>{' '}
        y todas sus tareas asociadas. Para confirmar, escribe{' '}
        <span className="font-semibold text-red-500">acepto</span> en el
        siguiente campo:
      </p>

      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md"
        placeholder='Escribe "acepto" para confirmar'
      />
    </ReusableModal>
  );
};

export default ConfirmDeleteDeadlineModal;
