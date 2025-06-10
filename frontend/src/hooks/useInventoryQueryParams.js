import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export const useInventoryQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => {
    const get = (key, fallback = '') => searchParams.get(key) || fallback;
    const getInt = (key, fallback = 1) => parseInt(get(key), 10) || fallback;
    const getArray = (key) => searchParams.getAll(key) || [];

    return {
      searchTerm: get('searchTerm'),
      page: getInt('page'),
      pageSize: getInt('pageSize', 10),
      sortBy: get('sortBy', 'updatedAt'),
      order: get('order', 'desc'),
      conditionName: getArray('conditionName'),
      status: getArray('status'),
      deepSearch: (() => {
        const val = get('deepSearch');
        try {
          return val ? JSON.parse(decodeURIComponent(val)) : [];
        } catch {
          return [];
        }
      })(),
      advancedSearch: searchParams.get('advancedSearch') ?? 'true',
    };
  }, [searchParams]);

  const updateQuery = (updates = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...query, ...updates })) {
      if (Array.isArray(value)) {
        value.forEach((v) => v && params.append(key, v));
      } else {
        if (value !== '') params.set(key, value);
      }
    }
    setSearchParams(params);
  };

  return { query, updateQuery };
};
