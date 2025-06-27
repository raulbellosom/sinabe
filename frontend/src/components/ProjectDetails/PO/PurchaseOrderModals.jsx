// src/components/ProjectDetails/PO/PurchaseOrderModals.jsx
import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaClipboardList, FaTimes, FaSave, FaTrashAlt } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';
import { Button } from 'flowbite-react';
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
} from '../../../hooks/usePurchaseOrders';

// Validación de formulario de Orden de Compra
const PurchaseOrderSchema = Yup.object({
  code: Yup.string().required('Orden de compra es requerido'),
  supplier: Yup.string().required('Proveedor es requerido'),
  description: Yup.string(),
  amount: Yup.number()
    .typeError('Debe ser un número')
    .positive('Debe ser positivo')
    .required('Monto es requerido'),
  status: Yup.string().required('Estado es requerido'),
  date: Yup.date().typeError('Fecha inválida').required('Fecha es requerida'),
});

/**
 * Modal unificado para crear o editar Orden de Compra.
 * Si recibe prop `order`, funciona en modo edición, sino en creación.
 */
export const PurchaseOrderFormModal = ({
  projectId,
  order,
  isOpen,
  onClose,
}) => {
  const isEditing = Boolean(order);
  const createPO = useCreatePurchaseOrder(projectId);
  const updatePO = useUpdatePurchaseOrder(projectId);

  const initialValues = {
    code: order?.code || '',
    supplier: order?.supplier || '',
    description: order?.description || '',
    amount: order?.amount || '',
    status: order?.status || 'PLANIFICACION',
    date: order ? order.date.slice(0, 10) : '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditing) {
        await updatePO.mutateAsync({ id: order.id, data: values });
        Notifies('success', 'Orden de compra actualizada');
      } else {
        await createPO.mutateAsync(values);
        Notifies('success', 'Orden de compra creada');
      }
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      Notifies('error', err.message || 'Error al guardar orden de compra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaClipboardList className="text-purple-600" />
              {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={PurchaseOrderSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {[
                  'code',
                  'supplier',
                  'description',
                  'amount',
                  'status',
                  'date',
                ].map((name) => (
                  <div key={name} className="flex flex-col">
                    <label className="mb-1 text-sm font-medium">
                      {name === 'code'
                        ? 'Orden de compra'
                        : name.charAt(0).toUpperCase() + name.slice(1)}
                    </label>
                    {name === 'status' ? (
                      <Field
                        as="select"
                        name={name}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                      >
                        <option value="PLANIFICACION">Planificación</option>
                        <option value="EN_EJECUCION">En Ejecución</option>
                        <option value="EN_REVISION">En Revisión</option>
                        <option value="FINALIZADO">Finalizado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </Field>
                    ) : (
                      <Field
                        name={name}
                        type={
                          name === 'amount'
                            ? 'number'
                            : name === 'date'
                              ? 'date'
                              : 'text'
                        }
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                      />
                    )}
                    <ErrorMessage
                      name={name}
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    color="light"
                    onClick={() => {
                      onClose();
                    }}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <FaTimes /> Cancelar
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <FaSave /> {isEditing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

/**
 * Modal de confirmación para eliminar orden de compra.
 * Requiere escribir 'acepto'.
 */
export const ConfirmRemovePurchaseOrderModal = ({
  order,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [confirmation, setConfirmation] = useState('');
  if (!order) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(order.id);
          setConfirmation('');
          onClose();
        }}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <DialogPanel className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <FaTrashAlt className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Eliminar Orden de Compra</h2>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Vas a eliminar la orden <strong>{order.code}</strong>. Esto
            eliminará sus facturas.
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Para confirmar escribe{' '}
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
            <Button
              color="light"
              onClick={() => {
                setConfirmation('');
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              color="failure"
              type="submit"
              disabled={confirmation.trim().toLowerCase() !== 'acepto'}
            >
              Eliminar
            </Button>
          </div>
        </DialogPanel>
      </form>
    </Dialog>
  );
};
