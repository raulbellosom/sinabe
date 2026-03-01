import api from '../lib/api/client';

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
