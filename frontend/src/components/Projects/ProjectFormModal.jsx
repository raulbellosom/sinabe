// src/components/Projects/ProjectFormModal.jsx
import React from 'react';
import ReusableModal from '../Modals/ReusableModal';
import ProjectForm from './ProjectForm';
import { IoMdClose } from 'react-icons/io';

const ProjectFormModal = ({
  isOpen,
  onClose,
  initialValues,
  onSubmit,
  isEdit = false,
  verticals,
  createVertical,
}) => {
  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? (
          <span className="flex items-center gap-2">
            <IoMdClose className="opacity-0" /> {/* placeholder para alinear */}
            Editar Proyecto
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <IoMdClose className="opacity-0" /> {/* placeholder */}
            Crear Proyecto
          </span>
        )
      }
      size="lg"
      actions={[
        {
          label: 'Cancelar',
          color: 'stone',
          icon: IoMdClose,
          action: onClose,
        },
        {
          label: isEdit ? 'Guardar cambios' : 'Crear proyecto',
          color: 'purple',
          filled: true,
          icon: IoMdClose, // puedes cambiar por FaSave si lo prefieres
          action: () => document.getElementById('project-form-submit')?.click(),
        },
      ]}
    >
      <ProjectForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        isEdit={isEdit}
        verticals={verticals}
        createVertical={createVertical}
        onClose={onClose}
        submitButtonId="project-form-submit"
      />
    </ReusableModal>
  );
};

export default ProjectFormModal;
