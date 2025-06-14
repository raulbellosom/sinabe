import api from './api';

// 👥 Obtener miembros del proyecto
export const getProjectTeam = (projectId) =>
  api.get(`/project-team/projects/${projectId}/team`);

// 🔍 Buscar usuarios disponibles
export const searchAvailableUsers = async (query, projectId) => {
  const response = await api.get(`/project-team/users/search`, {
    params: {
      q: query,
      projectId,
    },
  });
  return response.data;
};

// ➕ Agregar usuario al proyecto
export const addUserToProject = async (projectId, userId, role) => {
  const response = await api.post(`/project-team/projects/${projectId}/team`, {
    userId,
    role,
  });
  return response.data; // debe incluir el projectUser creado o actualizado
};

export const updateProjectMember = async (projectId, memberId, data) => {
  const response = await api.put(
    `/project-team/projects/${projectId}/team/${memberId}`,
    data,
  );
  return response.data;
};

// ❌ Eliminar usuario del proyecto
export const removeUserFromProject = (projectId, userId) =>
  api.delete(`/project-team/projects/${projectId}/team/${userId}`);
