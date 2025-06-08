import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProjects,
  getProject,
  getProjectSummary,
  createProject,
  updateProject,
  deleteProject,
  getProjectVerticals,
} from '../services/projects.api';

// 🔄 Obtener todos los proyectos activos
export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects().then((res) => res.data),
  });

// 📄 Obtener un solo proyecto por ID (para edición)
export const useProject = (id) =>
  useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id).then((res) => res.data),
    enabled: !!id,
  });

// 📊 Obtener resumen de un proyecto (para vista completa)
export const useProjectSummary = (id) =>
  useQuery({
    queryKey: ['project-summary', id],
    queryFn: () => getProjectSummary(id).then((res) => res.data),
    enabled: !!id,
  });

// ➕ Crear nuevo proyecto
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries(['project-search']);
    },
  });
};

// ✏️ Actualizar proyecto existente
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['project-search']);
      queryClient.invalidateQueries(['project', variables.id]); // 👈 clave
    },
  });
};

// ❌ Eliminación lógica del proyecto
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// 📋 Obtener verticales disponibles (catálogo)
export const useProjectVerticals = () =>
  useQuery({
    queryKey: ['project-verticals'],
    queryFn: () => getProjectVerticals().then((res) => res.data),
  });
