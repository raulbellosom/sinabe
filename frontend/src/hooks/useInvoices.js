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
  // 🆕 Facturas independientes
  getIndependentInvoices,
  searchIndependentInvoices,
  createIndependentInvoice,
  getIndependentInvoiceById,
  updateIndependentInvoice,
  deleteIndependentInvoice,
  getInventoriesByIndependentInvoice,
  assignInventoriesToIndependentInvoice,
  removeInventoryFromIndependentInvoice,
  searchAllInvoices,
  assignInvoiceToPurchaseOrder,
  removeInvoiceFromPurchaseOrder,
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
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] }); // Para que se actualice en la página principal
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
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] }); // Para que se actualice en la página principal
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

// ===============================================
// 🆕 HOOKS PARA FACTURAS INDEPENDIENTES
// ===============================================

// 📄 Obtener todas las facturas independientes
export const useIndependentInvoices = () =>
  useQuery({
    queryKey: ['independent-invoices'],
    queryFn: () => getIndependentInvoices().then((res) => res.data),
  });

// 🔍 Buscar facturas independientes
export const useSearchIndependentInvoices = (params) =>
  useQuery({
    queryKey: ['independent-invoices', 'search', params],
    queryFn: () => searchIndependentInvoices(params).then((res) => res.data),
    enabled: !!params,
  });

// ➕ Crear factura independiente
export const useCreateIndependentInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createIndependentInvoice(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
    },
  });
};

// 🔍 Obtener detalle de factura independiente
export const useIndependentInvoice = (invoiceId) =>
  useQuery({
    queryKey: ['independent-invoice', invoiceId],
    queryFn: () => getIndependentInvoiceById(invoiceId).then((res) => res.data),
    enabled: !!invoiceId,
  });

// ✏️ Actualizar factura independiente
export const useUpdateIndependentInvoice = (invoiceId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => updateIndependentInvoice(invoiceId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['independent-invoice', invoiceId] });
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
    },
  });
};

// 🗑️ Eliminar factura independiente
export const useDeleteIndependentInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId) => deleteIndependentInvoice(invoiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
    },
  });
};

// 📦 Obtener inventarios de factura independiente
export const useIndependentInvoiceInventories = (invoiceId) =>
  useQuery({
    queryKey: ['independent-invoice-inventories', invoiceId],
    queryFn: () =>
      getInventoriesByIndependentInvoice(invoiceId).then((res) => res.data),
    enabled: !!invoiceId,
  });

// ⚙️ Asignar inventarios a factura independiente
export const useAssignInventoriesToIndependentInvoice = (invoiceId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inventoryIds) =>
      assignInventoriesToIndependentInvoice(invoiceId, inventoryIds),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['independent-invoice-inventories', invoiceId],
      });
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['independent-invoice', invoiceId] });
      qc.invalidateQueries({ queryKey: ['all-invoices'] }); // Para que se actualice en la página principal
      // Invalidar inventarios para que se actualice su estado de asignación
      qc.invalidateQueries({ queryKey: ['inventories'] });
    },
  });
};

// 🛠️ Desasignar inventario de factura independiente
export const useRemoveInventoryFromIndependentInvoice = (invoiceId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inventoryId) =>
      removeInventoryFromIndependentInvoice(invoiceId, inventoryId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['independent-invoice-inventories', invoiceId],
      });
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['independent-invoice', invoiceId] });
      qc.invalidateQueries({ queryKey: ['all-invoices'] }); // Para que se actualice en la página principal
      // Invalidar inventarios para que se actualice su estado de asignación
      qc.invalidateQueries({ queryKey: ['inventories'] });
    },
  });
};

// 🔍 Buscar TODAS las facturas (independientes + con orden de compra)
export const useSearchAllInvoices = (params) =>
  useQuery({
    queryKey: ['all-invoices', 'search', params],
    queryFn: () => searchAllInvoices(params).then((res) => res.data),
    enabled: params !== null && params !== undefined,
  });

// 🔗 Asignar factura a orden de compra
export const useAssignInvoiceToPurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, purchaseOrderId }) =>
      assignInvoiceToPurchaseOrder(invoiceId, purchaseOrderId),
    onSuccess: (_, { invoiceId, purchaseOrderId }) => {
      // Invalidar facturas independientes
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['independent-invoice', invoiceId] });

      // Invalidar facturas de la orden de compra
      qc.invalidateQueries({ queryKey: ['invoices', purchaseOrderId] });

      // Invalidar búsquedas
      qc.invalidateQueries({ queryKey: ['all-invoices'] });

      // Invalidar órdenes de compra para que se actualice la info
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({
        queryKey: ['purchase-order-all-inventories', purchaseOrderId],
      });
    },
  });
};

// 🔓 Remover factura de orden de compra
export const useRemoveInvoiceFromPurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId) => removeInvoiceFromPurchaseOrder(invoiceId),
    onSuccess: (data, invoiceId) => {
      // Invalidar facturas independientes
      qc.invalidateQueries({ queryKey: ['independent-invoices'] });
      qc.invalidateQueries({ queryKey: ['independent-invoice', invoiceId] });

      // Invalidar todas las facturas de órdenes de compra
      qc.invalidateQueries({ queryKey: ['invoices'] });

      // Invalidar búsquedas
      qc.invalidateQueries({ queryKey: ['all-invoices'] });

      // Invalidar órdenes de compra
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['purchase-order-all-inventories'] });
    },
  });
};

// Alias para compatibilidad - obtener facturas por orden de compra
export const useGetInvoicesByOrderId = (orderId) => useInvoices(orderId);
