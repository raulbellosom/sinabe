import { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import ActionButtons from '../ActionButtons/ActionButtons';
import { FaArrowLeft, FaPlus, FaSave } from 'react-icons/fa';

const ProjectForm = ({
  initialValues,
  onSubmit,
  isEdit = false,
  setFormValues,
  isChanged = false,
}) => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required('Nombre requerido'),
    provider: Yup.string().required('Proveedor requerido'),
    budgetTotal: Yup.number().min(0).required('Presupuesto requerido'),
    startDate: Yup.date().required('Fecha inicio requerida'),
    endDate: Yup.date().required('Fecha fin requerida'),
    description: Yup.string().optional(),
  });

  const normalizeText = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const handleDiscardChanges = () => {
    // check if there are unsaved changes and if so, confirm discard
    if (isChanged) {
      if (window.confirm('¿Deseas descartar los cambios?')) {
        navigate('/projects');
      }
    } else {
      navigate('/projects');
    }
  };

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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-sm text-sinabe-danger mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Proveedor
                  </label>
                  <Field
                    name="provider"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
                  />
                  <ErrorMessage
                    name="provider"
                    component="div"
                    className="text-sm text-sinabe-danger mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Estado
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
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
                    className="text-sm text-sinabe-danger mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Presupuesto Total
                </label>
                <Field
                  name="budgetTotal"
                  type="number"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
                />
                <ErrorMessage
                  name="budgetTotal"
                  component="div"
                  className="text-sm text-sinabe-danger mt-1"
                />
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
                />
                <ErrorMessage
                  name="startDate"
                  component="div"
                  className="text-sm text-sinabe-danger mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Fecha de Fin
                </label>
                <Field
                  name="endDate"
                  type="date"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
                />
                <ErrorMessage
                  name="endDate"
                  component="div"
                  className="text-sm text-sinabe-danger mt-1"
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sinabe-primary"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-sm text-sinabe-danger mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <ActionButtons
                extraActions={[
                  {
                    label: isEdit ? 'Cancelar' : 'Volver',
                    action: handleDiscardChanges,
                    icon: FaArrowLeft,
                    color: 'stone',
                    filled: true,
                  },
                  {
                    label: isEdit ? 'Actualizar' : 'Guardar',
                    color: 'indigo',
                    filled: isChanged,
                    icon: isEdit ? FaSave : FaPlus,
                    disabled: (isEdit ? !isChanged : false) || isSubmitting,
                    action: submitForm,
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
