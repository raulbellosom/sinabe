// components/invoices/InvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import { Label, TextInput, FileInput, Textarea } from 'flowbite-react';
import {
  useCreateIndependentInvoice,
  useUpdateIndependentInvoice,
} from '../../hooks/useInvoices';
import ReusableModal from '../Modals/ReusableModal';
import Notifies from '../Notifies/Notifies';

const InvoiceModal = ({
  isOpen,
  onClose,
  invoice = null,
  isIndependent = false,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    concept: '',
    supplier: '',
    factura: null,
    xml: null,
  });

  const createInvoice = useCreateIndependentInvoice();
  const updateInvoice = useUpdateIndependentInvoice(invoice?.id);

  useEffect(() => {
    if (invoice) {
      setFormData({
        code: invoice.code || '',
        concept: invoice.concept || '',
        supplier: invoice.supplier || '',
        factura: null,
        xml: null,
      });
    } else {
      setFormData({
        code: '',
        concept: '',
        supplier: '',
        factura: null,
        xml: null,
      });
    }
  }, [invoice, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.concept.trim()) {
      Notifies('warning', 'Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('code', formData.code);
      submitData.append('concept', formData.concept);
      if (formData.supplier) {
        submitData.append('supplier', formData.supplier);
      }

      if (formData.factura) {
        submitData.append('factura', formData.factura);
      }
      if (formData.xml) {
        submitData.append('xml', formData.xml);
      }

      if (invoice) {
        await updateInvoice.mutateAsync(submitData);
        Notifies('success', 'Factura actualizada exitosamente');
      } else {
        await createInvoice.mutateAsync(submitData);
        Notifies('success', 'Factura creada exitosamente');
      }

      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al guardar la factura',
      );
    }
  };

  const isLoading = createInvoice.isPending || updateInvoice.isPending;

  const modalActions = [
    {
      label: 'Cancelar',
      action: onClose,
      color: 'gray',
      disabled: isLoading,
    },
    {
      label: invoice ? 'Actualizar' : 'Crear',
      action: handleSubmit,
      color: 'purple',
      filled: true,
      disabled: isLoading,
      type: 'submit',
    },
  ];

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? 'Editar Factura' : 'Nueva Factura'}
      size="lg"
      actions={modalActions}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="code" value="Código *" />
          <TextInput
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="Ej: FACT-2024-001"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="supplier" value="Proveedor" />
          <TextInput
            id="supplier"
            type="text"
            value={formData.supplier}
            onChange={(e) => handleInputChange('supplier', e.target.value)}
            placeholder="Nombre del proveedor (opcional)"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="concept" value="Concepto *" />
          <Textarea
            id="concept"
            value={formData.concept}
            onChange={(e) => handleInputChange('concept', e.target.value)}
            placeholder="Descripción del concepto facturado"
            rows={3}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="factura" value="Archivo PDF de Factura" />
          <FileInput
            id="factura"
            accept=".pdf"
            onChange={(e) => handleFileChange('factura', e.target.files[0])}
            disabled={isLoading}
            helperText="Sube el archivo PDF de la factura (opcional)"
          />
          {invoice?.fileUrl && (
            <div className="mt-1 text-sm text-blue-600">
              📎 Archivo actual:{' '}
              <a
                href={invoice.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Ver PDF
              </a>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="xml" value="Archivo XML" />
          <FileInput
            id="xml"
            accept=".xml"
            onChange={(e) => handleFileChange('xml', e.target.files[0])}
            disabled={isLoading}
            helperText="Sube el archivo XML de la factura (opcional)"
          />
          {invoice?.xmlUrl && (
            <div className="mt-1 text-sm text-green-600">
              📎 Archivo XML actual:{' '}
              <a
                href={invoice.xmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Ver XML
              </a>
            </div>
          )}
        </div>
      </form>
    </ReusableModal>
  );
};

export default InvoiceModal;
