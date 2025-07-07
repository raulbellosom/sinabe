// src/components/ProjectDetails/Document/ProjectDocumentFormModal.jsx
import React from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTimes } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';
import {
  useUploadProjectDocument,
  useUpdateProjectDocument,
} from '../../../hooks/useProjectDocuments';
import { FileInput, Label } from 'flowbite-react';
import TextInput from '../../Inputs/TextInput';
import TextArea from '../../Inputs/TextArea';

const ProjectDocumentSchema = Yup.object().shape({
  name: Yup.string().required('Nombre requerido'),
  file: Yup.mixed().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Archivo requerido'),
    otherwise: (schema) => schema.nullable(),
  }),
  description: Yup.string().nullable(),
});

const ProjectDocumentFormModal = ({
  isOpen,
  onClose,
  document: existingDocument,
  projectId,
  onSuccess,
}) => {
  const isEdit = Boolean(existingDocument);
  const uploadMutation = useUploadProjectDocument(projectId);
  const updateMutation = useUpdateProjectDocument(projectId);
  const isPending = uploadMutation.isPending || updateMutation.isPending;

  const initialValues = {
    name: existingDocument?.name || '',
    file: null,
    description: existingDocument?.description || '',
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    if (values.file) formData.append('documento', values.file);

    const mutationFn = isEdit
      ? () =>
          updateMutation.mutate(
            { id: existingDocument.id, formData },
            {
              onSuccess: () => {
                Notifies('success', 'Documento actualizado');
                onSuccess?.();
              },
              onError: () => Notifies('error', 'Error al actualizar documento'),
              onSettled: () => setSubmitting(false),
            },
          )
      : () =>
          uploadMutation.mutate(formData, {
            onSuccess: () => {
              Notifies('success', 'Documento creado');
              onSuccess?.();
            },
            onError: () => Notifies('error', 'Error al crear documento'),
            onSettled: () => setSubmitting(false),
          });

    mutationFn();
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Documento' : 'Agregar Documento'}
      size="md"
      actions={[
        { label: 'Cancelar', color: 'stone', icon: FaTimes, action: onClose },
        {
          label: isEdit ? 'Actualizar' : 'Guardar',
          color: 'purple',
          filled: true,
          icon: FaSave,
          // Usar window.document para evitar shadowing del prop
          action: () =>
            window.document.getElementById('doc-form-submit')?.click(),
          disabled: isPending,
        },
      ]}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ProjectDocumentSchema}
        onSubmit={handleSubmit}
        validateOnBlur={false}
        validateOnChange={false}
        context={{ isEdit }}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Field
                name="name"
                component={TextInput}
                className="w-full rounded-md"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-sm text-red-500 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Field
                as="textarea"
                name="description"
                rows={3}
                component={TextArea}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="file">
                {isEdit ? 'Nuevo Archivo (opcional)' : 'Archivo'}
              </Label>
              <FileInput
                accept="*/*"
                onChange={(e) =>
                  setFieldValue('file', e.currentTarget.files[0])
                }
              />
              <ErrorMessage
                name="file"
                component="div"
                className="text-sm text-red-500 mt-1"
              />
            </div>
            {/* hidden submit */}
            <button
              type="submit"
              id="doc-form-submit"
              className="hidden"
              disabled={isPending}
            />
          </Form>
        )}
      </Formik>
    </ReusableModal>
  );
};

export default ProjectDocumentFormModal;
