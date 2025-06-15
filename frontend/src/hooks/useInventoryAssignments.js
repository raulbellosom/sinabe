import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assignInventoryToDeadline,
  getInventoryAssignmentsByDeadline,
  unassignInventoryFromDeadline,
} from '../services/inventoryAssignments.api';

export const useInventoryAssignments = (deadlineId) => {
  const queryClient = useQueryClient();

  const queryKey = ['inventory-assignments', deadlineId];

  // 📦 Obtener inventarios asignados
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getInventoryAssignmentsByDeadline(deadlineId),
    enabled: !!deadlineId,
  });

  // ➕ Asignar inventario
  const assignMutation = useMutation({
    mutationFn: assignInventoryToDeadline,
    onSuccess: () => queryClient.invalidateQueries(queryKey),
  });

  // ❌ Eliminar asignación
  const unassignMutation = useMutation({
    mutationFn: unassignInventoryFromDeadline,
    onSuccess: () => queryClient.invalidateQueries(queryKey),
  });

  return {
    assignments: data,
    isLoading,
    error,
    assignInventory: assignMutation.mutate,
    isAssigning: assignMutation.isLoading,
    unassignInventory: unassignMutation.mutate,
    isUnassigning: unassignMutation.isLoading,
  };
};
