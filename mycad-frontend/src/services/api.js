import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

// append access control allow origin header
api.interceptors.request.use(
  (config) => {
    config.headers['Access-Control-Allow-Origin'] = '*';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const register = async (credentials) => {
  try {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const loadUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.get('/auth/logout');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUsers = async () => {
  const response = await api.get(`${API_URL}/users`);
  return response.data;
};

export const createUser = async (user) => {
  const response = await api.post(`${API_URL}/users`, user);
  return response.data;
};

export const updateUser = async (user) => {
  const response = await api.put(`${API_URL}/users/${user.id}`, user);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`${API_URL}/users/${userId}`);
  return response.data;
};

// Similar functions for vehicles
export const getVehicles = async () => {
  const response = await api.get(`${API_URL}/vehicles`);
  return response.data;
};

export const getVehicle = async (vehicleId) => {
  const response = await api.get(`${API_URL}/vehicles/${vehicleId}`);
  return response.data;
};

export const createVehicle = async (vehicle) => {
  const response = await api.post(`${API_URL}/vehicles`, vehicle);
  return response.data;
};

export const updateVehicle = async (vehicle) => {
  const response = await api.put(`${API_URL}/vehicles/${vehicle.id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await api.delete(`${API_URL}/vehicles/${vehicleId}`);
  return response.data;
};

export const getVehicleTypes = async () => {
  const response = await api.get(`${API_URL}/vehicles/vehicleTypes`);
  return response.data;
};

export const getVehicleType = async (vehicleTypeId) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleTypes/${vehicleTypeId}`,
  );
  return response.data;
};

export const getVehicleBrands = async () => {
  const response = await api.get(`${API_URL}/vehicles/vehicleBrands`);
  return response.data;
};

export const getVehicleBrand = async (vehicleBrandId) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleBrands/${vehicleBrandId}`,
  );
  return response.data;
};

export const getVehicleModels = async () => {
  const response = await api.get(`${API_URL}/vehicles/vehicleModels`);
  return response.data;
};

export const getVehicleModel = async (vehicleModelId) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleModels/${vehicleModelId}`,
  );
  return response.data;
};

export default api;
