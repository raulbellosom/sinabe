// src/components/ProjectDetails/DeadlineFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import {
  useCreateDeadline,
  useUpdateDeadline,
  useCreateTask,
  useUpdateTask,
} from '../../hooks/useDeadlines';
import { v4 as uuidv4 } from 'uuid';
import {
  FaCalendarAlt,
  FaTasks,
  FaPlus,
  FaSave,
  FaInfoCircle,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
} from 'react-icons/fa';
import {
  MdInfoOutline,
  MdOutlineCalendarToday,
  MdOutlineDescription,
  MdOutlineTaskAlt,
  MdTextFields,
} from 'react-icons/md';
import Notifies from '../../components/Notifies/Notifies'; // Asegúrate de tener este módulo para notificaciones

const statusIcons = {
  PENDIENTE: <FaClock className="text-orange-500 text-lg" />,
  EN_PROGRESO: <MdInfoOutline className="text-blue-500 text-lg" />,
  COMPLETADO: <FaCheckCircle className="text-green-500 text-lg" />,
  CANCELADO: <FaTimesCircle className="text-red-500 text-lg" />,
};

const DeadlineFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  projectId,
}) => {
  const isEditing = Boolean(initialData);
  const [deadline, setDeadline] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'PENDIENTE',
    users: [],
    order: 0,
    id: null,
  });

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    name: '',
    date: '',
    description: '',
  });

  const createDeadline = useCreateDeadline(projectId);
  const updateDeadline = useUpdateDeadline(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (isEditing && initialData) {
      setDeadline({ ...initialData });
      setTasks(initialData.tasks || []);
    } else {
      setDeadline({
        name: '',
        description: '',
        dueDate: '',
        status: 'PENDIENTE',
        users: [],
        order: 0,
        id: null,
      });
      setTasks([]);
    }
  }, [initialData, isEditing]);

  const handleAddTask = () => {
    if (!newTask.name || !newTask.date) return;
    const id = uuidv4();
    setTasks((prev) => [...prev, { id, ...newTask, order: prev.length }]);
    setNewTask({ name: '', date: '', description: '' });
  };

  const handleSubmit = async () => {
    const payload = { ...deadline };
    const deadlineId = deadline.id;

    if (isEditing) {
      await updateDeadline.mutateAsync({ id: deadline.id, data: payload });

      // 👇 Procesar tareas

      await Promise.all(
        tasks.map(async (task) => {
          const taskData = {
            name: task.name,
            description: task.description,
            date: task.date,
            order: task.order,
            status: task.status,
            users: task.users || [],
            createdById: task.createdById || 'admin',
          };

          if (task.id && !task.id.includes('-')) {
            // tarea persistente, actualiza
            return await updateTask.mutateAsync({
              id: task.id,
              data: taskData,
            });
          } else {
            // nueva tarea (uuid), crea
            return await createTask.mutateAsync({ deadlineId, data: taskData });
          }
        }),
      );

      Notifies('success', 'Deadline actualizado');
    } else {
      // Crear nuevo deadline + tareas
      const created = await createDeadline.mutateAsync(payload);
      const deadlineId = created?.data?.id;

      if (!deadlineId) {
        Notifies('error', 'Error al crear el deadline');
        return;
      }

      await Promise.all(
        tasks.map((task) =>
          createTask.mutateAsync({
            deadlineId,
            data: {
              name: task.name,
              description: task.description,
              date: task.date,
              order: task.order,
              status: task.status,
              users: task.users || [],
              createdById: created.data.createdById || 'admin',
            },
          }),
        ),
      );

      Notifies('success', 'Deadline creado con éxito');
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[95vh]">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FaInfoCircle className="text-sinabe-primary" /> Información del
                Deadline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <FaInfoCircle className="text-gray-500 dark:text-gray-400" />
                      Nombre del Deadline
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={deadline.name}
                    onChange={(e) =>
                      setDeadline({ ...deadline, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-500 dark:text-gray-400" />
                      Fecha de vencimiento
                    </span>
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={deadline.dueDate?.slice(0, 10)}
                    onChange={(e) =>
                      setDeadline({ ...deadline, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <MdTextFields className="text-gray-500 dark:text-gray-400" />
                    Descripción
                  </span>
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={deadline.description}
                  onChange={(e) =>
                    setDeadline({ ...deadline, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FaTasks className="text-sinabe-primary" /> Tareas del Deadline
              </h3>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="col-span-12 order-2 md:order-1 md:col-span-6 lg:col-span-5 flex flex-col gap-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <MdOutlineTaskAlt className="text-gray-500 dark:text-gray-400" />
                      Nombre de la tarea
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={newTask.name}
                    onChange={(e) =>
                      setNewTask({ ...newTask, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-12 order-3 md:order-2 md:col-span-6 lg:col-span-5 flex flex-col gap-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <MdOutlineCalendarToday className="text-gray-500 dark:text-gray-400" />
                      Fecha de entrega
                    </span>
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={newTask.date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, date: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-12 order-4 md:order-3 md:col-span-6 lg:col-span-2 flex justify-center items-end w-full">
                  <button
                    onClick={handleAddTask}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 w-full"
                  >
                    <span className="flex items-center gap-1">
                      <FaPlus />
                      Agregar
                    </span>
                  </button>
                </div>
                <div className="col-span-12 order-3 md:order-4 flex flex-col gap-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <MdOutlineDescription className="text-gray-500 dark:text-gray-400" />
                      Descripción de la tarea (opcional)
                    </span>
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  <MdOutlineTaskAlt className="text-4xl mx-auto mb-2" />
                  <p className="font-medium">
                    No hay tareas definidas para este deadline
                  </p>
                  <p className="text-sm">
                    Agrega tareas específicas para organizar mejor el trabajo
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {tasks.map((task, i) => (
                    <li
                      key={task.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Nombre + icono */}
                        <div className="md:col-span-4">
                          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                            {statusIcons[task.status || 'PENDIENTE']} Nombre de
                            la tarea
                          </label>
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) =>
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, name: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm border border-gray-300 rounded-md p-2"
                          />
                        </div>

                        {/* Estado */}
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Estado
                          </label>
                          <select
                            value={task.status || 'PENDIENTE'}
                            onChange={(e) =>
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, status: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm border border-gray-300 rounded-md p-2"
                          >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="EN_PROGRESO">En progreso</option>
                            <option value="COMPLETADO">Completado</option>
                            <option value="CANCELADO">Cancelado</option>
                          </select>
                        </div>

                        {/* Fecha */}
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Fecha de entrega
                          </label>
                          <input
                            type="date"
                            value={task.date?.slice(0, 10) || ''}
                            onChange={(e) =>
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, date: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm border border-gray-300 rounded-md p-2"
                          />
                        </div>

                        {/* Eliminar */}
                        <div className="md:col-span-2 flex items-start justify-end p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                          <button
                            onClick={() =>
                              setTasks((prev) =>
                                prev.filter((t) => t.id !== task.id),
                              )
                            }
                            title="Eliminar tarea"
                            className="text-red-500 inline-flex items-center gap-2 text-sm font-medium"
                            aria-label="Eliminar tarea"
                          >
                            <span>
                              <FaTrashAlt className="text-lg" />
                            </span>
                            Eliminar tarea
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaSave /> Guardar
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default DeadlineFormModal;
