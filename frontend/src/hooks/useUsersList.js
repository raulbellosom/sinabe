import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/api';

export const useUsersList = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};
