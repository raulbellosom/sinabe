// hooks/usePurchaseOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPurchaseOrdersByProjectId,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  searchPurchaseOrders,
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
    enabled: !!projectId,
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
