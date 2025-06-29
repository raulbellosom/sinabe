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
  useCreatePurchaseOrderWithoutProject,
  useUpdatePurchaseOrder,
} from '../../../hooks/usePurchaseOrders';
import ActionButtons from '../../ActionButtons/ActionButtons';

// Validación de formulario de Orden de Compra
const PurchaseOrderSchema = Yup.object({
  code: Yup.string().required('Orden de compra es requerido'),
  supplier: Yup.string().required('Proveedor es requerido'),
  description: Yup.string(),

  status: Yup.string().required('Estado es requerido'),
  date: Yup.date().typeError('Fecha inválida').required('Fecha es requerida'),
});

/**
 * Modal unificado para crear o editar Orden de Compra.
 * Si recibe prop `order`, funciona en modo edición, de lo contrario en creación.
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
  const createPOWithoutProject = useCreatePurchaseOrderWithoutProject();

  const initialValues = {
    code: order?.code || '',
    supplier: order?.supplier || '',
    description: order?.description || '',
    status: order?.status || 'PLANIFICACION',
    date: order ? order.date.slice(0, 10) : '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditing) {
        await updatePO.mutateAsync({ id: order.id, data: values });
        Notifies('success', 'Orden de compra actualizada');
      } else {
        if (projectId) {
          await createPO.mutateAsync(values);
        } else {
          await createPOWithoutProject.mutateAsync(values);
        }
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
          <div className="flex justify-between items-center mb-6">
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
              <Form className="space-y-6">
                {/* Primera fila: Orden de compra y Proveedor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col col-span-2">
                    <label className="mb-1 text-sm font-medium">
                      Orden de compra
                    </label>
                    <Field
                      name="code"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    />
                    <ErrorMessage
                      name="code"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div className="flex flex-col col-span-1">
                    <label className="mb-1 text-sm font-medium">
                      Proveedor
                    </label>
                    <Field
                      name="supplier"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    />
                    <ErrorMessage
                      name="supplier"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium">Estado</label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    >
                      <option value="PLANIFICACION">Planificación</option>
                      <option value="EN_REVISION">En Revisión</option>
                      <option value="EN_EJECUCION">En Ejecución</option>
                      <option value="FINALIZADO">Finalizado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>

                {/* Tercera fila: Fecha */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">Fecha</label>
                  <Field
                    name="date"
                    type="date"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                  />
                  <ErrorMessage
                    name="date"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* Cuarta fila: Descripción */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    Descripción
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-2 pt-4">
                  <ActionButtons
                    extraActions={[
                      {
                        label: 'Cancelar',
                        color: 'stone',
                        action: onClose,
                        icon: FaTimes,
                      },
                      {
                        label: isEditing ? 'Actualizar' : 'Crear',
                        color: 'teal',
                        type: 'submit',
                        disabled: isSubmitting,
                        filled: true,
                        icon: FaSave,
                        action: () => {
                          if (isSubmitting) return;
                        },
                      },
                    ]}
                  />
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
// export const ConfirmRemovePurchaseOrderModal = ({
//   order,
//   isOpen,
//   onClose,
//   onConfirm,
// }) => {
//   const [confirmation, setConfirmation] = useState('');
//   if (!order) return null;

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           onConfirm(order.id);
//           setConfirmation('');
//           onClose();
//         }}
//         className="fixed inset-0 flex items-center justify-center p-4"
//       >
//         <DialogPanel className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl">
//           <div className="flex items-center gap-2 mb-4 text-red-600">
//             <FaTrashAlt className="w-6 h-6" />
//             <h2 className="text-xl font-semibold">Eliminar Orden de Compra</h2>
//           </div>
//           <p className="text-sm text-gray-700 mb-4">
//             Vas a eliminar la orden <strong>{order.code}</strong>. Esto
//             eliminará sus facturas.
//           </p>
//           <p className="text-sm text-gray-700 mb-4">
//             Para confirmar escribe{' '}
//             <span className="font-semibold text-red-500">acepto</span>:
//           </p>
//           <input
//             type="text"
//             value={confirmation}
//             onChange={(e) => setConfirmation(e.target.value)}
//             placeholder='Escribe "acepto" para confirmar'
//             className="w-full mb-4 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:border-red-500"
//           />
//           <div className="flex justify-end gap-2">
//             <Button
//               color="light"
//               onClick={() => {
//                 setConfirmation('');
//                 onClose();
//               }}
//             >
//               Cancelar
//             </Button>
//             <Button
//               color="failure"
//               type="submit"
//               disabled={confirmation.trim().toLowerCase() !== 'acepto'}
//             >
//               Eliminar
//             </Button>
//           </div>
//         </DialogPanel>
//       </form>
//     </Dialog>
//   );
// };
