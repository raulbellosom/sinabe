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
