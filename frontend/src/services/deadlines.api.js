import api from './api';

// 📅 Deadlines
export const getDeadlinesByProjectId = (projectId) =>
  api.get(`/deadlines/projects/${projectId}`);

export const createDeadline = async (projectId, data) => {
  const response = await api.post(`/deadlines/projects/${projectId}`, data);
  return response.data; // debe incluir al menos { id }
};

export const updateDeadline = (id, data) => api.put(`/deadlines/${id}`, data);

export const deleteDeadline = (id) => api.delete(`/deadlines/${id}`);

// 🔗 Inventarios asignados a deadline
export const assignInventoryToDeadline = (deadlineId, inventoryId) =>
  api.post(`/deadlines/${deadlineId}/assign`, { inventoryId });

export const unassignInventoryFromDeadline = (deadlineId, inventoryId) =>
  api.delete(`/deadlines/${deadlineId}/unassign/${inventoryId}`);

export const getInventoriesByDeadline = (deadlineId) =>
  api.get(`/deadlines/${deadlineId}/inventories`);

// 📌 TASKS de deadline

// Crear nueva tarea
export const createTask = (deadlineId, taskData) =>
  api.post(`/deadlines/${deadlineId}/task`, taskData);

// Actualizar tarea
export const updateTask = (taskId, taskData) =>
  api.put(`/deadlines/task/${taskId}`, taskData);

// Eliminar tarea
export const deleteTask = (taskId) => api.delete(`/deadlines/task/${taskId}`);

// Reordenar tareas
export const reorderTasks = (taskList) =>
  api.post(`/deadlines/task/reorder`, taskList);
