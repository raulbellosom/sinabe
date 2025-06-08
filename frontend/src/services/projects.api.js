import api from './api';

// CRUD de proyectos
export const fetchProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const searchProjects = (term) =>
  api.get(`/projects/search?searchTerm=${encodeURIComponent(term)}`);
export const getProjectSummary = (id) => api.get(`/projects/${id}/summary`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// verticales
export const getProjectVerticals = () => api.get('/project-verticals');
export const createProjectVertical = (data) =>
  api.post('/project-verticals', data);
