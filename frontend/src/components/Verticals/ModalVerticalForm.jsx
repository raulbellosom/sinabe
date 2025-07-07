// File: src/components/Modals/ModalVerticalForm.jsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import { FaPlus, FaEdit, FaSave, FaTags } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import Notifies from '../Notifies/Notifies';
import ReusableModal from '../Modals/ReusableModal'; // ✅ import correcto

const ModalVerticalForm = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
}) => {
  const isEditing = !!initialData;

  return (
    <Formik
      initialValues={{
        name: initialData?.name || '',
        description: initialData?.description || '',
      }}
      enableReinitialize
      validate={({ name }) => {
        const errors = {};
        if (!name) errors.name = 'El nombre es obligatorio';
        return errors;
      }}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await onSubmit(values);
          Notifies(
            'success',
            `Vertical ${isEditing ? 'actualizada' : 'creada'} correctamente`,
          );
          resetForm();
          onClose();
        } catch (error) {
          console.error(error);
          Notifies('error', 'Hubo un error al guardar');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ submitForm, isSubmitting, errors, touched }) => (
        <ReusableModal
          isOpen={isOpen}
          onClose={onClose}
          title={isEditing ? 'Editar Vertical' : 'Nueva Vertical'}
          size="md"
          actions={[
            {
              label: 'Cancelar',
              color: 'stone',
              icon: IoMdClose,
              action: onClose,
            },
            {
              label: isEditing ? 'Guardar cambios' : 'Crear',
              color: 'purple',
              filled: true,
              icon: FaSave,
              action: submitForm,
              disabled: isSubmitting,
            },
          ]}
        >
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="flex items-center gap-2">
                  <FaTags className="text-gray-500" />
                  Nombre de la vertical
                </span>
              </label>
              <Field
                type="text"
                name="name"
                placeholder="Ej. Infraestructura de Red"
                className="w-full rounded-md border border-gray-300 p-2"
              />
              {errors.name && touched.name && (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <Field
                as="textarea"
                name="description"
                placeholder="Describe el enfoque o los equipos relacionados con esta vertical"
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          </Form>
        </ReusableModal>
      )}
    </Formik>
  );
};

export default ModalVerticalForm;
