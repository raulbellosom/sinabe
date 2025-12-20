import api from './api';

export const createCustodyRecord = async (data) => {
  const response = await api.post('/custody-records', data);
  return response.data;
};

export const updateCustodyRecord = async (id, data) => {
  const response = await api.put(`/custody-records/${id}`, data);
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

export const getCustodyRecordByToken = async (token) => {
  const response = await api.get(`/custody-records/public/${token}`);
  return response.data;
};

export const resendCustodyEmail = async (id) => {
  const response = await api.post(`/custody-records/${id}/resend-email`);
  return response.data;
};

export const getPublicLink = async (id) => {
  const response = await api.get(`/custody-records/${id}/public-link`);
  return response.data;
};

export const submitPublicSignature = async (token, signature) => {
  const response = await api.post(
    `/custody-records/public/${token}/signature`,
    {
      signature,
    },
  );
  return response.data;
};
