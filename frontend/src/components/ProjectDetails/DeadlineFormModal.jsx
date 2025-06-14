// src/components/ProjectDetails/DeadlineFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import {
  useCreateDeadline,
  useUpdateDeadline,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '../../hooks/useDeadlines';
import { useProjectTeam } from '../../hooks/useProjectTeam'; // Asegúrate de tener este hook
import { v4 as uuidv4 } from 'uuid';
import AsyncSelect from 'react-select/async';
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
  FaUser,
} from 'react-icons/fa';
import {
  MdInfoOutline,
  MdOutlineCalendarToday,
  MdOutlineDescription,
  MdOutlineTaskAlt,
  MdTextFields,
} from 'react-icons/md';
import Notifies from '../../components/Notifies/Notifies';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

const statusIcons = {
  PENDIENTE: <FaClock className="text-orange-500 text-lg" />,
  EN_PROGRESO: <MdInfoOutline className="text-blue-500 text-lg" />,
  COMPLETADO: <FaCheckCircle className="text-green-500 text-lg" />,
  CANCELADO: <FaTimesCircle className="text-red-500 text-lg" />,
};

// Componente para renderizar las opciones de usuario en el select
const CustomUserOption = ({ data, innerRef, innerProps }) => (
  <div
    ref={innerRef}
    {...innerProps}
    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
  >
    {data.thumbnail ? (
      <img
        src={data.thumbnail}
        alt={data.label}
        className="w-6 h-6 rounded-full object-cover mr-2"
      />
    ) : (
      <div className="w-6 h-6 bg-gray-300 rounded-full text-white flex items-center justify-center mr-2 text-xs font-semibold">
        {data.label
          ?.split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </div>
    )}
    <div>
      <p className="text-sm text-gray-800 dark:text-white">{data.label}</p>
      <p className="text-xs text-gray-500">{data.email}</p>
    </div>
  </div>
);

const DeadlineFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  projectId,
  onSuccess = null,
}) => {
  const isEditing = Boolean(initialData);
  const { data: team = [] } = useProjectTeam(projectId);

  const userOptions = team.map((u) => ({
    label: u.name,
    value: u.id, // ← id ya es el del usuario real
    email: u.email,
    thumbnail: FormattedUrlImage(u.thumbnail) || null,
  }));

  const [deadline, setDeadline] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'PENDIENTE',
    users: [],
    id: null,
  });
  const [deletedTaskIds, setDeletedTaskIds] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    name: '',
    date: '',
    description: '',
    users: [],
    status: 'PENDIENTE',
  });

  const createDeadline = useCreateDeadline(projectId);
  const updateDeadline = useUpdateDeadline(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  useEffect(() => {
    if (isEditing && initialData) {
      setDeadline({
        ...initialData,
        users:
          initialData.users?.map((u) => ({
            label: `${u.firstName} ${u.lastName}`,
            value: u.id,
            email: u.email,
            thumbnail: FormattedUrlImage(u.photo?.[0]?.thumbnail),
          })) || [],
      });
      setTasks(
        (initialData.tasks || []).map((t) => ({
          ...t,
          users:
            t.users?.map((u) => ({
              label: `${u.firstName} ${u.lastName}`,
              value: u.id,
              email: u.email,
              thumbnail: FormattedUrlImage(u.photo?.[0]?.thumbnail),
            })) || [],
          _isLocal: false,
        })),
      );

      setOriginalTasks(initialData.tasks || []);
    } else {
      setDeadline({
        name: '',
        description: '',
        dueDate: '',
        status: 'PENDIENTE',
        users: [],
        id: null,
      });
      setTasks([]);
      setOriginalTasks([]);
    }
    setNewTask({
      name: '',
      date: '',
      description: '',
      users: [],
      status: 'PENDIENTE',
    });
    setDeletedTaskIds([]);
  }, [initialData, isEditing]);

  const handleAddTask = () => {
    if (!newTask.name || !newTask.date) return;
    const id = uuidv4();
    setTasks((prev) => [
      ...prev,
      {
        id,
        ...newTask,
        order: prev.length,
        _isLocal: true,
      },
    ]);
    setNewTask({
      name: '',
      date: '',
      description: '',
      users: [],
      status: 'PENDIENTE',
    });
  };

  const handleSubmit = async () => {
    // 🔧 Normalizar usuarios del deadline
    const deadlineUsers =
      deadline.users
        ?.map((u) => {
          if (typeof u === 'string') return u;
          if (u && typeof u === 'object') return u.value ?? u.id;
          return null;
        })
        .filter(Boolean) || [];

    const payload = { ...deadline, users: deadlineUsers };

    if (isEditing) {
      await updateDeadline.mutateAsync({ id: deadline.id, data: payload });

      await Promise.all(
        tasks.map(async (task) => {
          const taskUsers =
            task.users?.map((u) =>
              typeof u === 'object' ? u.value || u.id : u,
            ) || [];

          const taskData = {
            name: task.name,
            description: task.description,
            date: task.date,
            order: task.order,
            status: task.status || 'PENDIENTE',
            users: taskUsers,
            createdById: task.createdById || 'admin',
          };

          if (task._isLocal) {
            return createTask.mutateAsync({
              deadlineId: deadline.id,
              data: taskData,
            });
          }

          const original = originalTasks.find((t) => t.id === task.id);
          const hasChanged =
            !original ||
            original.name !== task.name ||
            original.description !== task.description ||
            original.date?.slice(0, 10) !== task.date?.slice(0, 10) ||
            original.status !== task.status ||
            JSON.stringify(original.users) !== JSON.stringify(taskUsers);

          if (hasChanged) {
            return updateTask.mutateAsync({ id: task.id, data: taskData });
          }
          return Promise.resolve();
        }),
      );

      await Promise.all(deletedTaskIds.map((id) => deleteTask.mutateAsync(id)));
      Notifies('success', 'Deadline actualizado');
    } else {
      const created = await createDeadline.mutateAsync(payload);
      const deadlineId = created?.id;

      if (!deadlineId) {
        return Notifies('error', 'Error al crear el deadline');
      }

      await Promise.all(
        tasks.map((task) => {
          const taskUsers =
            task.users?.map((u) =>
              typeof u === 'object' ? u.value || u.id : u,
            ) || [];

          return createTask.mutateAsync({
            deadlineId,
            data: {
              name: task.name,
              description: task.description,
              date: task.date,
              order: task.order,
              status: task.status || 'PENDIENTE',
              users: taskUsers,
              createdById: created.createdById || 'admin',
            },
          });
        }),
      );

      Notifies('success', 'Deadline creado con éxito');
    }

    onSuccess?.();
  };

  const loadUsers = (inputValue, callback) => {
    const selectedValues = deadline.users?.map((u) => u.value) || [];
    const filtered = userOptions
      .filter((u) => u.label.toLowerCase().includes(inputValue.toLowerCase()))
      .filter((u) => !selectedValues.includes(u.value));
    callback(filtered);
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
                {/* Nombre del Deadline */}
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
                {/* Fecha de vencimiento */}
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
              {/* Descripción del Deadline */}
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
              {/* Estado y Usuarios del Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <FaTasks className="text-gray-500 dark:text-gray-400" />
                      Estado del Deadline
                    </span>
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={deadline.status}
                    onChange={(e) =>
                      setDeadline({ ...deadline, status: e.target.value })
                    }
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROGRESO">En progreso</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-gray-500 dark:text-gray-400" />
                      Asignar Usuarios
                    </span>
                  </label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    closeMenuOnSelect={false}
                    defaultOptions={userOptions}
                    loadOptions={loadUsers}
                    components={{ Option: CustomUserOption }}
                    value={userOptions.filter((opt) =>
                      deadline.users?.some((u) =>
                        typeof u === 'object'
                          ? u.value === opt.value || u.id === opt.value
                          : u === opt.value,
                      ),
                    )}
                    onChange={(selected) =>
                      setDeadline({ ...deadline, users: selected })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FaTasks className="text-sinabe-primary" /> Tareas del Deadline
              </h3>

              {/* Formulario para nueva tarea */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 lg:col-span-5 flex flex-col gap-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MdOutlineTaskAlt className="text-gray-500" /> Nombre de la
                    tarea
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 p-2"
                    value={newTask.name}
                    onChange={(e) =>
                      setNewTask({ ...newTask, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-5 flex flex-col gap-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MdOutlineCalendarToday className="text-gray-500" /> Fecha
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 p-2"
                    value={newTask.date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, date: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-2 flex items-end">
                  <button
                    onClick={handleAddTask}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 w-full"
                  >
                    <FaPlus /> Agregar
                  </button>
                </div>
                <div className="col-span-12">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MdTextFields className="text-gray-500" /> Descripción
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 p-2"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Lista de tareas */}
              {tasks.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  <MdOutlineTaskAlt className="text-4xl mx-auto mb-2" />
                  <p>No hay tareas definidas</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {tasks.map((task, i) => (
                    <li
                      key={task.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Nombre Tarea */}
                        <div className="md:col-span-4">
                          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                            {statusIcons[task.status || 'PENDIENTE']} Nombre
                          </label>
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) =>
                              setTasks(
                                tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, name: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm p-2 border rounded-md"
                          />
                        </div>

                        {/* Estado Tarea */}
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Estado
                          </label>
                          <select
                            value={task.status || 'PENDIENTE'}
                            onChange={(e) =>
                              setTasks(
                                tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, status: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm p-2 border rounded-md"
                          >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="EN_PROGRESO">En Progreso</option>
                            <option value="COMPLETADO">Completado</option>
                            <option value="CANCELADO">Cancelado</option>
                          </select>
                        </div>

                        {/* Fecha Tarea */}
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Fecha
                          </label>
                          <input
                            type="date"
                            value={task.date?.slice(0, 10) || ''}
                            onChange={(e) =>
                              setTasks(
                                tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, date: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm p-2 border rounded-md"
                          />
                        </div>

                        {/* Botón Eliminar Tarea */}
                        <div className="md:col-span-2 flex items-start justify-end pt-5">
                          <button
                            onClick={() => {
                              if (!task._isLocal) {
                                setDeletedTaskIds((prev) => [...prev, task.id]);
                              }
                              setTasks(tasks.filter((t) => t.id !== task.id));
                              setOriginalTasks(
                                originalTasks.filter((t) => t.id !== task.id),
                              );
                            }}
                            title="Eliminar tarea"
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <FaTrashAlt /> Eliminar
                          </button>
                        </div>

                        {/* Descripción Tarea */}
                        <div className="md:col-span-6">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Descripción
                          </label>
                          <textarea
                            value={task.description}
                            onChange={(e) =>
                              setTasks(
                                tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, description: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full text-sm p-2 border rounded-md"
                          />
                        </div>

                        {/* Usuarios Tarea */}
                        <div className="md:col-span-6">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Asignar Usuarios
                          </label>
                          <AsyncSelect
                            isMulti
                            cacheOptions
                            closeMenuOnSelect={false}
                            defaultOptions={userOptions}
                            loadOptions={loadUsers}
                            components={{ Option: CustomUserOption }}
                            value={userOptions.filter((opt) =>
                              task.users?.some(
                                (tu) =>
                                  tu.value === opt.value || tu === opt.value,
                              ),
                            )}
                            onChange={(selected) =>
                              setTasks(
                                tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, users: selected }
                                    : t,
                                ),
                              )
                            }
                          />
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
