import { useQuery } from '@tanstack/react-query';
import { searchProjects } from '../services/projects.api';

export const useProjectSearch = (searchTerm) =>
  useQuery({
    queryKey: ['project-search', searchTerm],
    queryFn: () => searchProjects(searchTerm).then((res) => res.data),
    enabled: searchTerm.length >= 2 || searchTerm === '', // opcional: no busques con 1 letra
  });
