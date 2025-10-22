// services/invoice.api.js
import api from './api';

// 🧾 Obtener todas las facturas de una orden de compra
export const getInvoicesByOrderId = (orderId) =>
  api.get(`/purchase-orders/${orderId}/invoices`);

// ➕ Crear factura en una orden de compra (PDF/XML)
export const createInvoice = (orderId, formData) =>
  api.post(`/purchase-orders/${orderId}/invoices`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// 🔍 Obtener detalle de una factura
export const getInvoiceById = (orderId, invoiceId) =>
  api.get(`/purchase-orders/${orderId}/invoices/${invoiceId}`);

// ✏️ Actualizar factura (PDF/XML)
export const updateInvoice = (orderId, invoiceId, formData) =>
  api.put(`/purchase-orders/${orderId}/invoices/${invoiceId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// 🗑️ Eliminar (lógico) una factura
export const deleteInvoice = (orderId, invoiceId) =>
  api.delete(`/purchase-orders/${orderId}/invoices/${invoiceId}`);

// 📄 Obtener inventarios asociados a una factura
export const getInventoriesByInvoice = (orderId, invoiceId) =>
  api.get(`/purchase-orders/${orderId}/invoices/${invoiceId}/inventories`);

// ⚙️ Asignar inventarios a una factura
export const assignInventoriesToInvoice = (orderId, invoiceId, inventoryIds) =>
  api.post(`/purchase-orders/${orderId}/invoices/${invoiceId}/inventories`, {
    inventoryIds,
  });

// 🛠️ Desasignar un inventario de una factura
export const removeInventoryFromInvoice = (orderId, invoiceId, inventoryId) =>
  api.delete(
    `/purchase-orders/${orderId}/invoices/${invoiceId}/inventories/${inventoryId}`,
  );

// 🔍 Buscar facturas por orden de compra (incluye filtros y paginación)
export const searchInvoicesByOrderId = (orderId, params) =>
  api.get(`/purchase-orders/${orderId}/invoices/search`, { params });

// ===============================================
// 🆕 FACTURAS INDEPENDIENTES (SIN ORDEN DE COMPRA)
// ===============================================

// 📄 Obtener todas las facturas independientes
export const getIndependentInvoices = () => api.get('/invoices');

// 🔍 Buscar facturas independientes
export const searchIndependentInvoices = (params) =>
  api.get('/invoices/search', { params });

// ➕ Crear factura independiente (PDF/XML)
export const createIndependentInvoice = (formData) =>
  api.post('/invoices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// 🔍 Obtener detalle de factura independiente por ID
export const getIndependentInvoiceById = (invoiceId) =>
  api.get(`/invoices/${invoiceId}`);

// ✏️ Actualizar factura independiente (PDF/XML)
export const updateIndependentInvoice = (invoiceId, formData) =>
  api.put(`/invoices/${invoiceId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// 🗑️ Eliminar factura independiente
export const deleteIndependentInvoice = (invoiceId) =>
  api.delete(`/invoices/${invoiceId}`);

// 📦 Obtener inventarios de una factura independiente
export const getInventoriesByIndependentInvoice = (invoiceId) =>
  api.get(`/invoices/${invoiceId}/inventories`);

// ⚙️ Asignar inventarios a factura independiente
export const assignInventoriesToIndependentInvoice = (
  invoiceId,
  inventoryIds,
) => api.post(`/invoices/${invoiceId}/inventories`, { inventoryIds });

// 🛠️ Desasignar inventario de factura independiente
export const removeInventoryFromIndependentInvoice = (invoiceId, inventoryId) =>
  api.delete(`/invoices/${invoiceId}/inventories/${inventoryId}`);

// 🔍 Buscar TODAS las facturas (independientes + con orden de compra)
export const searchAllInvoices = (params) =>
  api.get('/invoices/search', { params });
