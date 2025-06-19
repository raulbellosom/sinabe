import api from './api';

// 🔍 Obtener todas las verticales activas (con modelos, marcas, inventarios)
export const fetchVerticals = () => api.get('/verticals');

// ➕ Crear una nueva vertical
export const createVertical = (data) => api.post('/verticals', data);

// ✏️ Actualizar una vertical
export const updateVertical = (id, data) => api.put(`/verticals/${id}`, data);

// ❌ Eliminar lógica una vertical
export const deleteVertical = (id) => api.delete(`/verticals/${id}`);

// 🔍 Obtener verticales asociadas a un modelo específico
export const getVerticalsByModel = (modelId) =>
  api.get(`/verticals/model/${modelId}`);

// 🔄 Asignar varias verticales a un modelo
export const assignVerticalsToModel = (modelId, verticalIds) =>
  api.post(`/verticals/model/${modelId}`, { verticalIds });

// ❌ Remover una vertical específica de un modelo
export const removeVerticalFromModel = (modelId, verticalId) =>
  api.delete(`/verticals/model/${modelId}/${verticalId}`);
