// src/components/ProjectDetails/ProjectDeadlines.jsx
import React, { useState } from 'react';
import { useDeadlinesByProject } from '../../hooks/useDeadlines';
import Skeleton from 'react-loading-skeleton';
import DeadlineFormModal from './DeadlineFormModal';
import {
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaTasks,
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaCheckCircle,
  FaChevronUp,
  FaClock,
  FaSpinner,
  FaTimesCircle,
  FaTrashAlt,
} from 'react-icons/fa';
import { MdInfoOutline, MdOutlineTaskAlt, MdTextFields } from 'react-icons/md';
import { parseToLocalDate } from '../../utils/formatValues';
import ConfirmDeleteDeadlineModal from './ConfirmDeleteDeadlineModal.jsx';

const statusBorderColor = {
  PENDIENTE: 'border-orange-500',
  EN_PROGRESO: 'border-blue-500',
  EN_REVISION: 'border-purple-500',
  COMPLETADO: 'border-green-500',
  CANCELADO: 'border-red-500',
  BLOQUEADO: 'border-gray-500',
};

const statusTextColor = {
  PENDIENTE: 'text-orange-500',
  EN_PROGRESO: 'text-blue-500',
  EN_REVISION: 'text-purple-500',
  COMPLETADO: 'text-green-500',
  CANCELADO: 'text-red-500',
  BLOQUEADO: 'text-gray-500',
};

const statusBadge = {
  PENDIENTE: 'bg-orange-100 text-orange-800',
  EN_PROGRESO: 'bg-blue-100 text-blue-800',
  EN_REVISION: 'bg-purple-100 text-purple-800',
  COMPLETADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
  BLOQUEADO: 'bg-gray-300 text-gray-800',
};

const statusIcons = {
  PENDIENTE: <FaClock className="text-orange-500 text-lg" />,
  EN_PROGRESO: <MdInfoOutline className="text-blue-500 text-lg" />,
  COMPLETADO: <FaCheckCircle className="text-green-500 text-lg" />,
  CANCELADO: <FaTimesCircle className="text-red-500 text-lg" />,
};

const ProjectDeadlines = ({ projectId }) => {
  const { data: deadlines, isLoading } = useDeadlinesByProject(projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [deletingDeadline, setDeletingDeadline] = useState(null);
  const [openCards, setOpenCards] = useState({});

  const toggleCard = (id) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-4">
        <h2 className="text-lg xl:text-2xl font-bold text-gray-800 dark:text-white">
          Gestión Detallada de Deadlines
        </h2>
        <button
          onClick={() => {
            setEditingDeadline(null);
            setIsModalOpen(true);
          }}
          className="text-xs md:text-base flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow"
        >
          <FaPlus /> Crear Deadline
        </button>
      </div>

      {isLoading && <Skeleton count={3} height={120} />}

      {!isLoading && deadlines?.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-300">
          No hay deadlines registrados.
        </div>
      )}

      <div className="space-y-6">
        {deadlines?.map((deadline) => {
          const completedTasks =
            deadline.tasks?.filter((t) => t.status === 'COMPLETADO').length ||
            0;
          const totalTasks = deadline.tasks?.length || 0;
          const progress =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;
          const isOpen = openCards[deadline.id] || false;

          return (
            <div
              key={deadline.id}
              className={`border-l-4 ${statusBorderColor[deadline.status]} bg-white dark:bg-gray-900 rounded-lg shadow-md`}
            >
              <div className="p-4 space-y-2">
                {/* Fila 1 */}
                <div className="flex flex-col-reverse md:flex-row gap-2 justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      {statusIcons[deadline.status]} {deadline.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-2 rounded-full ${statusBadge[deadline.status]}`}
                    >
                      {deadline.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => {
                        setEditingDeadline(deadline);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm md:text-base text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      onClick={() => setDeletingDeadline(deadline)}
                      className="flex items-center gap-1 text-sm md:text-base text-red-600 bg-red-100 px-3 py-1 rounded-md hover:bg-red-200"
                    >
                      <FaTrashAlt /> Eliminar
                    </button>
                  </div>
                </div>

                {/* Descripción */}
                <div className="grid grid-cols-12 gap-2 mt-2">
                  <div className="col-span-12 md:col-span-8 flex items-start gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      <MdTextFields className="inline-block mr-1" />
                    </span>
                    {deadline.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {deadline.description}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-4 flex items-center md:justify-end gap-2 text-gray-800">
                    <FaCalendarAlt className="text-gray-500" />
                    <span>
                      Fecha limite:{' '}
                      {deadline?.dueDate
                        ? parseToLocalDate(deadline?.dueDate)
                        : 'Sin fecha'}
                    </span>
                  </div>
                </div>

                {/* Fila 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-500" />
                    <span>{deadline.responsible || 'Sin asignar'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-6">
                      <span
                        className="bg-blue-500 h-6 rounded-full block"
                        style={{ width: `${progress}%` }}
                      ></span>
                    </span>
                    <span className="text-xs">{progress}%</span>
                  </div>
                </div>

                {/* divider */}
                <hr className="my-4 border-gray-200 dark:border-gray-700" />

                {/* Tareas */}
                <div className="mt-4">
                  <div
                    className="bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-md flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCard(deadline.id)}
                  >
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Tareas del Deadline:
                    </h4>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </div>

                  {isOpen && (
                    <>
                      {deadline.tasks?.length === 0 ? (
                        <div className="text-center text-gray-400 py-6">
                          <MdOutlineTaskAlt className="text-4xl mx-auto mb-2" />
                          <p className="font-medium">No hay tareas definidas</p>
                          <p className="text-sm">
                            Agrega tareas para este deadline
                          </p>
                        </div>
                      ) : (
                        <ul className="flex flex-col gap-3 text-sm mt-2">
                          {deadline.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                            >
                              <div className="flex flex-col gap-2">
                                <p className="inline-flex gap-2 items-center font-semibold">
                                  <span>{statusIcons[task.status]}</span>
                                  {task.name}
                                </p>
                                {task.description && (
                                  <span className="text-xs pl-7 text-gray-500 dark:text-gray-300">
                                    {task.description}
                                  </span>
                                )}
                                {task.users?.length > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-300">
                                    Asignada a: {task.users.join(', ')}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-300">
                                {task.date
                                  ? parseToLocalDate(task.date)
                                  : 'Sin fecha'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DeadlineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        initialData={editingDeadline}
      />
      <ConfirmDeleteDeadlineModal
        isOpen={!!deletingDeadline}
        deadline={deletingDeadline}
        onClose={() => setDeletingDeadline(null)}
        onSuccess={() => {
          setDeletingDeadline(null);
          refetch();
        }}
      />
    </section>
  );
};

export default ProjectDeadlines;
