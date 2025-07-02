import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button, Label, TextInput } from 'flowbite-react';
import Notifies from '../../Notifies/Notifies';
import { useDeleteProjectDocument } from '../../../hooks/useProjectDocuments';

const ConfirmDeleteProjectDocumentModal = ({
  isOpen,
  onClose,
  document,
  onSuccess,
  projectId,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const { mutate, isPending } = useDeleteProjectDocument(projectId);

  const handleDelete = () => {
    mutate(document.id, {
      onSuccess: () => {
        Notifies('success', 'Documento eliminado');
        onSuccess?.();
      },
      onError: () => {
        Notifies('error', 'Error al eliminar');
      },
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <DialogTitle className="text-lg font-semibold mb-4 text-red-600">
            ¿Eliminar documento?
          </DialogTitle>
          <p className="text-sm text-gray-600 mb-4">
            Esta acción es irreversible. Escribe <strong>"acepto"</strong> para
            confirmar.
          </p>
          <Label htmlFor="confirmation">Confirmación</Label>
          <TextInput
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="acepto"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              disabled={confirmation !== 'acepto' || isPending}
            >
              Eliminar
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteProjectDocumentModal;
