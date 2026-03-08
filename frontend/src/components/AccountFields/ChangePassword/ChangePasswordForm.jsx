import { useEffect } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { ChangePasswordSchema } from './ChangePasswordSchema';
import ChangePasswordFormFields from './ChangePasswordFormFields';
import { AlertCircle } from 'lucide-react';

/**
 * ChangePasswordForm
 * Renders the form fields and error only.
 * Action buttons are handled by the parent via `formikRef`.
 * `formikRef.current` exposes `{ submitForm, resetForm }`.
 */
const ChangePasswordForm = ({ initialValues, onSubmit, error, formikRef }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: ChangePasswordSchema,
    onSubmit: (values, actions) => onSubmit(values, actions),
  });

  // Expose formik imperative handles to parent
  useEffect(() => {
    if (formikRef) {
      formikRef.current = {
        submitForm: formik.submitForm,
        resetForm: formik.resetForm,
        isSubmitting: formik.isSubmitting,
      };
    }
  }, [formik.submitForm, formik.resetForm, formik.isSubmitting, formikRef]);

  return (
    <FormikProvider value={formik}>
      <Form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
        <ChangePasswordFormFields />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </Form>
    </FormikProvider>
  );
};

export default ChangePasswordForm;

