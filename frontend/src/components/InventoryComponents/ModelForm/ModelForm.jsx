import React, { forwardRef, useImperativeHandle } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { ModelFormSchema } from './ModelFormSchema';
import ModelFormFields from './ModelFormFields';

const ModelForm = forwardRef(
  (
    {
      initialValues,
      onSubmit,
      inventoryBrands,
      inventoryTypes,
      createBrand,
      createType,
    },
    ref,
  ) => {
    const formik = useFormik({
      enableReinitialize: true,
      initialValues: initialValues,
      validationSchema: ModelFormSchema,
      onSubmit: (values, actions) => {
        onSubmit(values, actions);
      },
    });

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        formik.submitForm();
      },
      resetForm: () => {
        formik.resetForm();
      },
    }));

    return (
      <FormikProvider value={formik}>
        <Form className="space-y-4" onSubmit={formik.handleSubmit}>
          <ModelFormFields
            inventoryBrands={inventoryBrands}
            inventoryTypes={inventoryTypes}
            createBrand={createBrand}
            createType={createType}
          />
        </Form>
      </FormikProvider>
    );
  },
);

export default ModelForm;
