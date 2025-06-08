import { useQuery } from '@tanstack/react-query';
import { searchProjects } from '../services/projects.api';

export const useProjectSearch = ({
  searchTerm = '',
  filters = { statuses: [], verticalIds: [] },
  pagination = { page: 1, pageSize: 10 },
  sorting = { sortBy: 'createdAt', order: 'desc' },
}) => {
  return useQuery({
    queryKey: [
      'projects',
      searchTerm,
      filters.statuses,
      filters.verticalIds,
      pagination.page,
      pagination.pageSize,
      sorting.sortBy,
      sorting.order,
    ],
    queryFn: () =>
      searchProjects({
        searchTerm,
        statuses: filters.statuses,
        verticalIds: filters.verticalIds,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: sorting.sortBy,
        order: sorting.order,
      }),
    keepPreviousData: true,
  });
};
