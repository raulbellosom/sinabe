// src/components/Projects/ConfirmRemoveProjectMemberModal.jsx
import React, { useState } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import { FaTrashAlt } from 'react-icons/fa';

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
      setConfirmation('');
      onClose();
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-red-600 font-semibold">
          <FaTrashAlt /> Confirmar Eliminación
        </span>
      }
      size="md"
      footer={
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
            onClick={handleRemove}
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
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRemove();
        }}
      >
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
      </form>
    </ReusableModal>
  );
};

export default ConfirmRemoveProjectMemberModal;
