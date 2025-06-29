// services/purchaseOrders.api.js
import api from './api';

// 📦 Órdenes de compra por proyecto
export const getPurchaseOrdersByProjectId = (projectId) =>
  api.get(`/purchase-orders/projects/${projectId}`);

// ➕ Crear orden de compra
export const createPurchaseOrder = (projectId, data) =>
  api.post(`/purchase-orders/projects/${projectId}`, data);

// ✏️ Actualizar orden de compra
export const updatePurchaseOrder = (id, data) =>
  api.put(`/purchase-orders/${id}`, data);

// ❌ Eliminar (lógico) orden de compra
export const deletePurchaseOrder = (id) => api.delete(`/purchase-orders/${id}`);

// 🔗 Asignar orden de compra a un proyecto
export const assignPurchaseOrderToProject = (projectId, orderId) =>
  api.put(
    `/purchase-orders/projects/${projectId}/orders/${orderId}/assign`,
    {},
  );

// 🔗 Remover orden de compra de un proyecto
export const removePurchaseOrderFromProject = (projectId, orderId) =>
  api.delete(`/purchase-orders/projects/${projectId}/orders/${orderId}/remove`);

// ➕ Crear orden de compra sin proyecto asignado
export const createPurchaseOrderWithoutProject = (data) =>
  api.post('/purchase-orders/without-project', data);

// 🔍 Obtener órdenes de compra sin asignar a ningún proyecto
export const getUnassignedPurchaseOrders = () =>
  api.get('/purchase-orders/without-project');

// services/purchaseOrders.service.js
export const searchUnassignedPurchaseOrders = (query) =>
  api.get(`/purchase-orders/without-project/search`, {
    params: { query },
  });

// 🔎 Buscar órdenes de compra (incluye filtros y paginación)
//    params: { searchTerm, statuses, sortBy, order, page, pageSize }
export const searchPurchaseOrders = (projectId, params) => {
  if (projectId) {
    return api.get(`/purchase-orders/projects/${projectId}/search`, { params });
  } else {
    return api.get(`/purchase-orders/search`, { params });
  }
};
