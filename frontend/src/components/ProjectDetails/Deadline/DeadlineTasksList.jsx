// src/components/ProjectDetails/DeadlineTasksList.jsx
import React from 'react';
import {
  FaRegClock,
  FaCheckCircle,
  FaTimesCircle,
  FaRegPauseCircle,
} from 'react-icons/fa';
import { MdInfoOutline, MdOutlineTaskAlt } from 'react-icons/md';
import { Tooltip } from 'flowbite-react';
import { parseToLocalDate } from '../../../utils/formatValues';

const statusIcons = {
  PENDIENTE: <FaRegPauseCircle className="text-yellow-500 text-lg" />,
  EN_PROGRESO: <MdInfoOutline className="text-blue-500 text-lg" />,
  COMPLETADO: <FaCheckCircle className="text-green-500 text-lg" />,
  CANCELADO: <FaTimesCircle className="text-red-500 text-lg" />,
};

const statusBadge = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROGRESO: 'bg-blue-100 text-blue-800',
  EN_REVISION: 'bg-purple-100 text-purple-800',
  COMPLETADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
  BLOQUEADO: 'bg-gray-300 text-gray-800',
};

const DeadlineTasksList = ({ tasks = [], isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="mt-2 border-t pt-2">
      <div className="mt-2 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            <MdOutlineTaskAlt className="text-4xl mx-auto mb-2" />
            <p className="font-medium">No hay tareas definidas</p>
            <p className="text-sm">Agrega tareas para este deadline</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border rounded-lg p-3 flex justify-between w-full items-start"
            >
              <div className="w-full">
                <div className="flex flex-col sm:flex-row-reverse items-center justify-between mb-2 gap-2">
                  <span
                    className={`text-xs px-2 py-[2px] rounded-full flex w-fit gap-2 items-center font-semibold ${statusBadge[task.status]}`}
                  >
                    {statusIcons[task.status]}
                    {task.status.replace('_', ' ')}
                  </span>
                  <p className="font-semibold text-sm md:text-base text-left w-full md:w-fit flex items-center gap-2">
                    <MdOutlineTaskAlt className="text-gray-500" />
                    {task.name}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                  {task.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <FaRegClock />{' '}
                    {task.date ? parseToLocalDate(task.date) : 'Sin fecha'}
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
  );
};

export default DeadlineTasksList;
