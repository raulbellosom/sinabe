// src/components/ProjectDetails/PO/InvoiceModals.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaFileInvoice, FaTimes, FaSave, FaTrashAlt } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';
import { Button } from 'flowbite-react';
import {
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from '../../../hooks/useInvoices';

// Esquema de validación para formulario de factura
const InvoiceSchema = Yup.object({
  code: Yup.string().required('Código es requerido'),
  concept: Yup.string().required('Concepto es requerido'),
  amount: Yup.number()
    .typeError('Debe ser un número')
    .positive('Debe ser positivo')
    .required('Monto es requerido'),
  status: Yup.string().required('Estado es requerido'),
  date: Yup.date().typeError('Fecha inválida').required('Fecha es requerida'),
});

/**
 * InvoiceFormModal: modal usado para crear o editar facturas.
 * Si se pasa prop `invoice`, funciona en modo edición, sino en modo creación.
 */
export const InvoiceFormModal = ({ orderId, invoice, isOpen, onClose }) => {
  const isEditing = Boolean(invoice);
  const createInv = useCreateInvoice(orderId);
  const updateInv = useUpdateInvoice(orderId);

  const initialValues = {
    code: invoice?.code || '',
    concept: invoice?.concept || '',
    amount: invoice?.amount || '',
    status: invoice?.status || 'PENDIENTE',
    date: invoice ? invoice.date.slice(0, 10) : '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => formData.append(key, val));
    // Archivos
    const pdf = document.getElementById('pdfFile')?.files[0];
    const xml = document.getElementById('xmlFile')?.files[0];
    if (pdf) formData.append('factura', pdf);
    if (xml) formData.append('xml', xml);

    try {
      if (isEditing) {
        await updateInv.mutateAsync({ invoiceId: invoice.id, formData });
        Notifies('success', 'Factura actualizada');
      } else {
        await createInv.mutateAsync(formData);
        Notifies('success', 'Factura creada');
      }
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      Notifies('error', err.message || 'Error al guardar factura');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              {isEditing ? 'Editar Factura' : 'Nueva Factura'}
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
            validationSchema={InvoiceSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {['code', 'concept', 'amount', 'status', 'date'].map((name) => (
                  <div key={name} className="flex flex-col">
                    <label className="mb-1 text-sm font-medium capitalize">
                      {name}
                    </label>
                    <Field
                      name={name}
                      type={
                        name === 'amount'
                          ? 'number'
                          : name === 'date'
                            ? 'date'
                            : 'text'
                      }
                      as={name === 'status' ? 'select' : undefined}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    >
                      {name === 'status' && (
                        <>
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="PAGADA">Pagada</option>
                          <option value="ANULADA">Anulada</option>
                        </>
                      )}
                    </Field>
                    <ErrorMessage
                      name={name}
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 text-sm font-medium">PDF</label>
                    <input
                      id="pdfFile"
                      type="file"
                      accept="application/pdf"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-sm font-medium">XML</label>
                    <input
                      id="xmlFile"
                      type="file"
                      accept="text/xml"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    color="light"
                    onClick={onClose}
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
 * ConfirmRemoveInvoiceModal: confirma eliminación de factura. Escribe "acepto".
 */
export const ConfirmRemoveInvoiceModal = ({
  invoice,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [confirmation, setConfirmation] = useState('');

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(invoice.id);
          setConfirmation('');
          onClose();
        }}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <DialogPanel className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <FaTrashAlt className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Eliminar Factura</h2>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Estás por eliminar la factura <strong>{invoice.code}</strong>.
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
