import api from './api';

// 📦 Ordenes de compra
export const getPurchaseOrdersByProjectId = (projectId) =>
  api.get(`/projects/${projectId}`);

export const createPurchaseOrder = (projectId, data) =>
  api.post(`/projects/${projectId}`, data);

export const updatePurchaseOrder = (id, data) =>
  api.put(`/purchase-orders/${id}`, data);

export const deletePurchaseOrder = (id) => api.delete(`/purchase-orders/${id}`);

// 🧾 Facturas
export const addInvoiceToOrder = (orderId, formData) =>
  api.post(`/purchase-orders/${orderId}/invoices`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getInvoicesByOrderId = (orderId) =>
  api.get(`/purchase-orders/${orderId}/invoices`);
