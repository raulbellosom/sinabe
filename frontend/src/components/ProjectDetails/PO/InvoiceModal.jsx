// src/components/ProjectDetails/PO/InvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
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
import { useCreateInvoice, useUpdateInvoice } from '../../../hooks/useInvoices';
import { Button } from 'flowbite-react';
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

  const [pdfUrl, setPdfUrl] = useState(invoice?.pdf || null);
  const [xmlUrl, setXmlUrl] = useState(invoice?.xml || null);
  const [pdfFile, setPdfFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    setPdfUrl(invoice?.fileUrl || invoice?.pdf || null);
    setXmlUrl(invoice?.xmlUrl || invoice?.xml || null);
    setPdfFile(null);
    setXmlFile(null);
    setShowDeleteConfirm(false);
    setDeleteConfirmation('');
  }, [invoice, isOpen]);

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
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaFileInvoice className="text-purple-600" />
          {isEditing ? 'Editar Factura' : 'Nueva Factura'}
        </span>
      }
      size="md"
      actions={[
        { label: 'Cancelar', color: 'stone', icon: FaTimes, action: onClose },
        {
          label: isEditing ? 'Actualizar' : 'Crear',
          color: 'purple',
          filled: true,
          icon: FaSave,
          action: () => document.getElementById('invoice-submit')?.click(),
        },
      ]}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={InvoiceSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'code', label: 'Factura', type: 'text', col: 2 },
                { name: 'concept', label: 'Concepto', type: 'text', col: 2 },
                { name: 'amount', label: 'Monto', type: 'number', col: 1 },
                { name: 'date', label: 'Fecha', type: 'date', col: 1 },
              ].map((field) => (
                <div
                  key={field.name}
                  className={`flex flex-col ${field.col === 2 ? 'col-span-2' : ''}`}
                >
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
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0] || null)}
                  className="w-full"
                />
              )}
            </div>
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
                  type="file"
                  accept="text/xml"
                  onChange={(e) => setXmlFile(e.target.files[0] || null)}
                  className="w-full"
                />
              )}
            </div>
            {/* Delete Confirmation */}
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
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
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
            {/* Hidden Submit */}
            <button
              type="submit"
              id="invoice-submit"
              className="hidden"
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    </ReusableModal>
  );
};

export default InvoiceModal;
