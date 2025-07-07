// File: frontend/src/components/ProjectDetails/Document/ProjectBulkUploadModal.jsx

import React from 'react';
import { Label, Textarea } from 'flowbite-react';
import { useUploadProjectDocument } from '../../../hooks/useProjectDocuments';
import Notifies from '../../Notifies/Notifies';
import ImagePicker from '../../Inputs/ImagePicker';
import { Formik, Field, Form } from 'formik';
import ReusableModal from '../../Modals/ReusableModal';
import { IoMdClose } from 'react-icons/io';
import { FaUpload } from 'react-icons/fa';

const ProjectBulkUploadModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const uploadMutation = useUploadProjectDocument(projectId);

  return (
    <Formik
      initialValues={{ description: '', images: [] }}
      onSubmit={async (values, { resetForm }) => {
        if (values.images.length === 0) {
          return Notifies('error', 'Debe seleccionar al menos un archivo');
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
      {({ submitForm, isSubmitting }) => (
        <ReusableModal
          isOpen={isOpen}
          onClose={onClose}
          title="Subir múltiples documentos"
          size="xl"
          actions={[
            {
              label: 'Cancelar',
              color: 'stone',
              icon: IoMdClose,
              action: onClose,
            },
            {
              label: 'Subir',
              color: 'purple',
              filled: true,
              icon: FaUpload,
              disabled: isSubmitting || uploadMutation.isPending,
              action: submitForm,
            },
          ]}
        >
          <Form className="space-y-4">
            <Label htmlFor="description">Descripción general (opcional)</Label>
            <Field as={Textarea} name="description" rows={3} />

            <Field
              name="images"
              id="images"
              component={ImagePicker}
              label="Imágenes o archivos"
              multiple
              accept="*/*"
            />
          </Form>
        </ReusableModal>
      )}
    </Formik>
  );
};

export default ProjectBulkUploadModal;
