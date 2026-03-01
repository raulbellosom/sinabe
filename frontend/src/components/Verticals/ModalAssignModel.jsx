// src/components/Modals/ModalAssignModel.jsx

import ReusableModal from '../Modals/ReusableModal';
import Combobox from '../common/Combobox';
import { Formik, Form } from 'formik';
import Notifies from '../Notifies/Notifies';
import { Plus, Save, X, Box } from 'lucide-react';

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
          <Plus className="text-[color:var(--primary)]" /> Asignar Modelo
        </span>
      }
      size="md"
    >
      <p className="text-sm text-[color:var(--foreground-muted)] mb-4">
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
              <Combobox
                label={
                  <span className="flex items-center gap-2">
                    <Box size={20} className="text-gray-500" /> Modelo
                  </span>
                }
                cacheOptions
                defaultOptions
                loadOptions={loadModels}
                placeholder="Buscar modelo por nombre"
                value={values.model}
                onChange={(value) => setFieldValue('model', value)}
                error={errors.model && touched.model ? errors.model : null}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-[color:var(--surface-muted)] hover:bg-[color:var(--border)] text-[color:var(--foreground)] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X /> Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[color:var(--primary)] hover:opacity-90 text-[color:var(--primary-foreground)] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save /> Asignar
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ReusableModal>
  );
};

export default ModalAssignModel;
