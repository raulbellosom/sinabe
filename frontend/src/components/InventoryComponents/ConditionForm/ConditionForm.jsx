
import { FormikProvider, useFormik, Form } from 'formik';
import ConditionFormFields from './ConditionFormFields';

import { Button } from 'flowbite-react';
import { Trash2, Save } from 'lucide-react';
import { ConditionFormSchema } from './ConditionFormSchema';

const ConditionForm = ({ initialValues, onSubmit, isUpdate = false }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: ConditionFormSchema,
    onSubmit: (values, actions) => {
      onSubmit(values, actions);
    },
  });
  return (
    <FormikProvider value={formik}>
      <Form className="space-y-4" onSubmit={formik.handleSubmit}>
        <ConditionFormFields />
        <div className="flex justify-end items-center space-x-4 pt-4">
          <Button type="button" color="gray" onClick={() => formik.resetForm()}>
            <Trash2 size={20} className="mr-2" />
            Limpiar
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            color={formik.isSubmitting ? 'gray' : 'purple'}
            isProcessing={formik.isSubmitting}
          >
            <>
              <Save size={20} className="mr-2" />
              {isUpdate ? 'Actualizar ' : ' Crear '} Inventario
            </>
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
};

export default ConditionForm;
