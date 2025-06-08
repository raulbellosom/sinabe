import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import AsyncCreatableSelect from 'react-select/async-creatable';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import ActionButtons from '../ActionButtons/ActionButtons';
import { FaArrowLeft, FaPlus, FaSave } from 'react-icons/fa';

const ProjectForm = ({
  initialValues,
  onSubmit,
  isEdit = false,
  verticals = [],
  createVertical,
  setFormValues,
  isChanged = false,
}) => {
  const navigate = useNavigate();
  const [selectedVerticals, setSelectedVerticals] = useState([]);

  useEffect(() => {
    if (initialValues.verticalIds && verticals.length > 0) {
      const foundVerticals = verticals.filter((v) =>
        initialValues.verticalIds.includes(v.id),
      );
      setSelectedVerticals(
        foundVerticals.map((v) => ({ label: v.name, value: v.id })),
      );
    }
  }, [initialValues.verticalIds, verticals]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Nombre requerido'),
    provider: Yup.string().required('Proveedor requerido'),
    budgetTotal: Yup.number().min(0).required('Presupuesto requerido'),
    startDate: Yup.date().required('Fecha inicio requerida'),
    endDate: Yup.date().required('Fecha fin requerida'),
    verticalIds: Yup.array().min(1, 'Vertical requerida'),
  });

  const loadVerticalOptions = (inputValue, callback) => {
    const filtered = verticals
      .filter((v) => v.name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((v) => ({ label: v.name, value: v.id }));
    callback(filtered);
  };

  const handleCreateVertical = async (inputValue, setFieldValue) => {
    const created = await createVertical(inputValue);
    const option = { label: inputValue, value: created.data.id };
    setSelectedVerticals((prev) => [...prev, option]);
    setFieldValue('verticalIds', [
      ...selectedVerticals.map((v) => v.value),
      created.data.id,
    ]);
  };

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

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Vertical
                </label>
                <AsyncCreatableSelect
                  className="react-select-container"
                  classNamePrefix="react-select"
                  cacheOptions
                  isMulti
                  defaultOptions={verticals.map((v) => ({
                    label: v.name,
                    value: v.id,
                  }))}
                  loadOptions={loadVerticalOptions}
                  onChange={(option) => {
                    setSelectedVerticals(option);
                    setFieldValue(
                      'verticalIds',
                      option.map((o) => o.value),
                    );
                  }}
                  onCreateOption={(inputValue) =>
                    handleCreateVertical(inputValue, setFieldValue)
                  }
                  value={selectedVerticals}
                  placeholder="Seleccionar o crear..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: '2px',
                      borderRadius: '0.375rem',
                      borderColor: '#d1d5db',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#7e3af2' },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 20,
                    }),
                  }}
                />
                <ErrorMessage
                  name="verticalId"
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
