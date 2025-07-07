// src/components/Modals/ModalAssignModel.jsx
import React from 'react';
import ReusableModal from '../Modals/ReusableModal';
import AsyncSelect from 'react-select/async';
import { Formik, Form } from 'formik';
import Notifies from '../Notifies/Notifies';
import { FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { HiCubeTransparent } from 'react-icons/hi';

const ModalAssignModel = ({
  isOpen,
  onClose,
  verticalId,
  onAssign,
  loadModels,
}) => {
  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaPlus className="text-sinabe-primary" /> Asignar Modelo
        </span>
      }
      size="md"
    >
      <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
        Busca y asigna un modelo a esta vertical. Solo se mostrarán modelos que
        no estén ya asignados.
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
                  <HiCubeTransparent size={20} className="text-gray-500" />{' '}
                  Modelo
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
                <div className="text-red-500 text-sm mt-1">{errors.model}</div>
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
    </ReusableModal>
  );
};

export default ModalAssignModel;
