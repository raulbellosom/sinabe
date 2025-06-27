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
export const useCreateInvoice = (orderId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createInvoice(orderId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orderId] });
    },
  });
};

// ✏️ Actualizar factura (PDF/XML)
export const useUpdateInvoice = (orderId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, formData }) =>
      updateInvoice(orderId, invoiceId, formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orderId] });
      queryClient.invalidateQueries({
        queryKey: ['invoice', orderId, variables.invoiceId],
      });
    },
  });
};

// 🗑️ Eliminar factura
export const useDeleteInvoice = (orderId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId) => deleteInvoice(orderId, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orderId] });
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
