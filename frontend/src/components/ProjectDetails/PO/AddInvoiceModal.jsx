// src/components/ProjectDetails/PO/AddInvoiceModal.jsx
import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaFileInvoice, FaTimes, FaSave, FaFilePdf } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';
import { useCreateInvoice } from '../../../hooks/useInvoices';
import { Button } from 'flowbite-react';

// Validación de campos de la factura
const InvoiceSchema = Yup.object({
  code: Yup.string().required('Código requerido'),
  concept: Yup.string().required('Concepto requerido'),
  amount: Yup.number()
    .typeError('Debe ser un número')
    .positive('Debe ser positivo')
    .required('Monto requerido'),
  status: Yup.string().required('Estado requerido'),
  date: Yup.date().typeError('Fecha inválida').required('Fecha requerida'),
});

const AddInvoiceModal = ({ orderId, isOpen, onClose }) => {
  const createInv = useCreateInvoice(orderId);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              Nueva Factura
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Completa los datos para agregar una factura a la orden.
          </p>

          <Formik
            initialValues={{
              code: '',
              concept: '',
              amount: '',
              status: 'PENDIENTE',
              date: '',
            }}
            validationSchema={InvoiceSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              const formData = new FormData();
              formData.append('code', values.code);
              formData.append('concept', values.concept);
              formData.append('amount', values.amount);
              formData.append('status', values.status);
              formData.append('date', values.date);
              const pdf = document.getElementById('pdfFile')?.files[0];
              const xml = document.getElementById('xmlFile')?.files[0];
              if (pdf) formData.append('factura', pdf);
              if (xml) formData.append('xml', xml);
              try {
                await createInv.mutateAsync(formData);
                Notifies('success', 'Factura creada correctamente');
                resetForm();
                onClose();
              } catch (err) {
                console.error(err);
                Notifies('error', err.message || 'Error al crear factura');
              } finally {
                setSubmitting(false);
              }
            }}
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
                    <FaSave /> {isSubmitting ? 'Guardando...' : 'Crear Factura'}
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

export default AddInvoiceModal;
