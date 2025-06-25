import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useProjectQueryParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      searchTerm: params.get('searchTerm') || '',
      page: parseInt(params.get('page') || '1', 10),
      pageSize: parseInt(params.get('pageSize') || '10', 10),
      sortBy: params.get('sortBy') || 'updatedAt',
      order: params.get('order') || 'desc',
      statuses: params.getAll('statuses'),
      verticalIds: params.getAll('verticalIds'),
    };
  }, [location.search]);

  const [query, setQuery] = useState(getQueryParams());

  useEffect(() => {
    const newQuery = getQueryParams();
    if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
      setQuery(newQuery);
    }
  }, [location.search, getQueryParams, query]);

  const updateParams = useCallback(
    (newParams) => {
      const currentParams = new URLSearchParams(location.search);
      let updated = false;

      // Parámetros simples
      ['searchTerm', 'page', 'pageSize', 'sortBy', 'order'].forEach((key) => {
        const newValue =
          newParams[key] !== undefined
            ? String(newParams[key])
            : currentParams.get(key);
        if (newValue && newValue !== 'null') {
          if (currentParams.get(key) !== newValue) {
            currentParams.set(key, newValue);
            updated = true;
          }
        } else if (currentParams.has(key)) {
          currentParams.delete(key);
          updated = true;
        }
      });

      // status[]
      const newStatuses = Array.isArray(newParams.statuses)
        ? newParams.statuses
        : [];
      const currentStatuses = currentParams.getAll('statuses');
      if (
        JSON.stringify(currentStatuses.sort()) !==
        JSON.stringify(newStatuses.sort())
      ) {
        currentParams.delete('statuses');
        newStatuses.forEach((s) => currentParams.append('statuses', s));
        updated = true;
      }

      // verticalIds[]
      const newVerticals = Array.isArray(newParams.verticalIds)
        ? newParams.verticalIds
        : [];
      const currentVerticals = currentParams.getAll('verticalIds');
      if (
        JSON.stringify(currentVerticals.sort()) !==
        JSON.stringify(newVerticals.sort())
      ) {
        currentParams.delete('verticalIds');
        newVerticals.forEach((v) => currentParams.append('verticalIds', v));
        updated = true;
      }

      if (updated) {
        navigate(`?${currentParams.toString()}`);
      }
    },
    [location.search, navigate],
  );

  return { query, updateParams };
};
