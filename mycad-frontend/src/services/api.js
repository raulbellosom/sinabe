import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const createUser = async (user) => {
  const response = await axios.post(`${API_URL}/users`, user);
  return response.data;
};

export const updateUser = async (user) => {
  const response = await axios.put(`${API_URL}/users/${user.id}`, user);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/users/${userId}`);
  return response.data;
};

// Similar functions for vehicles
export const getVehicles = async () => {
  const response = await axios.get(`${API_URL}/vehicles`);
  return response.data;
};

export const createVehicle = async (vehicle) => {
  const response = await axios.post(`${API_URL}/vehicles`, vehicle);
  return response.data;
};

export const updateVehicle = async (vehicle) => {
  const response = await axios.put(
    `${API_URL}/vehicles/${vehicle.id}`,
    vehicle,
  );
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await axios.delete(`${API_URL}/vehicles/${vehicleId}`);
  return response.data;
};

export default api;
