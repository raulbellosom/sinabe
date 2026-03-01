import client from './client';

export const get = async (url, config = {}) => {
  const response = await client.get(url, config);
  return response.data;
};

export const post = async (url, data, config = {}) => {
  const response = await client.post(url, data, config);
  return response.data;
};

export const put = async (url, data, config = {}) => {
  const response = await client.put(url, data, config);
  return response.data;
};

export const del = async (url, config = {}) => {
  const response = await client.delete(url, config);
  return response.data;
};

export default {
  get,
  post,
  put,
  del,
};
