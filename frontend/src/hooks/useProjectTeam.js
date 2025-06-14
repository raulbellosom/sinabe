// file: frontend/src/hooks/useProjectTeam.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectTeam,
  searchAvailableUsers,
  addUserToProject,
  removeUserFromProject,
} from '../services/projectTeam.api';

// 👥 Obtener miembros de un proyecto
export const useProjectTeam = (projectId) =>
  useQuery({
    queryKey: ['project-team', projectId],
    queryFn: () => getProjectTeam(projectId).then((res) => res.data),
    enabled: !!projectId,
  });

// 🔍 Buscar usuarios disponibles (con input controlado)
export const useSearchAvailableUsers = (query) =>
  useQuery({
    queryKey: ['search-users', query],
    queryFn: () => searchAvailableUsers(query),
    enabled: !!query && query.length > 1,
  });

// ➕ Agregar usuario al equipo
export const useAddUserToProject = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => addUserToProject(projectId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', projectId] });
    },
  });
};

import { updateProjectMember as updateProjectMemberApi } from '../services/projectTeam.api';

export const useUpdateProjectMember = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProjectMemberApi(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', projectId] });
    },
  });
};

// ❌ Remover usuario del equipo
export const useRemoveUserFromProject = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => removeUserFromProject(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', projectId] });
    },
  });
};
