// hooks/usePurchaseOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPurchaseOrdersByProjectId,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  searchPurchaseOrders,
  assignPurchaseOrderToProject,
  removePurchaseOrderFromProject,
  createPurchaseOrderWithoutProject,
  getUnassignedPurchaseOrders,
  searchUnassignedPurchaseOrders,
} from '../services/purchaseOrders.api';

// 📦 Obtener órdenes de compra de un proyecto
export const usePurchaseOrders = (projectId) =>
  useQuery({
    queryKey: ['purchase-orders', projectId],
    queryFn: () =>
      getPurchaseOrdersByProjectId(projectId).then((res) => res.data),
    enabled: !!projectId,
  });

// 🔎 Buscar órdenes de compra (incluye filtros y paginación)
export const useSearchPurchaseOrders = (projectId, params) =>
  useQuery({
    queryKey: ['purchase-orders', projectId, 'search', params],
    queryFn: () =>
      searchPurchaseOrders(projectId, params).then((res) => res.data),
    enabled: true, // ahora siempre se ejecuta, aunque projectId sea null
  });

// ➕ Crear orden de compra
export const useCreatePurchaseOrder = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createPurchaseOrder(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', projectId],
      });
    },
  });
};

// ✏️ Actualizar orden de compra
export const useUpdatePurchaseOrder = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-search'] });
      queryClient.invalidateQueries({ queryKey: ['search-projects'] });
      queryClient.invalidateQueries({
        queryKey: ['project-summary', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

// ❌ Eliminar orden de compra (lógica)
export const useDeletePurchaseOrder = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', projectId],
      });
    },
  });
};

// 🔗 Asignar orden de compra a un proyecto
export const useAssignPurchaseOrderToProject = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => assignPurchaseOrderToProject(projectId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-search'] });
      queryClient.invalidateQueries({ queryKey: ['search-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['project-summary', projectId],
      });
    },
  });
};

// 🔗 Remover orden de compra de un proyecto
export const useRemovePurchaseOrderFromProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, purchaseOrderId }) =>
      removePurchaseOrderFromProject(projectId, purchaseOrderId),
    onSuccess: (data, variables) => {
      const { projectId } = variables;

      // Invalidar el listado general (sin proyecto)
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', null, 'search'],
        exact: false,
      });

      // Invalidar por proyecto específico
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: ['purchase-orders', projectId],
        });
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        queryClient.invalidateQueries({
          queryKey: ['project-summary', projectId],
        });
      }

      // Opcional: invalidar lista de proyectos en general
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-search'] });
      queryClient.invalidateQueries({ queryKey: ['search-projects'] });
    },
  });
};

// ➕ Crear orden de compra sin proyecto asignado
export const useCreatePurchaseOrderWithoutProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createPurchaseOrderWithoutProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

// 🔍 Obtener órdenes de compra sin asignar a ningún proyecto
export const useGetUnassignedPurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchase-orders', 'without-project'],
    queryFn: async () => {
      const { data } = await getUnassignedPurchaseOrders(); // <-- aquí
      return data; // ⬅️ porque api.get devuelve { data: [...] }
    },
  });
};

// hooks/usePurchaseOrders.js
export const useSearchUnassignedPurchaseOrders = () => {
  return useMutation({
    mutationFn: async (query) => {
      const { data } = await searchUnassignedPurchaseOrders(query);
      return data;
    },
  });
};
