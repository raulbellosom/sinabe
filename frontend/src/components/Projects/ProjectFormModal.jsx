// src/components/Projects/ProjectFormModal.jsx
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { IoMdClose } from 'react-icons/io';
import ProjectForm from './ProjectForm';

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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[95vh]">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
              {isEdit ? 'Editar Proyecto' : 'Crear Proyecto'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <IoMdClose className="text-2xl" />
            </button>
          </div>
          <ProjectForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            isEdit={isEdit}
            verticals={verticals}
            createVertical={createVertical}
            onClose={onClose}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ProjectFormModal;
