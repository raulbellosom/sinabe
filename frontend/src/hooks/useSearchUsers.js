import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../services/searchUsers.api';

export const useSearchUsers = ({
  searchTerm,
  sortBy,
  order,
  page,
  pageSize,
  status,
  roles,
  signal,
}) => {
  return useQuery({
    queryKey: [
      'search-users',
      searchTerm,
      sortBy,
      order,
      page,
      pageSize,
      status,
      roles,
    ],
    queryFn: () =>
      searchUsers({
        searchTerm,
        sortBy,
        order,
        page,
        pageSize,
        status,
        roles,
        signal,
      }),
    enabled: true,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
