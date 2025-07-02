// hooks/useInventoryAssignments.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assignInventoryToDeadline,
  getInventoryAssignmentsByDeadline,
  unassignInventoryFromDeadline,
} from '../services/inventoryAssignments.api';

// 📦 Obtener inventarios asignados a una deadline
export const useInventoryAssignments = (deadlineId) =>
  useQuery({
    queryKey: ['inventory-assignments', deadlineId],
    queryFn: async () => {
      const data = await getInventoryAssignmentsByDeadline(deadlineId);
      console.log(data);
      return data ?? []; // 👈 previene undefined
    },
    enabled: !!deadlineId,
  });

// ➕ Asignar inventario a una deadline
export const useAssignInventoryToDeadline = (deadlineId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inventoryId, quantity }) =>
      assignInventoryToDeadline({ deadlineId, inventoryId, quantity }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['inventory-assignments', deadlineId],
      }),
  });
};

// ❌ Remover inventario de una deadline
export const useRemoveInventoryFromDeadline = (deadlineId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId }) =>
      unassignInventoryFromDeadline(assignmentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['inventory-assignments', deadlineId],
      }),
  });
};
