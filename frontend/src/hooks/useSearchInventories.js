import { useQuery } from '@tanstack/react-query';
import { searchInventories } from '../services/api';

export const useSearchInventories = ({ searchTerm, deadlineId }) => {
  return useQuery({
    queryKey: ['search-inventories', searchTerm, deadlineId],
    queryFn: () => searchInventories({ searchTerm, deadlineId }),
    enabled: !!deadlineId, // solo si hay deadline activa
    refetchOnWindowFocus: false,
  });
};
