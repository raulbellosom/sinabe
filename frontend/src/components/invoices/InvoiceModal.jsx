// components/invoices/InvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Label,
  TextInput,
  FileInput,
  Textarea,
} from 'flowbite-react';
import {
  useCreateIndependentInvoice,
  useUpdateIndependentInvoice,
} from '../../hooks/useInvoices';

const InvoiceModal = ({
  isOpen,
  onClose,
  invoice = null,
  isIndependent = false,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    concept: '',
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
        factura: null,
        xml: null,
      });
    } else {
      setFormData({
        code: '',
        concept: '',
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
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('code', formData.code);
      submitData.append('concept', formData.concept);

      if (formData.factura) {
        submitData.append('factura', formData.factura);
      }
      if (formData.xml) {
        submitData.append('xml', formData.xml);
      }

      if (invoice) {
        await updateInvoice.mutateAsync(submitData);
      } else {
        await createInvoice.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error al guardar la factura');
    }
  };

  const isLoading = createInvoice.isLoading || updateInvoice.isLoading;

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        {invoice ? 'Editar Factura' : 'Nueva Factura'}
      </Modal.Header>

      <Modal.Body>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button color="gray" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={isLoading}
              isProcessing={isLoading}
            >
              {invoice ? 'Actualizar' : 'Crear'} Factura
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default InvoiceModal;
