import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVerticals,
  createVertical,
  updateVertical,
  deleteVertical,
  getVerticalsByModel,
  assignVerticalsToModel,
  removeVerticalFromModel,
} from '../services/verticals.api';
import { searchModels as apiSearchModels } from '../services/api';

// 🔍 Obtener todas las verticales activas con modelos, marcas, inventarios
export const useVerticals = () =>
  useQuery({
    queryKey: ['verticals'],
    queryFn: () => fetchVerticals().then((res) => res.data),
  });

// 🔍 Obtener verticales por modelo
export const useModelVerticals = (modelId) =>
  useQuery({
    queryKey: ['model-verticals', modelId],
    queryFn: () => getVerticalsByModel(modelId).then((res) => res.data),
    enabled: !!modelId,
  });

// ➕ Crear una nueva vertical
export const useCreateVertical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVertical,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
    },
  });
};

// ✏️ Actualizar una vertical existente
export const useUpdateVertical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVertical(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
    },
  });
};

// ❌ Eliminación lógica de vertical
export const useDeleteVertical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVertical,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
    },
  });
};

// 🔄 Asignar múltiples verticales a un modelo
export const useAssignVerticalsToModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modelId, verticalIds }) =>
      assignVerticalsToModel(modelId, verticalIds),
    onSuccess: (_data, { modelId }) => {
      queryClient.invalidateQueries(['model-verticals', modelId]);
    },
  });
};

// ❌ Eliminar una sola vertical de un modelo
export const useRemoveVerticalFromModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modelId, verticalId }) =>
      removeVerticalFromModel(modelId, verticalId),
    onSuccess: (_data, { modelId }) => {
      queryClient.invalidateQueries(['model-verticals', modelId]);
    },
  });
};

// 🔍 Hook para buscar modelos y devolverlos en { value, label }
export const useSearchModels = () => {
  return async (searchTerm, excludeVerticalId) => {
    const { data } = await apiSearchModels({
      searchTerm,
      sortBy: 'name',
      order: 'asc',
      page: 1,
      pageSize: 10,
      // sólo añades el filtro si viene definido
      ...(excludeVerticalId != null && { excludeVerticalId }),
    });
    return data.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.brand.name} - ${m.type.name})`,
    }));
  };
};
