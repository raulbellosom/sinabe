// src/components/ProjectDetails/ProjectDeadlines.jsx
import React, { useState } from 'react';
import { useDeadlinesByProject } from '../../hooks/useDeadlines';
import Skeleton from 'react-loading-skeleton';
import DeadlineFormModal from './DeadlineFormModal';
import {
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaTimesCircle,
  FaRegPauseCircle,
  FaRegTrashAlt,
  FaClock,
  FaRegClock,
} from 'react-icons/fa';
import { MdInfoOutline, MdOutlineTaskAlt } from 'react-icons/md';
import { FiEdit, FiCalendar } from 'react-icons/fi';
import { BsBoxSeam } from 'react-icons/bs';
import { parseToLocalDate } from '../../utils/formatValues';
import ConfirmDeleteDeadlineModal from './ConfirmDeleteDeadlineModal.jsx';
import { Tooltip } from 'flowbite-react';
import AssignInventoryModal from './Inventory/AssignInventoryModal.jsx';

const statusBorderColor = {
  PENDIENTE: 'border-yellow-500',
  EN_PROGRESO: 'border-blue-500',
  EN_REVISION: 'border-purple-500',
  COMPLETADO: 'border-green-500',
  CANCELADO: 'border-red-500',
  BLOQUEADO: 'border-gray-500',
};

const statusBgColor = {
  PENDIENTE: 'bg-yellow-50',
  EN_PROGRESO: 'bg-blue-50',
  EN_REVISION: 'bg-purple-50',
  COMPLETADO: 'bg-green-50',
  CANCELADO: 'bg-red-50',
  BLOQUEADO: 'bg-gray-100',
};

const statusBadge = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROGRESO: 'bg-blue-100 text-blue-800',
  EN_REVISION: 'bg-purple-100 text-purple-800',
  COMPLETADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
  BLOQUEADO: 'bg-gray-300 text-gray-800',
};

const statusIcons = {
  PENDIENTE: <FaRegPauseCircle className="text-yellow-500 text-lg" />,
  EN_PROGRESO: <MdInfoOutline className="text-blue-500 text-lg" />,
  COMPLETADO: <FaCheckCircle className="text-green-500 text-lg" />,
  CANCELADO: <FaTimesCircle className="text-red-500 text-lg" />,
};

