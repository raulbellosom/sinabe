// File: src/components/Modals/ModalVerticalForm.jsx

import { Formik, Form, Field } from 'formik';
import { Plus, Pencil, Save, Tag, X } from 'lucide-react';
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
              color: 'gray',
              icon: X,
              action: onClose,
            },
            {
              label: isEditing ? 'Guardar cambios' : 'Crear',
              color: 'primary',
              filled: true,
              icon: Save,
              action: submitForm,
              disabled: isSubmitting,
            },
          ]}
        >
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1">
                <span className="flex items-center gap-2">
                  <Tag className="text-[color:var(--foreground-muted)]" />
                  Nombre de la vertical
                </span>
              </label>
              <Field
                type="text"
                name="name"
                placeholder="Ej. Infraestructura de Red"
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] p-2.5 focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-colors"
              />
              {errors.name && touched.name && (
                <div className="text-[color:var(--danger)] text-sm mt-1">
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1">
                Descripción
              </label>
              <Field
                as="textarea"
                name="description"
                placeholder="Describe el enfoque o los equipos relacionados con esta vertical"
                rows={4}
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] p-2.5 focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-colors"
              />
            </div>
          </Form>
        </ReusableModal>
      )}
    </Formik>
  );
};

export default ModalVerticalForm;
