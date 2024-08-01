import axios from 'axios';

export const BASE_API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/';
export const API_URL = `${BASE_API_URL}/api` || 'http://localhost:4000/api';

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

export const getVehicles = async () => {
  const response = await api.get(`${API_URL}/vehicles`);
  return response.data;
};

export const getVehicle = async (vehicleId) => {
  const response = await api.get(`${API_URL}/vehicles/${vehicleId}`);
  return response.data;
};

export const createVehicle = async (vehicle) => {
  api.defaults.headers['Content-Type'] = 'multipart/form-data';
  let data = new FormData();

  if (vehicle.images && vehicle.images.length > 0) {
    vehicle.images.forEach((image) => {
      data.append('images', image);
    });
  }

  if (vehicle.files && vehicle.files.length > 0) {
    vehicle.files.forEach((file) => {
      data.append('files', file);
    });
  }

  data.append('vehicle', JSON.stringify(vehicle));
  const response = await api.post(`${API_URL}/vehicles`, data);
  return response.data;
};

export const updateVehicle = async (vehicle) => {
  api.defaults.headers['Content-Type'] = 'multipart/form-data';
  const id = vehicle.id;
  let data = new FormData();
  let currentImages = vehicle.images.filter((image) => image instanceof File);
  vehicle.images = vehicle.images.filter((image) => !(image instanceof File));
  let currentFiles = vehicle.files.filter((file) => file instanceof File);
  vehicle.files = vehicle.files.filter((file) => !(file instanceof File));

  if (currentImages && currentImages.length > 0) {
    currentImages.forEach((image) => {
      data.append('images', image);
    });
  }

  if (currentFiles && currentFiles.length > 0) {
    currentFiles.forEach((file) => {
      data.append('files', file);
    });
  }

  data.append('vehicle', JSON.stringify(vehicle));
  const response = await api.put(`${API_URL}/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await api.delete(`${API_URL}/vehicles/${vehicleId}`);
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

export const createVehicleModel = async (vehicleModel) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleModels`,
    vehicleModel,
  );
  return response.data;
};

export const updateVehicleModel = async (vehicleModel) => {
  const response = await api.put(
    `${API_URL}/vehicles/vehicleModels/${vehicleModel.id}`,
    vehicleModel,
  );
  return response.data;
};

export const deleteVehicleModel = async (vehicleModelId) => {
  const response = await api.delete(
    `${API_URL}/vehicles/vehicleModels/${vehicleModelId}`,
  );
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

export const createVehicleType = async (vehicleType) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleTypes`,
    vehicleType,
  );
  return response.data;
};

export const updateVehicleType = async (vehicleType) => {
  const response = await api.put(
    `${API_URL}/vehicles/vehicleTypes/${vehicleType.id}`,
    vehicleType,
  );
  return response.data;
};

export const deleteVehicleType = async (vehicleTypeId) => {
  const response = await api.delete(
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

export const createVehicleBrand = async (vehicleBrand) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleBrands`,
    vehicleBrand,
  );
  return response.data;
};

export const updateVehicleBrand = async (vehicleBrand) => {
  const response = await api.put(
    `${API_URL}/vehicles/vehicleBrands/${vehicleBrand.id}`,
    vehicleBrand,
  );
  return response.data;
};

export const deleteVehicleBrand = async (vehicleBrandId) => {
  const response = await api.delete(
    `${API_URL}/vehicles/vehicleBrands/${vehicleBrandId}`,
  );
  return response.data;
};

export const getVehicleConditions = async () => {
  const response = await api.get(`${API_URL}/vehicles/vehicleConditions`);
  return response.data;
};

export const getVehicleCondition = async (vehicleConditionId) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleConditions/${vehicleConditionId}`,
  );
  return response.data;
};

export const createVehicleCondition = async (vehicleCondition) => {
  const response = await api.post(
    `${API_URL}/vehicles/vehicleConditions`,
    vehicleCondition,
  );
  return response.data;
};

export const updateVehicleCondition = async (vehicleCondition) => {
  const response = await api.put(
    `${API_URL}/vehicles/vehicleConditions/${vehicleCondition.id}`,
    vehicleCondition,
  );
  return response.data;
};

export const deleteVehicleCondition = async (vehicleConditionId) => {
  const response = await api.delete(
    `${API_URL}/vehicles/vehicleConditions/${vehicleConditionId}`,
  );
  return response.data;
};

export default api;
