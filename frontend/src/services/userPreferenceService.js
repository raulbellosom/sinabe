import axios from 'axios';

const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_URL = raw.endsWith('/api') ? raw : `${raw}/api`;

const getPreferences = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/preferences`, config);
  return response.data;
};

const updatePreferences = async (data, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/preferences`, data, config);
  return response.data;
};

const uploadSidebarImage = async (formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  const response = await axios.post(
    `${API_URL}/preferences/upload-bg`,
    formData,
    config,
  );
  return response.data;
};

const userPreferenceService = {
  getPreferences,
  updatePreferences,
  uploadSidebarImage,
};

export default userPreferenceService;
