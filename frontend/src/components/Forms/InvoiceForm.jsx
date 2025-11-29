import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import TextInput from '../Inputs/TextInput';
import { FaFileInvoice, FaTruck, FaTag } from 'react-icons/fa';

const validationSchema = Yup.object({
  code: Yup.string().required('El código es requerido'),
  concept: Yup.string().required('El concepto es requerido'),
  supplier: Yup.string(),
});

const InvoiceForm = forwardRef(({ onSubmit, initialValues = {} }, ref) => {
  const defaultValues = {
    code: '',
    concept: '',
    supplier: '',
    ...initialValues,
  };

  const formikRef = useRef(null);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    },
  }));

  return (
    <Formik
      innerRef={formikRef}
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
        </Form>
      )}
    </Formik>
  );
});

export default InvoiceForm;
