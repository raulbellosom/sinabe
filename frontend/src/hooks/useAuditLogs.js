import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../services/audit.api';

// 🔍 Fetch Audit Logs
export const useAuditLogs = (params) =>
  useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => getAuditLogs(params).then((res) => res.data),
    enabled: !!params,
  });
