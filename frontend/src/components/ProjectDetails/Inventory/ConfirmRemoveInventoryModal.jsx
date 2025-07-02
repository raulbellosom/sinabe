// File: src/components/Modals/ConfirmRemoveInventoryModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdRemoveCircle } from 'react-icons/md';
import { Fragment } from 'react';
import { Button } from 'flowbite-react';

const ConfirmRemoveInventoryModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');

  const handleClose = () => {
    setConfirmText('');
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <MdRemoveCircle size={24} className="text-red-600" />
                <DialogTitle className="text-lg font-bold text-red-600">
                  Confirmar remoción de inventario
                </DialogTitle>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Esta acción removerá el inventario de la fecha límite actual.
                Para confirmar, escribe <strong>remover</strong> en el campo de
                abajo.
              </p>

              <input
                type="text"
                className="mt-2 mb-4 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Escribe 'remover' para confirmar"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  color="failure"
                  onClick={handleConfirm}
                  disabled={confirmText.toLowerCase() !== 'remover'}
                >
                  Remover
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmRemoveInventoryModal;
