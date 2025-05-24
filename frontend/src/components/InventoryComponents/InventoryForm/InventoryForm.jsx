import React, { forwardRef, useImperativeHandle } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { InventoryFormSchema } from './InventoryFormSchema';
import InventoryFormFields from './InventoryFormFields';

const InventoryForm = forwardRef(
  (
    {
      initialValues,
      onSubmit,
      inventoryModels,
      onOtherModelSelected,
      inventoryConditions,
      customFields,
      getFieldValues,
      createCustomField,
      currentCustomFields,
      inventoryId,
    },
    ref,
  ) => {
    const formik = useFormik({
      enableReinitialize: true,
      initialValues: initialValues,
      validationSchema: InventoryFormSchema,
      onSubmit: async (values, actions) => {
        try {
          await onSubmit(values, actions);
          // actions.resetForm();
        } catch (error) {
          actions.setSubmitting(false);
        }
      },
    });

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        formik.submitForm();
      },
    }));
    // console.log(formik.values.modelId);
    return (
      <FormikProvider value={formik}>
        <Form ref={ref} className="space-y-4" onSubmit={formik.handleSubmit}>
          <InventoryFormFields
            inventoryModels={inventoryModels}
            inventoryConditions={inventoryConditions}
            onOtherSelected={onOtherModelSelected}
            customFields={customFields}
            getFieldValues={getFieldValues}
            createCustomField={createCustomField}
            currentCustomFields={currentCustomFields}
            inventoryId={inventoryId}
          />
        </Form>
      </FormikProvider>
    );
  },
);

export default React.memo(InventoryForm);
