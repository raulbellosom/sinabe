// src/components/ProjectDetails/DeadlineFormModal.jsx
import React, { useState, useEffect, act } from 'react';
import ReusableModal from '../../components/Modals/ReusableModal';
import AsyncSelect from 'react-select/async';
import { v4 as uuidv4 } from 'uuid';
import Notifies from '../../components/Notifies/Notifies';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import {
  useCreateDeadline,
  useUpdateDeadline,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '../../hooks/useDeadlines';
import { useProjectTeam } from '../../hooks/useProjectTeam';
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
  FaInfoCircle as FaInfo,
} from 'react-icons/fa';
import {
  MdInfoOutline,
  MdOutlineCalendarToday,
  MdOutlineTaskAlt,
  MdTextFields,
} from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import ActionButtons from '../ActionButtons/ActionButtons';

const statusIcons = {
  PENDIENTE: <FaClock className="text-yellow-500 text-lg" />,
  EN_PROGRESO: <MdInfoOutline className="text-blue-500 text-lg" />,
  COMPLETADO: <FaCheckCircle className="text-green-500 text-lg" />,
  CANCELADO: <FaTimesCircle className="text-red-500 text-lg" />,
};

const borderColor = {
  PENDIENTE: 'border-yellow-500',
  EN_PROGRESO: 'border-blue-500',
  COMPLETADO: 'border-green-500',
  CANCELADO: 'border-red-500',
};

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
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2 text-xs font-semibold">
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
    value: u.id,
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
  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [deletedTaskIds, setDeletedTaskIds] = useState([]);
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

  const loadUsers = (inputValue, callback) => {
    const selectedIds = deadline.users.map((u) => u.value);
    const filtered = userOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedIds.includes(opt.value),
    );
    callback(filtered);
  };

  const handleAddTask = () => {
    if (!newTask.name || !newTask.date) return;
    const id = uuidv4();
    setTasks((prev) => [
      ...prev,
      { id, ...newTask, order: prev.length, _isLocal: true },
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
    const deadlineUsers = (deadline.users || [])
      .map((u) => (typeof u === 'object' ? u.value : u))
      .filter(Boolean);
    const payload = { ...deadline, users: deadlineUsers };
    if (isEditing) {
      await updateDeadline.mutateAsync({ id: deadline.id, data: payload });
      await Promise.all(
        tasks.map(async (task) => {
          const users = (task.users || [])
            .map((u) => (typeof u === 'object' ? u.value : u))
            .filter(Boolean);
          const data = {
            name: task.name,
            description: task.description,
            date: task.date,
            order: task.order,
            status: task.status || 'PENDIENTE',
            users,
            createdById: task.createdById || 'admin',
          };
          if (task._isLocal)
            return createTask.mutateAsync({ deadlineId: deadline.id, data });
          const orig = originalTasks.find((t) => t.id === task.id);
          const changed =
            !orig ||
            orig.name !== task.name ||
            orig.description !== task.description ||
            orig.date?.slice(0, 10) !== task.date?.slice(0, 10) ||
            orig.status !== task.status ||
            JSON.stringify(orig.users) !== JSON.stringify(users);
          if (changed) return updateTask.mutateAsync({ id: task.id, data });
          return Promise.resolve();
        }),
      );
      await Promise.all(
        deletedTaskIds.map((tid) => deleteTask.mutateAsync(tid)),
      );
      Notifies('success', 'Deadline actualizado');
    } else {
      const created = await createDeadline.mutateAsync(payload);
      const deadlineId = created?.id;
      if (!deadlineId) return Notifies('error', 'Error al crear el deadline');
      await Promise.all(
        tasks.map((task) => {
          const users = (task.users || [])
            .map((u) => (typeof u === 'object' ? u.value : u))
            .filter(Boolean);
          return createTask.mutateAsync({
            deadlineId,
            data: {
              name: task.name,
              description: task.description,
              date: task.date,
              order: task.order,
              status: task.status || 'PENDIENTE',
              users,
              createdById: created.createdById || 'admin',
            },
          });
        }),
      );
      Notifies('success', 'Deadline creado con éxito');
    }
    onSuccess?.();
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Deadline' : 'Crear Deadline'}
      size="xl"
      actions={[
        { label: 'Cancelar', color: 'stone', icon: IoMdClose, action: onClose },
        {
          label: isEditing ? 'Guardar cambios' : 'Crear',
          color: 'purple',
          filled: true,
          icon: FaSave,
          action: handleSubmit,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Deadline Info */}
        <div className="dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            {' '}
            <FaInfo /> Información del Deadline
          </h2>
          <div className="mt-4 grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaInfoCircle className="mr-1" /> Titulo del Deadline
              </label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 p-2"
                value={deadline.name}
                onChange={(e) =>
                  setDeadline({ ...deadline, name: e.target.value })
                }
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaCalendarAlt className="mr-1" /> Vencimiento
              </label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 p-2"
                value={deadline.dueDate?.slice(0, 10)}
                onChange={(e) =>
                  setDeadline({ ...deadline, dueDate: e.target.value })
                }
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaTasks className="mr-1" /> Estado
              </label>
              <select
                className="w-full rounded-md border-gray-300 p-2"
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
          </div>
          <div className="mt-4">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MdTextFields className="mr-1" /> Descripción
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border-gray-300 p-2"
              value={deadline.description}
              onChange={(e) =>
                setDeadline({ ...deadline, description: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaUser className="mr-1" /> Usuarios
            </label>
            <AsyncSelect
              isMulti
              cacheOptions
              closeMenuOnSelect={false}
              defaultOptions={userOptions}
              loadOptions={loadUsers}
              components={{ Option: CustomUserOption }}
              value={userOptions.filter((opt) =>
                deadline.users.some((u) => (u.value || u) === opt.value),
              )}
              onChange={(sel) => setDeadline({ ...deadline, users: sel })}
              className="w-full"
              styles={{
                multiValue: (base) => ({ ...base, backgroundColor: '#E0E7FF' }),
              }}
            />
          </div>
        </div>
        {/* Tasks */}
        <div className="dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaTasks className="mr-1" /> Tareas
          </h3>
          {/* New Task */}
          <div className="grid grid-cols-12 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <div className="col-span-12 flex items-center text-purple-600 font-medium mb-2">
              <FaPlus className="mr-1" /> Añadir Tarea
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MdOutlineTaskAlt className="mr-1" /> Titulo de la Tarea
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
            <div className="col-span-6 md:col-span-3 flex flex-col">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MdOutlineCalendarToday className="mr-1" /> Fecha
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
            <div className="col-span-6 md:col-span-3 flex items-end">
              {/* <button
                onClick={handleAddTask}
                className="w-full bg-sinabe-secondary text-white py-2 rounded-md flex items-center justify-center gap-2"
              >
                <FaPlus /> Añadir
              </button> */}
              <ActionButtons
                extraActions={[
                  {
                    action: handleAddTask,
                    label: 'Añadir',
                    color: 'purple',
                    icon: FaPlus,
                    filled: true,
                    className: 'min-w-full min-h-10 p-2',
                    disabled: !newTask.name || !newTask.date,
                  },
                ]}
              />
            </div>
            <div className="col-span-12 flex flex-col">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MdTextFields className="mr-1" /> Descripción
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border-gray-300 p-2"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
            </div>
            <div className="col-span-12">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaUser className="mr-1" /> Usuarios
              </label>
              <AsyncSelect
                isMulti
                cacheOptions
                closeMenuOnSelect={false}
                defaultOptions={userOptions}
                loadOptions={loadUsers}
                components={{ Option: CustomUserOption }}
                value={userOptions.filter((opt) =>
                  newTask.users.some((u) => (u.value || u) === opt.value),
                )}
                onChange={(sel) => setNewTask({ ...newTask, users: sel })}
                className="w-full"
                styles={{
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#E0E7FF',
                  }),
                }}
              />
            </div>
          </div>
          {/* Task List */}
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay tareas definidas
            </p>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 ${borderColor[task.status]}`}
                >
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 order-1 md:col-span-5 flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <MdOutlineTaskAlt className="mr-1" /> Titulo de la Tarea
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 p-2 mb-2"
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
                      />
                    </div>
                    <div className="col-span-6 order-2 md:col-span-3 flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <MdOutlineCalendarToday className="mr-1" /> Fecha
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border-gray-300 p-2 mb-2"
                        value={task.date?.slice(0, 10)}
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? { ...t, date: e.target.value }
                                : t,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="col-span-6 order-3 md:col-span-2 flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <MdInfoOutline className="mr-1" /> Estado
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 p-2 mb-2"
                        value={task.status}
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? { ...t, status: e.target.value }
                                : t,
                            ),
                          )
                        }
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROGRESO">En progreso</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                    <div className="col-span-12 order-7 md:order-4 md:col-span-2 flex flex-col items-end">
                      <label className="mb-1 md:mt-5" />
                      <ActionButtons
                        extraActions={[
                          {
                            action: () => {
                              if (!task._isLocal)
                                setDeletedTaskIds((prev) => [...prev, task.id]);
                              setTasks(tasks.filter((t) => t.id !== task.id));
                            },
                            label: 'Eliminar',
                            color: 'red',
                            icon: FaTrashAlt,
                            filled: true,
                            className: 'min-w-full max-h-fit min-h-10 p-2',
                          },
                        ]}
                      />
                    </div>
                    <div className="col-span-12 order-5 flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <MdTextFields className="mr-1" /> Descripción
                      </label>
                      <textarea
                        rows={2}
                        className="w-full rounded-md border-gray-300 p-2 mb-2"
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
                      />
                    </div>
                    <div className="col-span-12 order-6">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <FaUser className="mr-1" /> Usuarios
                      </label>
                      <AsyncSelect
                        isMulti
                        cacheOptions
                        closeMenuOnSelect={false}
                        defaultOptions={userOptions}
                        loadOptions={loadUsers}
                        components={{ Option: CustomUserOption }}
                        value={userOptions.filter((opt) =>
                          task.users.some((u) => (u.value || u) === opt.value),
                        )}
                        onChange={(sel) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id ? { ...t, users: sel } : t,
                            ),
                          )
                        }
                        className="w-full"
                        styles={{
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#E0E7FF',
                          }),
                        }}
                      />
                    </div>
                    {/* <div className="col-span-12 flex justify-end">
                      <button
                        onClick={() => {
                          if (!task._isLocal)
                            setDeletedTaskIds((prev) => [...prev, task.id]);
                          setTasks(tasks.filter((t) => t.id !== task.id));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrashAlt />
                      </button>
                    </div> */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ReusableModal>
  );
};

export default DeadlineFormModal;
