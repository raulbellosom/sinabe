import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import TextInput from '../Inputs/TextInput';
import TextArea from '../Inputs/TextArea';
import { FaFileInvoice, FaTruck, FaInfoCircle } from 'react-icons/fa';
import { Button } from 'flowbite-react';

const validationSchema = Yup.object({
  code: Yup.string().required('El código es requerido'),
  supplier: Yup.string().required('El proveedor es requerido'),
  description: Yup.string(),
});

const PurchaseOrderForm = ({ onSubmit, initialValues = {}, onCancel }) => {
  const defaultValues = {
    code: '',
    supplier: '',
    description: '',
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
            label="* Código de la Orden"
            placeholder="Ej: PO-2024-001"
            icon={FaFileInvoice}
          />

          <Field
            name="supplier"
            component={TextInput}
            label="* Proveedor"
            placeholder="Nombre del proveedor"
            icon={FaTruck}
          />

          <Field
            name="description"
            component={TextArea}
            label="Descripción"
            placeholder="Descripción opcional de la orden de compra"
            rows={3}
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
              {isSubmitting ? 'Creando...' : 'Crear Orden de Compra'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PurchaseOrderForm;
