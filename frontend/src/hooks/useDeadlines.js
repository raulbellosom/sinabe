// file: frontend/src/hooks/useDeadlines.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeadlinesByProjectId,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  assignInventoryToDeadline,
  unassignInventoryFromDeadline,
  getInventoriesByDeadline,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../services/deadlines.api';

// 📅 Obtener todos los deadlines de un proyecto
export const useDeadlinesByProject = (projectId) =>
  useQuery({
    queryKey: ['deadlines', projectId],
    queryFn: () => getDeadlinesByProjectId(projectId).then((res) => res.data),
    enabled: !!projectId,
  });

// ➕ Crear un deadline
export const useCreateDeadline = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createDeadline(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// ✏️ Editar un deadline
export const useUpdateDeadline = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateDeadline(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// ❌ Eliminar deadline (lógicamente)
export const useDeleteDeadline = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDeadline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// 🔗 Asignar inventario a un deadline
export const useAssignInventory = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deadlineId, inventoryId }) =>
      assignInventoryToDeadline(deadlineId, inventoryId),
    onSuccess: (_, { deadlineId }) => {
      queryClient.invalidateQueries({
        queryKey: ['inventories-deadline', deadlineId],
      });
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// 🔓 Desasignar inventario de un deadline
export const useUnassignInventory = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deadlineId, inventoryId }) =>
      unassignInventoryFromDeadline(deadlineId, inventoryId),
    onSuccess: (_, { deadlineId }) => {
      queryClient.invalidateQueries({
        queryKey: ['inventories-deadline', deadlineId],
      });
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// 📦 Obtener inventarios asignados a un deadline
export const useInventoriesByDeadline = (deadlineId) =>
  useQuery({
    queryKey: ['inventories-deadline', deadlineId],
    queryFn: () => getInventoriesByDeadline(deadlineId).then((res) => res.data),
    enabled: !!deadlineId,
  });

// ➕ Crear una tarea
export const useCreateTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deadlineId, data }) => createTask(deadlineId, data),
    onSuccess: (_, { deadlineId }) => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// ✏️ Actualizar tarea
export const useUpdateTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// ❌ Eliminar tarea
export const useDeleteTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};

// 🔃 Reordenar tareas
export const useReorderTasks = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskList) => reorderTasks(taskList),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', projectId] });
    },
  });
};
