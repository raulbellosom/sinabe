import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { FaTrashAlt } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';

const ConfirmRemoveProjectMemberModal = ({
  isOpen,
  onClose,
  member,
  onConfirm,
}) => {
  const [confirmation, setConfirmation] = useState('');

  if (!member) return null;

  const handleRemove = () => {
    if (confirmation === 'acepto') {
      onConfirm(member.id);
      Notifies('success', `Miembro ${member.name} eliminado`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Evita la recarga de la página
          handleRemove();
        }}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <DialogPanel className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2 mb-4">
            <FaTrashAlt className="text-red-600" />
            Confirmar Eliminación
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Estás por eliminar a{' '}
            <strong className="text-gray-800 dark:text-white">
              {member.name}
            </strong>{' '}
            del equipo del proyecto. Para confirmar esta acción, escribe{' '}
            <span className="font-semibold text-red-500">acepto</span>:
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
              Eliminar miembro
            </button>
          </div>
        </DialogPanel>
      </form>
    </Dialog>
  );
};

export default ConfirmRemoveProjectMemberModal;
