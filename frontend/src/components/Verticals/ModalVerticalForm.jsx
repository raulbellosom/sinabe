import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Formik, Form, Field } from 'formik';
import { FaPlus, FaEdit, FaSave, FaTimes, FaTags } from 'react-icons/fa';
import Notifies from '../Notifies/Notifies';

const ModalVerticalForm = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
}) => {
  const isEditing = !!initialData;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
            {isEditing ? (
              <>
                <FaEdit className="text-sinabe-primary" /> Editar Vertical
              </>
            ) : (
              <>
                <FaPlus className="text-sinabe-primary" /> Nueva Vertical
              </>
            )}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
            {isEditing
              ? 'Modifica la información de esta vertical tecnológica.'
              : 'Agrega una nueva vertical para clasificar modelos e inventarios.'}
          </p>

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
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <FaTags className="text-gray-500" /> Nombre de la vertical
                    </span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Ej. Infraestructura de Red"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                  {errors.name && touched.name && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.name}
                    </div>
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

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <FaTimes /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sinabe-primary hover:bg-sinabe-primary/80 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <FaSave /> {isEditing ? 'Guardar cambios' : 'Crear'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ModalVerticalForm;
