import api from './api';

// CRUD de proyectos
export const fetchProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const searchProjects = async ({
  searchTerm,
  statuses,
  verticalIds,
  sortBy,
  order,
  page = 1,
  pageSize = 10,
}) => {
  const response = await api.get('/projects/search', {
    params: {
      searchTerm,
      statuses,
      verticalIds,
      sortBy,
      order,
      page,
      pageSize,
    },
  });
  return response.data;
};

export const getProjectSummary = (id) => api.get(`/projects/${id}/summary`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
