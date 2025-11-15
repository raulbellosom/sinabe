import api from './api';

// Obtener todas las ubicaciones de inventario
export const getAllInventoryLocations = async () => {
  const response = await api.get('/inventory-locations');
  return response.data;
};

// Obtener ubicación de inventario por ID
export const getInventoryLocationById = async (id) => {
  const response = await api.get(`/inventory-locations/${id}`);
  return response.data;
};

// Crear nueva ubicación de inventario
export const createInventoryLocation = async (locationData) => {
  const response = await api.post('/inventory-locations', locationData);
  return response.data;
};

// Actualizar ubicación de inventario
export const updateInventoryLocation = async (id, locationData) => {
  const response = await api.put(`/inventory-locations/${id}`, locationData);
  return response.data;
};

// Eliminar ubicación de inventario
export const deleteInventoryLocation = async (id) => {
  const response = await api.delete(`/inventory-locations/${id}`);
  return response.data;
};

// Obtener lista de ubicaciones para autocomplete
export const getInventoryLocationsList = async () => {
  const response = await api.get('/inventories/locations-list');
  return response.data;
};
