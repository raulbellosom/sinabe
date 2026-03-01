// src/components/Projects/ProjectFormModal.jsx

import ReusableModal from '../Modals/ReusableModal';
import ProjectForm from './ProjectForm';
import { X, Save } from 'lucide-react';

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
            <X className="opacity-0" /> {/* placeholder para alinear */}
            Editar Proyecto
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <X className="opacity-0" /> {/* placeholder */}
            Crear Proyecto
          </span>
        )
      }
      size="lg"
      actions={[
        {
          label: 'Cancelar',
          color: 'stone',
          icon: X,
          action: onClose,
        },
        {
          label: isEdit ? 'Guardar cambios' : 'Crear proyecto',
          color: 'purple',
          filled: true,
          icon: Save, // icono guardar
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
