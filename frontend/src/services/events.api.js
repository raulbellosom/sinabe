import api from './api';

const BASE_URL = '/events';

export const getEvents = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`${BASE_URL}?${params}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post(BASE_URL, data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await api.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};
