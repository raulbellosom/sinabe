import api from '../lib/api/client';

const getPreferences = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get('/preferences', config);
  return response.data;
};

const updatePreferences = async (data, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.put('/preferences', data, config);
  return response.data;
};

const uploadSidebarImage = async (formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  const response = await api.post('/preferences/upload-bg', formData, config);
  return response.data;
};

const userPreferenceService = {
  getPreferences,
  updatePreferences,
  uploadSidebarImage,
};

export default userPreferenceService;
