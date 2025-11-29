import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import TextInput from '../Inputs/TextInput';
import TextArea from '../Inputs/TextArea';
import { FaFileInvoice, FaTruck } from 'react-icons/fa';

const validationSchema = Yup.object({
  code: Yup.string().required('El código es requerido'),
  supplier: Yup.string().required('El proveedor es requerido'),
  description: Yup.string(),
});

const PurchaseOrderForm = forwardRef(
  ({ onSubmit, initialValues = {} }, ref) => {
    const defaultValues = {
      code: '',
      supplier: '',
      description: '',
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
          </Form>
        )}
      </Formik>
    );
  },
);

export default PurchaseOrderForm;
