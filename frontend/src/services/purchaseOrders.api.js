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

// 🔎 Buscar órdenes de compra (incluye filtros y paginación)
//    params: { searchTerm, statuses, sortBy, order, page, pageSize }
export const searchPurchaseOrders = (projectId, params) =>
  api.get(`/purchase-orders/projects/${projectId}/search`, { params });
