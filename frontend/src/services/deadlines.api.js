import api from './api';

// 📅 Deadlines
export const getDeadlinesByProjectId = (projectId) =>
  api.get(`/projects/${projectId}`);

export const createDeadline = (projectId, data) =>
  api.post(`/projects/${projectId}`, data);

export const updateDeadline = (id, data) => api.put(`/deadlines/${id}`, data);

export const deleteDeadline = (id) => api.delete(`/deadlines/${id}`);

// 🔗 Inventarios asignados a deadline
export const assignInventoryToDeadline = (deadlineId, inventoryId) =>
  api.post(`/deadlines/${deadlineId}/assign`, { inventoryId });

export const unassignInventoryFromDeadline = (deadlineId, inventoryId) =>
  api.delete(`/deadlines/${deadlineId}/unassign/${inventoryId}`);

export const getInventoriesByDeadline = (deadlineId) =>
  api.get(`/deadlines/${deadlineId}/inventories`);
