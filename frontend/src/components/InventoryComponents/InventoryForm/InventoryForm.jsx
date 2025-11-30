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
      purchaseOrders = [],
      invoices = [],
      locations = [],
      onOtherPurchaseOrderSelected,
      onOtherInvoiceSelected,
      onOtherLocationSelected,
      // Props para el sistema de pin
      isPinMode = false,
      pinnedFields = {},
      onPinField,
      onUnpinField,
      onFormChange,
    },
    ref,
  ) => {
    const formik = useFormik({
      enableReinitialize: true,
      initialValues: initialValues,
      validationSchema: InventoryFormSchema,
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: async (values, actions) => {
        try {
          await onSubmit(values, actions);
        } catch (error) {
          actions.setSubmitting(false);
        }
      },
    });

    // Manejar cambios en el formulario para el sistema de localStorage
    React.useEffect(() => {
      if (onFormChange && formik.dirty) {
        onFormChange(formik.values);
      }
    }, [formik.values, formik.dirty, onFormChange]);

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        formik.submitForm();
      },
      resetForm: (nextState) => {
        formik.resetForm(nextState);
      },
    }));
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
            purchaseOrders={purchaseOrders}
            invoices={invoices}
            locations={locations}
            onOtherPurchaseOrderSelected={onOtherPurchaseOrderSelected}
            onOtherInvoiceSelected={onOtherInvoiceSelected}
            onOtherLocationSelected={onOtherLocationSelected}
            // Props del sistema de pin
            isPinMode={isPinMode}
            pinnedFields={pinnedFields}
            onPinField={onPinField}
            onUnpinField={onUnpinField}
            formikValues={formik.values}
          />
        </Form>
      </FormikProvider>
    );
  },
);

export default React.memo(InventoryForm);
