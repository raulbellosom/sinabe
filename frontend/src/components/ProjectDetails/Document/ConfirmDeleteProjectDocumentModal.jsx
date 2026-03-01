// src/components/ProjectDetails/Document/ConfirmDeleteProjectDocumentModal.jsx
import { useState, useEffect } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import { Label, TextInput } from '../../ui/flowbite';
import Notifies from '../../Notifies/Notifies';
import { useDeleteProjectDocument } from '../../../hooks/useProjectDocuments';

import {
  Trash2,
  X,
} from 'lucide-react';
const ConfirmDeleteProjectDocumentModal = ({
  isOpen,
  onClose,
  documents = [], // acepta uno o varios documentos
  onSuccess,
  projectId,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const { mutate, isPending } = useDeleteProjectDocument(projectId);

  useEffect(() => {
    if (!isOpen) setConfirmation('');
  }, [isOpen]);

  const count = documents.length;
  const canDelete = confirmation.trim().toLowerCase() === 'acepto';

  const handleDelete = () => {
    documents.forEach((doc) => {
      mutate(doc.id, {
        onError: () => Notifies('error', `Error al eliminar documento`),
      });
    });
    Notifies(
      'success',
      `${count} documento${count > 1 ? 's' : ''} eliminado${count > 1 ? 's' : ''}`,
    );
    onSuccess?.();
    onClose();
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={() => {
        setConfirmation('');
        onClose();
      }}
      title={
        <span className="flex items-center gap-2 text-red-600 font-semibold">
          <Trash2 /> ¿Eliminar {count} documento{count > 1 ? 's' : ''}?
        </span>
      }
      size="sm"
      actions={[
        {
          label: 'Cancelar',
          color: 'stone',
          icon: X,
          action: () => {
            setConfirmation('');
            onClose();
          },
        },
        {
          label: 'Eliminar',
          color: 'red',
          filled: true,
          icon: Trash2,
          action: handleDelete,
          disabled: !canDelete || isPending,
          type: 'submit',
        },
      ]}
    >
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Esta acción es irreversible. Escribe <strong>"acepto"</strong> para
        confirmar.
      </p>
      <Label htmlFor="confirmation">Confirmación</Label>
      <TextInput
        id="confirmation"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="acepto"
        className="mt-2"
      />
    </ReusableModal>
  );
};

export default ConfirmDeleteProjectDocumentModal;
