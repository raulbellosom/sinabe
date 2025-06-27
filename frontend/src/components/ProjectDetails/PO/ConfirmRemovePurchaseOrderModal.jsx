// src/components/ProjectDetails/PO/ConfirmRemovePurchaseOrderModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { FaTrashAlt } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';

/**
 * Modal para confirmar eliminación de una Orden de Compra.
 * Muestra las facturas asociadas y requiere que el usuario escriba 'acepto' para confirmar.
 */
const ConfirmRemovePurchaseOrderModal = ({
  isOpen,
  onClose,
  order, // objeto purchaseOrder con { id, code, invoices: [] }
  onConfirm, // función que recibe order.id
}) => {
  const [confirmation, setConfirmation] = useState('');

  if (!order) return null;

  const handleRemove = () => {
    if (confirmation.trim().toLowerCase() === 'acepto') {
      onConfirm(order.id);
      Notifies('success', `Orden ${order.code} eliminada`);
      setConfirmation('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRemove();
        }}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <DialogPanel className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <FaTrashAlt className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Confirmar eliminación</h2>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            Estás por eliminar la orden de compra{' '}
            <strong className="font-medium">{order.code}</strong>. Esto
            eliminará también las siguientes facturas:
          </p>

          <ul className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {order.invoices.length > 0 ? (
              order.invoices.map((inv) => (
                <li key={inv.id} className="text-gray-800 text-sm mb-1">
                  • {inv.code} — ${inv.amount.toLocaleString()} —{' '}
                  {new Date(inv.date).toLocaleDateString()}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm italic">
                No hay facturas asociadas.
              </li>
            )}
          </ul>

          <p className="text-sm text-gray-700 mb-4">
            Para confirmar esta acción escribe{' '}
            <span className="font-semibold text-red-500">acepto</span>:
          </p>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder='Escribe "acepto" para confirmar'
            className="w-full mb-4 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:border-red-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmation('');
                onClose();
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={confirmation.trim().toLowerCase() !== 'acepto'}
              className={`px-4 py-2 rounded-md text-white ${
                confirmation.trim().toLowerCase() === 'acepto'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-red-300 cursor-not-allowed'
              }`}
            >
              Eliminar OC
            </button>
          </div>
        </DialogPanel>
      </form>
    </Dialog>
  );
};

export default ConfirmRemovePurchaseOrderModal;
