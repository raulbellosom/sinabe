// hooks/useInvoices.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInvoicesByOrderId,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInventoriesByInvoice,
  assignInventoriesToInvoice,
  removeInventoryFromInvoice,
  searchInvoicesByOrderId,
} from '../services/invoice.api';

// 🧾 Obtener todas las facturas de una orden de compra
export const useInvoices = (orderId) =>
  useQuery({
    queryKey: ['invoices', orderId],
    queryFn: () => getInvoicesByOrderId(orderId).then((res) => res.data),
    enabled: !!orderId,
  });

// 🔍 Obtener detalle de una factura específica
export const useInvoice = (orderId, invoiceId) =>
  useQuery({
    queryKey: ['invoice', orderId, invoiceId],
    queryFn: () => getInvoiceById(orderId, invoiceId).then((res) => res.data),
    enabled: !!orderId && !!invoiceId,
  });

// ➕ Crear factura (PDF/XML)
export const useCreateInvoice = (orderId, projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createInvoice(orderId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', orderId] });
      qc.invalidateQueries({ queryKey: ['purchase-orders', projectId] });

      // 👇 Agregado
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project-search'] });
      qc.invalidateQueries({ queryKey: ['search-projects'] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['project-summary', projectId] });
    },
  });
};

// ✏️ Actualizar factura (PDF/XML)
export const useUpdateInvoice = (orderId, projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, formData }) =>
      updateInvoice(orderId, invoiceId, formData),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['invoices', orderId] });
      qc.invalidateQueries({
        queryKey: ['invoice', orderId, vars.invoiceId],
      });
      qc.invalidateQueries({ queryKey: ['purchase-orders', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project-search'] });
      qc.invalidateQueries({ queryKey: ['search-projects'] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['project-summary', projectId] });
    },
  });
};

// 🗑️ Eliminar factura
export const useDeleteInvoice = (orderId, projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId) => deleteInvoice(orderId, invoiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', orderId] });
      qc.invalidateQueries({ queryKey: ['purchase-orders', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project-search'] });
      qc.invalidateQueries({ queryKey: ['search-projects'] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['project-summary', projectId] });
    },
  });
};

// 📄 Obtener inventarios asociados a una factura
export const useInvoiceInventories = (orderId, invoiceId) =>
  useQuery({
    queryKey: ['invoice-inventories', orderId, invoiceId],
    queryFn: () =>
      getInventoriesByInvoice(orderId, invoiceId).then((res) => res.data),
    enabled: !!orderId && !!invoiceId,
  });

// ⚙️ Asignar inventarios a una factura
export const useAssignInventoriesToInvoice = (orderId, invoiceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inventoryIds) =>
      assignInventoriesToInvoice(orderId, invoiceId, inventoryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoice-inventories', orderId, invoiceId],
      });
      queryClient.invalidateQueries({ queryKey: ['invoices', orderId] });
      queryClient.invalidateQueries({
        queryKey: ['invoice', orderId, invoiceId],
      });
    },
  });
};

// 🛠️ Desasignar un inventario de una factura
export const useRemoveInventoryFromInvoice = (orderId, invoiceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inventoryId) =>
      removeInventoryFromInvoice(orderId, invoiceId, inventoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoice-inventories', orderId, invoiceId],
      });
      queryClient.invalidateQueries({ queryKey: ['invoices', orderId] });
      queryClient.invalidateQueries({
        queryKey: ['invoice', orderId, invoiceId],
      });
    },
  });
};

export const useSearchInvoices = (orderId, params) => {
  return useQuery({
    queryKey: ['invoices', orderId, 'search', params],
    queryFn: () =>
      searchInvoicesByOrderId(orderId, params).then((res) => res.data),
    enabled: !!orderId,
  });
};
