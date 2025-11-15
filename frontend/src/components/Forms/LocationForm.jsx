import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import TextInput from '../Inputs/TextInput';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationFormSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .required('El nombre es requerido'),
});

const LocationForm = forwardRef(
  ({ onSubmit, initialValues = {}, onCancel }, ref) => {
    const defaultValues = {
      name: '',
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
        validationSchema={LocationFormSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <Field
              name="name"
              component={TextInput}
              label="* Nombre de la Ubicación"
              placeholder="Ej: Almacén Principal, Oficina Central"
              icon={FaMapMarkerAlt}
            />
          </Form>
        )}
      </Formik>
    );
  },
);

LocationForm.displayName = 'LocationForm';

export default LocationForm;
