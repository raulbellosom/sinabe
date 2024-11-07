import React, { forwardRef, useImperativeHandle } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { InventoryFormSchema } from './InventoryFormSchema';
import InventoryFormFields from './InventoryFormFields';
import { Button } from 'flowbite-react';
import { FaSave } from 'react-icons/fa';

const InventoryForm = forwardRef(
  (
    {
      initialValues,
      onSubmit,
      inventoryModels,
      onOtherModelSelected,
      inventoryConditions,
      isUpdate = false,
    },
    ref,
  ) => {
    const formik = useFormik({
      enableReinitialize: true,
      initialValues: initialValues,
      validationSchema: InventoryFormSchema,
      onSubmit: (values, actions) => {
        onSubmit(values, actions);
      },
    });

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        formik.submitForm();
      },
    }));

    return (
      <FormikProvider value={formik}>
        <Form ref={ref} className="space-y-4" onSubmit={formik.handleSubmit}>
          <InventoryFormFields
            inventoryModels={inventoryModels}
            inventoryConditions={inventoryConditions}
            onOtherSelected={onOtherModelSelected}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="py-2 rounded"
              color={formik.isSubmitting ? 'gray' : 'purple'}
              isProcessing={formik.isSubmitting}
            >
              <>
                <FaSave size={20} className="mr-2" />
                {isUpdate ? 'Actualizar ' : ' Crear '} Inventario
              </>
            </Button>
          </div>
        </Form>
      </FormikProvider>
    );
  },
);

export default InventoryForm;
