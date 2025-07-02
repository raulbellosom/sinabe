// File: frontend/src/components/ProjectDetails/Document/ProjectDocumentFormModal.jsx

import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, FileInput, Label } from 'flowbite-react';
import * as Yup from 'yup';
import Notifies from '../../Notifies/Notifies';
import {
  useUploadProjectDocument,
  useUpdateProjectDocument,
} from '../../../hooks/useProjectDocuments';

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
  document,
  projectId,
  onSuccess,
}) => {
  const isEdit = Boolean(document);

  const uploadMutation = useUploadProjectDocument(projectId);
  const updateMutation = useUpdateProjectDocument(projectId);

  const initialValues = {
    name: document?.name || '',
    file: null,
    description: document?.description || '',
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    if (values.file) formData.append('documento', values.file); // 👈 nombre debe coincidir con Multer
    const mutationFn = isEdit
      ? () =>
          updateMutation.mutate(
            { id: document.id, formData },
            {
              onSuccess: () => {
                Notifies('success', 'Documento actualizado');
                onSuccess?.();
              },
              onError: () => {
                Notifies('error', 'Error al actualizar documento');
              },
              onSettled: () => setSubmitting(false),
            },
          )
      : () =>
          uploadMutation.mutate(formData, {
            onSuccess: () => {
              Notifies('success', 'Documento creado');
              onSuccess?.();
            },
            onError: () => {
              Notifies('error', 'Error al crear documento');
            },
            onSettled: () => setSubmitting(false),
          });

    mutationFn();
  };

  const isPending = uploadMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} className="z-50">
      <div className="fixed inset-0 z-50 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
          <DialogTitle className="text-lg font-semibold mb-4">
            {isEdit ? 'Editar Documento' : 'Agregar Documento'}
          </DialogTitle>
          <Formik
            initialValues={initialValues}
            validationSchema={ProjectDocumentSchema}
            onSubmit={handleSubmit}
            validateOnBlur={false}
            validateOnChange={false}
            context={{ isEdit }} // 👈 Aquí se pasa
          >
            {({ setFieldValue }) => (
              <Form className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Field
                    name="name"
                    className="w-full rounded-md border-gray-300 p-2"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    className="w-full rounded-md border-gray-300 p-2"
                  />
                </div>

                {!isEdit && (
                  <div>
                    <Label htmlFor="file">Archivo</Label>
                    <FileInput
                      accept="*/*"
                      onChange={(e) =>
                        setFieldValue('file', e.currentTarget.files[0])
                      }
                    />
                    <ErrorMessage
                      name="file"
                      component="div"
                      className="text-sm text-red-500"
                    />
                  </div>
                )}

                {isEdit && (
                  <div>
                    <Label htmlFor="file">Nuevo Archivo (opcional)</Label>
                    <FileInput
                      accept="*/*"
                      onChange={(e) =>
                        setFieldValue('file', e.currentTarget.files[0])
                      }
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button color="gray" onClick={onClose} type="button">
                    Cancelar
                  </Button>
                  <Button type="submit" color="purple" disabled={isPending}>
                    {isEdit ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ProjectDocumentFormModal;
