import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch Audit Logs with filters
 * @param {object} params
 * @param {string} [params.entityType]
 * @param {string} [params.entityId]
 * @param {string} [params.userId]
 * @param {string} [params.search] - Search by entity title
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export const getAuditLogs = async (params) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};
