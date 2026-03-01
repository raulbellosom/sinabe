import { useRef } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { ChangePasswordSchema } from './ChangePasswordSchema';
import ChangePasswordFormFields from './ChangePasswordFormFields';
import { Badge } from '../../ui/flowbite';
import ResetPassowrd from '../../../assets/images/Reset-Password.svg';
import ActionButtons from '../../ActionButtons/ActionButtons';

import {
  AlertCircle,
  Lock,
  Trash2,
} from 'lucide-react';
const ChangePasswordForm = ({ initialValues, onSubmit, error }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: ChangePasswordSchema,
    onSubmit: (values, actions) => {
      onSubmit(values, actions);
    },
  });
  const formRef = useRef(null);
  return (
    <FormikProvider value={formik}>
      <Form ref={formRef} className="space-y-4" onSubmit={formik.handleSubmit}>
        <img
          src={ResetPassowrd}
          alt="Reset Password"
          className="w-1/2 md:w-1/3 mx-auto"
        />
        <p className="text-center text-stone-800 text-base font-semibold">
          Completa los campos para cambiar tu contraseña
        </p>
        <ChangePasswordFormFields />
        {error && (
          <Badge size={'sm'} color="red" className="text-center">
            <AlertCircle className="inline-block mr-2 mb-1" size={20} />
            {error}
          </Badge>
        )}
        <div className="flex flex-col md:flex-row justify-end items-center gap-4 pt-4">
          <ActionButtons
            extraActions={[
              {
                label: 'Limpiar',
                action: () => formik.resetForm(),
                icon: Trash2,
                color: 'red',
              },
              {
                label: 'Cambiar contraseña',
                action: () => formRef.current.submitForm,
                icon: Lock,
                color: 'primary',
                filled: true,
                type: 'submit',
              },
            ]}
          />
        </div>
      </Form>
    </FormikProvider>
  );
};

export default ChangePasswordForm;
