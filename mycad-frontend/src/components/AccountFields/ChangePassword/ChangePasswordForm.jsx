import React, { useRef } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import { ChangePasswordSchema } from './ChangePasswordSchema';
import ChangePasswordFormFields from './ChangePasswordFormFields';
import { Button } from 'flowbite-react';
import { FaRegTrashAlt, FaSave } from 'react-icons/fa';
import ResetPassowrd from '../../../assets/images/Reset-Password.svg';
import ActionButtons from '../../ActionButtons/ActionButtons';
import { RiLockPasswordFill } from 'react-icons/ri';

const ChangePasswordForm = ({ initialValues, onSubmit }) => {
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
        <div className="flex justify-end items-center space-x-4 pt-4">
          <ActionButtons
            extraActions={[
              {
                label: 'Limpiar',
                action: () => formik.resetForm(),
                icon: FaRegTrashAlt,
                color: 'red',
              },
              {
                label: 'Cambiar contraseña',
                action: () => formRef.current.submitForm,
                icon: RiLockPasswordFill,
                color: 'orange',
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
