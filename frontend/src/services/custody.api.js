import api from './api';

export const createCustodyRecord = async (data) => {
  const response = await api.post('/custody-records', data);
  return response.data;
};

export const getCustodyRecord = async (id) => {
  const response = await api.get(`/custody-records/${id}`);
  return response.data;
};

export const getCustodyRecords = async (params) => {
  const response = await api.get('/custody-records', { params });
  return response.data;
};

export const deleteCustodyRecord = async (id) => {
  const response = await api.delete(`/custody-records/${id}`);
  return response.data;
};
