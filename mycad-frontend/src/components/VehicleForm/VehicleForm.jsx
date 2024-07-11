import React from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { VehicleFormSchema } from './VehicleFormSchema';
import VehicleFormFields from './VehicleFormFields';
import { Button } from 'flowbite-react';
import { FaSave } from 'react-icons/fa';
import { Spinner } from 'flowbite-react';

const VehicleForm = ({
  initialValues,
  onSubmit,
  vehicleTypes,
  isSubmitting,
}) => {
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: VehicleFormSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });
  return (
    <FormikProvider value={formik}>
      <Form onSubmit={formik.handleSubmit} className="space-y-6">
        <VehicleFormFields vehicleTypes={vehicleTypes} />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSubmitting ? (
            <Spinner className="animate-spin" size={20} />
          ) : (
            <>
              <FaSave size={20} className="mr-2" />
              Guardar
            </>
          )}
        </Button>
      </Form>
    </FormikProvider>
  );
};

export default VehicleForm;
