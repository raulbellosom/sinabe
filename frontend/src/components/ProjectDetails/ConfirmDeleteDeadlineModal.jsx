import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { FaTrashAlt } from 'react-icons/fa';
import { useDeleteDeadline } from '../../hooks/useDeadlines';
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
    } catch (err) {
      Notifies('error', 'Error al eliminar el deadline');
      console.log('Error al eliminar el deadline:', err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl p-6 shadow-2xl">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleDelete();
            }}
          >
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2 mb-4">
              <FaTrashAlt className="text-red-600" />
              Confirmar Eliminación
            </h2>
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
              className="w-full mb-4 border border-gray-300 dark:border-gray-600 p-2 rounded-md"
              placeholder='Escribe "acepto" para confirmar'
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={confirmation !== 'acepto'}
                className={`px-4 py-2 rounded-md text-white ${
                  confirmation === 'acepto'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Eliminar Deadline
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteDeadlineModal;
