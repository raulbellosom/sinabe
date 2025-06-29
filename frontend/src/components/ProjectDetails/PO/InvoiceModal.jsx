// src/components/ProjectDetails/PO/InvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  FaFileInvoice,
  FaTimes,
  FaSave,
  FaTrashAlt,
  FaFilePdf,
  FaFileCode,
} from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';
import { Button } from 'flowbite-react';
import { useCreateInvoice, useUpdateInvoice } from '../../../hooks/useInvoices';
import ActionButtons from '../../ActionButtons/ActionButtons';

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

const InvoiceModal = ({
  orderId,
  projectId,
  invoice,
  isOpen,
  onClose,
  onDelete,
}) => {
  const isEditing = Boolean(invoice);
  const createInv = useCreateInvoice(orderId, projectId);
  const updateInv = useUpdateInvoice(orderId, projectId);

  // State for PDF/XML display or new file
  const [pdfUrl, setPdfUrl] = useState(invoice?.pdf || null);
  const [xmlUrl, setXmlUrl] = useState(invoice?.xml || null);
  const [pdfFile, setPdfFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  useEffect(() => {
    setPdfUrl(invoice?.pdf || null);
    setXmlUrl(invoice?.xml || null);
    setPdfFile(null);
    setXmlFile(null);
  }, [invoice, isOpen]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const initialValues = {
    code: invoice?.code || '',
    concept: invoice?.concept || '',
    amount: invoice?.amount || '',
    status: invoice?.status || 'PENDIENTE',
    date: invoice ? invoice.date.slice(0, 10) : '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v));
    if (pdfFile) formData.append('factura', pdfFile);
    if (xmlFile) formData.append('xml', xmlFile);

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

  const canDelete = deleteConfirmation.trim().toLowerCase() === 'acepto';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaFileInvoice className="text-purple-600" />
              {isEditing ? 'Editar Factura' : 'Nueva Factura'}
            </h2>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmation('');
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {/* Formik Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={InvoiceSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Text & Date Fields */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                  {[
                    { name: 'code', label: 'Factura', type: 'text' },
                    { name: 'concept', label: 'Concepto', type: 'text' },
                    { name: 'amount', label: 'Monto', type: 'number' },
                    { name: 'date', label: 'Fecha', type: 'date' },
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col">
                      <label className="mb-1 text-sm font-medium">
                        {field.label}
                      </label>
                      <Field
                        name={field.name}
                        type={field.type}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                      />
                      <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-red-600 text-sm mt-1"
                      />
                    </div>
                  ))}
                </div>

                {/* Select Estado */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">Estado</label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADA">Pagada</option>
                    <option value="ANULADA">Anulada</option>
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* PDF File */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium flex items-center gap-2">
                    <FaFilePdf /> PDF
                  </label>
                  {pdfUrl || pdfFile ? (
                    <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                      {pdfFile ? (
                        <span className="truncate">{pdfFile.name}</span>
                      ) : (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 underline"
                        >
                          <FaFilePdf /> Ver PDF
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null);
                          setPdfUrl(null);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ) : (
                    <input
                      id="pdfFile"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files[0] || null)}
                      className="w-full"
                    />
                  )}
                </div>

                {/* XML File */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium flex items-center gap-2">
                    <FaFileCode /> XML
                  </label>
                  {xmlUrl || xmlFile ? (
                    <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                      {xmlFile ? (
                        <span className="truncate">{xmlFile.name}</span>
                      ) : (
                        <a
                          href={xmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 underline"
                        >
                          <FaFileCode /> Ver XML
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setXmlFile(null);
                          setXmlUrl(null);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ) : (
                    <input
                      id="xmlFile"
                      type="file"
                      accept="text/xml"
                      onChange={(e) => setXmlFile(e.target.files[0] || null)}
                      className="w-full"
                    />
                  )}
                </div>

                {/* Footer: Delete + Actions */}
                <div className="pt-4 border-t flex flex-col space-y-4">
                  {isEditing && (
                    <div className="p-4 bg-red-50 rounded-md">
                      {!showDeleteConfirm ? (
                        <Button
                          color="failure"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 w-full"
                        >
                          <FaTrashAlt /> Eliminar Factura
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm">
                            Escribe <code>acepto</code> para confirmar.
                          </p>
                          <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) =>
                              setDeleteConfirmation(e.target.value)
                            }
                            placeholder="acepto"
                            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring"
                          />
                          <div className="flex justify-end space-x-2">
                            <ActionButtons
                              extraActions={[
                                {
                                  label: 'Cancelar',
                                  color: 'stone',
                                  action: () => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmation('');
                                  },
                                  icon: FaTimes,
                                },
                                {
                                  label: 'Eliminar',
                                  color: 'red',
                                  action: () => {
                                    onDelete(invoice.id);
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmation('');
                                    onClose();
                                  },
                                  icon: FaTrashAlt,
                                  disabled: !canDelete,
                                },
                              ]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancel / Submit */}
                  <div className="flex justify-end space-x-2">
                    <ActionButtons
                      extraActions={[
                        {
                          label: 'Cancelar',
                          color: 'stone',
                          action: () => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmation('');
                            onClose();
                          },
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
                </div>
              </Form>
            )}
          </Formik>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default InvoiceModal;
