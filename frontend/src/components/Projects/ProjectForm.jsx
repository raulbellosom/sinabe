import { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ActionButtons from '../ActionButtons/ActionButtons';
import { ArrowLeft, Plus, Save } from 'lucide-react';

const ProjectForm = ({
  initialValues,
  onSubmit,
  isEdit = false,
  setFormValues,
  isChanged = false,
  onClose,
}) => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Nombre requerido'),
    provider: Yup.string().required('Proveedor requerido'),
    budgetTotal: Yup.number().min(0).required('Presupuesto requerido'),
    startDate: Yup.date().required('Fecha inicio requerida'),
    endDate: Yup.date().required('Fecha fin requerida'),
    description: Yup.string().optional(),
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ setFieldValue, isSubmitting, values, submitForm }) => {
        useEffect(() => {
          if (setFormValues) setFormValues(values);
        }, [values, setFormValues]);
        return (
          <Form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Nombre del Proyecto
                </label>
                <Field
                  name="name"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Proveedor
                </label>
                <Field
                  name="provider"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
                <ErrorMessage
                  name="provider"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Estado
                </label>
                <Field
                  as="select"
                  name="status"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccionar estado...</option>
                  <option value="PLANIFICACION">Planificación</option>
                  <option value="EN_EJECUCION">En ejecución</option>
                  <option value="EN_REVISION">En revisión</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="PAUSADO">Pausado</option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Presupuesto Total
                  </label>
                  <Field
                    name="budgetTotal"
                    type="number"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                  <ErrorMessage
                    name="budgetTotal"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Fecha de Inicio
                </label>
                <Field
                  name="startDate"
                  type="date"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
                <ErrorMessage
                  name="startDate"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Fecha de Fin
                </label>
                <Field
                  name="endDate"
                  type="date"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
                <ErrorMessage
                  name="endDate"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Descripción
                </label>
                <Field
                  name="description"
                  as="textarea"
                  rows="4"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <ActionButtons
                extraActions={[
                  {
                    label: isEdit ? 'Cancelar' : 'Volver',
                    action: onClose,
                    icon: ArrowLeft,
                    color: 'stone',
                    filled: true,
                    disabled: isSubmitting,
                  },
                  {
                    label: isEdit ? 'Actualizar' : 'Guardar',
                    color: 'indigo',
                    filled: isChanged,
                    icon: isEdit ? Save : Plus,
                    disabled: (isEdit ? !isChanged : false) || isSubmitting,
                    action: submitForm,
                    type: 'submit',
                  },
                ]}
              />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ProjectForm;