const ProjectDeadlines = ({ projectId }) => {
  const {
    data: deadlines,
    isLoading,
    refetch,
  } = useDeadlinesByProject(projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [deletingDeadline, setDeletingDeadline] = useState(null);
  const [openCards, setOpenCards] = useState({});
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState(null);

  const toggleCard = (id) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-4">
        <h2 className="text-base xl:text-lg font-bold text-gray-800 dark:text-white">
          Gestión Detallada de Deadlines
        </h2>
        <button
          onClick={() => {
            setEditingDeadline(null);
            setIsModalOpen(true);
          }}
          className="text-xs md:text-sm flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow"
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

      <div className="space-y-6 flex flex-col gap-4">
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

          const daysRemaining = deadline.dueDate
            ? Math.ceil(
                (new Date(deadline.dueDate) - new Date()) /
                  (1000 * 60 * 60 * 24),
              )
            : null;

          return (
            <div
              key={deadline.id}
              className={`relative w-full border-l-4 rounded-lg shadow-md p-4 space-y-2 ${
                statusBorderColor[deadline.status]
              } ${statusBgColor[deadline.status]} transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col-reverse  md:flex-row items-start md:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {deadline.name}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2 py-[2px] rounded-full flex gap-2 items-center font-semibold ${statusBadge[deadline.status]}`}
                  >
                    {statusIcons[deadline.status]}
                    {deadline.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDeadlineId(deadline.id);
                      setIsAssignModalOpen(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-1 rounded-md"
                  >
                    <BsBoxSeam />
                  </button>
                  <button
                    onClick={() => {
                      setEditingDeadline(deadline);
                      setIsModalOpen(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-1 rounded-md"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => setDeletingDeadline(deadline)}
                    className="text-red-600 hover:text-red-800 hover:bg-gray-100 p-1 rounded-md"
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                <p>{deadline.description}</p>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                <div className="flex justify-between md:justify-start items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiCalendar /> <strong>Fecha límite:</strong>{' '}
                    {parseToLocalDate(deadline.dueDate)}
                  </div>
                  <div className="text-xs font-semibold border border-gray-100 px-2 py-1 rounded-md">
                    {daysRemaining !== null
                      ? `${daysRemaining} días`
                      : 'Sin fecha'}
                  </div>
                </div>
                <div className="flex gap-2">
                  {deadline.users?.map((user) => {
                    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
                    return (
                      <Tooltip
                        key={user.id}
                        content={`${user.firstName} ${user.lastName}`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                          {user.photo?.[0]?.thumbnail ? (
                            <img
                              src={`/${user.photo[0].thumbnail}`}
                              alt="avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              <div className="text-sm text-gray-800">
                <div className="flex items-center justify-between gap-1">
                  <p>
                    <span className="font-semibold">Progreso general </span> (
                    {completedTasks}/{totalTasks} tareas)
                  </p>
                  <div className="text-right text-sm font-semibold text-gray-500">
                    {progress}%
                  </div>
                </div>
                <div className="h-3 mt-1 bg-neutral-200 w-full rounded-full">
                  <div
                    className="h-3 bg-sinabe-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div
                  className="flex justify-start gap-2 hover:bg-gray-100 w-fit px-4 py-2 rounded-md items-center cursor-pointer"
                  onClick={() => toggleCard(deadline.id)}
                >
                  <h4 className="text-sm font-medium text-gray-800">
                    Tareas del Deadline ({totalTasks})
                  </h4>
                  {isOpen ? (
                    <FaChevronUp className="text text-xs" />
                  ) : (
                    <FaChevronDown className="text text-xs" />
                  )}
                </div>
                {isOpen && (
                  <div className="mt-2 border-t pt-2">
                    <div className="mt-2 space-y-2">
                      {deadline.tasks?.length === 0 ? (
                        <div className="text-center text-gray-400 py-4">
                          <MdOutlineTaskAlt className="text-4xl mx-auto mb-2" />
                          <p className="font-medium">No hay tareas definidas</p>
                          <p className="text-sm">
                            Agrega tareas para este deadline
                          </p>
                        </div>
                      ) : (
                        deadline.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white border rounded-lg p-3 flex justify-between w-full items-start"
                          >
                            <div className="w-full">
                              <div className="flex flex-col-reverse md:flex-row w-full items-center gap-2 mb-1 justify-between">
                                <p className="font-semibold text-sm md:text-base text-left w-full md:w-fit flex items-center gap-2">
                                  {statusIcons[task.status]} {task.name}
                                </p>
                                <span
                                  className={`text-xs px-2 py-[2px] rounded-full font-semibold ${statusBadge[task.status]}`}
                                >
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                {task.description}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <FaRegClock />{' '}
                                  {task.date
                                    ? parseToLocalDate(task.date)
                                    : 'Sin fecha'}
                                </div>
                                <div className="text-xs flex gap-1 items-center text-gray-400 mt-1">
                                  Asignado a:{' '}
                                  {task.users?.length > 0 ? (
                                    task.users.map((user) => {
                                      const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
                                      return (
                                        <Tooltip
                                          key={user.id}
                                          content={`${user.firstName} ${user.lastName}`}
                                        >
                                          <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold ml-1">
                                            {user.photo?.[0]?.thumbnail ? (
                                              <img
                                                src={`/${user.photo[0].thumbnail}`}
                                                alt="avatar"
                                                className="w-full h-full object-cover rounded-full"
                                              />
                                            ) : (
                                              initials
                                            )}
                                          </div>
                                        </Tooltip>
                                      );
                                    })
                                  ) : (
                                    <span className="italic text-gray-400 ml-1">
                                      Aún no hay usuarios asignados
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
        onSuccess={() => {
          refetch();
          setIsModalOpen(false);
        }}
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
      <AssignInventoryModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        deadlineId={selectedDeadlineId}
        onSuccess={() => {
          refetch();
          setIsAssignModalOpen(false);
        }}
      />
    </section>
  );
};

export default ProjectDeadlines;
