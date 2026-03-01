import axios from 'axios';
import { API_URL, IS_DEV } from '../../config/env';
import { normalizeApiError } from './errors';

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (IS_DEV) {
      config.headers['X-Sinabe-Client'] = 'web-dev';
    }

    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login');

    if (status === 401 && !isAuthRoute && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (IS_DEV && status >= 500) {
      console.error('[API] Server error:', normalizeApiError(error));
    }

    return Promise.reject(error);
  },
);

export default client;
