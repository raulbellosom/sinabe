// src/hooks/useProjectVerticals.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectVerticals,
  createProjectVertical,
} from '../services/projects.api';

export const useProjectVerticals = () => {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['project-verticals'],
    queryFn: () => getProjectVerticals().then((res) => res.data),
  });

  const { mutateAsync: createVertical } = useMutation({
    mutationFn: (name) => createProjectVertical({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project-verticals']);
    },
  });

  return {
    verticals: data,
    isLoading,
    createVertical,
  };
};
