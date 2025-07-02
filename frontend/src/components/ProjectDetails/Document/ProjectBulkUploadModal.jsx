// File: frontend/src/components/ProjectDetails/Document/ProjectBulkUploadModal.jsx

import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button, Label, Textarea } from 'flowbite-react';
import { useUploadProjectDocument } from '../../../hooks/useProjectDocuments';
import Notifies from '../../Notifies/Notifies';
import { useNativeCamera } from '../../../hooks/useNativeCamera';
import ImagePicker from '../../Inputs/ImagePicker';
import FileIcon from '../../FileIcon/FileIcon';
import { FaXmark } from 'react-icons/fa6';
import { Formik, Field, Form } from 'formik';

const ProjectBulkUploadModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');

  const uploadMutation = useUploadProjectDocument(projectId);

  const handleFilesChange = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const handleCapturePhoto = async () => {
    const photo = await useNativeCamera();
    if (photo) {
      setFiles((prev) => [...prev, photo]);
    }
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      return Notifies('error', 'Debe seleccionar al menos un archivo');
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append('documento', file);
      formData.append('name', file.name);
      formData.append('description', description);

      await uploadMutation.mutateAsync(formData);
    }

    Notifies('success', 'Archivos subidos correctamente');
    setFiles([]);
    setDescription('');
    onSuccess?.();
    onClose();
  };

  const isImage = (file) => file.type?.startsWith('image/');

  return (
    <Dialog open={isOpen} onClose={onClose} className="z-50">
      <div className="fixed inset-0 z-50 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
          <DialogTitle className="text-lg font-semibold mb-4">
            Subir múltiples documentos
          </DialogTitle>

          <Formik
            initialValues={{ description: '', images: [] }}
            onSubmit={async (values, { resetForm }) => {
              if (values.images.length === 0) {
                return Notifies(
                  'error',
                  'Debe seleccionar al menos un archivo',
                );
              }

              for (const file of values.images) {
                const formData = new FormData();
                formData.append('documento', file);
                formData.append('name', file.name);
                formData.append('description', values.description);
                await uploadMutation.mutateAsync(formData);
              }

              Notifies('success', 'Archivos subidos correctamente');
              resetForm();
              onSuccess?.();
              onClose();
            }}
          >
            {() => (
              <Form className="space-y-4">
                <Label htmlFor="description">
                  Descripción general (opcional)
                </Label>
                <Field as={Textarea} name="description" rows={3} />

                <Field
                  name="images"
                  id="images"
                  component={ImagePicker}
                  label="Imágenes o archivos"
                  multiple
                  accept="*/*"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <Button color="gray" type="button" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="purple"
                    type="submit"
                    disabled={uploadMutation.isPending}
                  >
                    Subir archivos
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

export default ProjectBulkUploadModal;
