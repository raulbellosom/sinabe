import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import AsyncSelect from 'react-select/async';
import { Formik, Form } from 'formik';
import Notifies from '../Notifies/Notifies';
import { FaPlus, FaSave, FaTimes, FaMicrochip } from 'react-icons/fa';

const ModalAssignModel = ({
  isOpen,
  onClose,
  verticalId,
  onAssign,
  loadModels, // función que devuelve modelos compatibles
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
            <FaPlus className="text-sinabe-primary" /> Asignar Modelo
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
            Busca y asigna un modelo a esta vertical. Solo se mostrarán modelos
            que no estén ya asignados.
          </p>

          <Formik
            initialValues={{ model: null }}
            validate={({ model }) => {
              const errors = {};
              if (!model) errors.model = 'Selecciona un modelo';
              return errors;
            }}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await onAssign({ verticalId, modelId: values.model.value });
                Notifies('success', 'Modelo asignado correctamente');
                resetForm();
                onClose();
              } catch (error) {
                console.error(error);
                Notifies('error', 'Error al asignar el modelo');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, setFieldValue, values, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <FaMicrochip className="text-gray-500" /> Modelo
                    </span>
                  </label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadModels}
                    placeholder="Buscar modelo por nombre"
                    value={values.model}
                    onChange={(value) => setFieldValue('model', value)}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'white',
                        borderColor: '#d1d5db',
                      }),
                    }}
                  />
                  {errors.model && touched.model && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.model}
                    </div>
                  )}
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
                    <FaSave /> Asignar
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

export default ModalAssignModel;
