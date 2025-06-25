import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useUserQueryParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      searchTerm: params.get('searchTerm') || '',
      page: parseInt(params.get('page') || '1', 10),
      pageSize: parseInt(params.get('pageSize') || '10', 10),
      sortBy: params.get('sortBy') || null,
      order: params.get('order') || 'desc',
      status: params.getAll('status'), // Array
      roles: params.getAll('roles'), // ✅ Array
    };
  }, [location.search]);

  const [query, setQuery] = useState(getQueryParams());

  useEffect(() => {
    const newQuery = getQueryParams();
    if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
      setQuery(newQuery);
    }
  }, [location.search, getQueryParams, query]);

  const updateQuery = useCallback(
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

      // Arrays: status
      const newStatus = Array.isArray(newParams.status) ? newParams.status : [];
      const currentStatus = currentParams.getAll('status');

      if (
        JSON.stringify(currentStatus.sort()) !==
        JSON.stringify(newStatus.sort())
      ) {
        currentParams.delete('status');
        newStatus.forEach((s) => currentParams.append('status', s));
        updated = true;
      }

      // ✅ Arrays: roles
      const newRoles = Array.isArray(newParams.roles) ? newParams.roles : [];
      const currentRoles = currentParams.getAll('roles');

      if (
        JSON.stringify(currentRoles.sort()) !== JSON.stringify(newRoles.sort())
      ) {
        currentParams.delete('roles');
        newRoles.forEach((r) => currentParams.append('roles', r));
        updated = true;
      }

      if (updated) {
        navigate(`?${currentParams.toString()}`);
      }
    },
    [location.search, navigate],
  );

  return { query, updateQuery };
};
