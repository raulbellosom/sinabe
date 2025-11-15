import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import TextInput from '../Inputs/TextInput';
import { FaFileInvoice, FaTruck, FaTag } from 'react-icons/fa';
import { Button } from 'flowbite-react';

const validationSchema = Yup.object({
  code: Yup.string().required('El código es requerido'),
  concept: Yup.string().required('El concepto es requerido'),
  supplier: Yup.string(),
});

const InvoiceForm = ({ onSubmit, initialValues = {}, onCancel }) => {
  const defaultValues = {
    code: '',
    concept: '',
    supplier: '',
    ...initialValues,
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <Field
            name="code"
            component={TextInput}
            label="* Código de la Factura"
            placeholder="Ej: FAC-2024-001"
            icon={FaFileInvoice}
          />

          <Field
            name="concept"
            component={TextInput}
            label="* Concepto"
            placeholder="Concepto de la factura"
            icon={FaTag}
          />

          <Field
            name="supplier"
            component={TextInput}
            label="Proveedor"
            placeholder="Nombre del proveedor (opcional)"
            icon={FaTruck}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              onClick={onCancel}
              color="gray"
              size="sm"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="purple"
              size="sm"
              disabled={isSubmitting}
              isProcessing={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Factura'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InvoiceForm;
