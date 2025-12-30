// hooks/useInventoryQueryParams.js
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useInventoryQueryParams = () => {
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
      conditionName: params.getAll('conditionName'),
      status: params.getAll('status'),
      advancedSearch: params.get('advancedSearch') === 'true',
      mainViewMode: params.get('mainViewMode') || 'table',
      verticalId: params.getAll('verticalId'),
      invoiceId: params.get('invoiceId') || null,
      purchaseOrderId: params.get('purchaseOrderId') || null,
      invoiceCode: params.get('invoiceCode') || null,
      purchaseOrderCode: params.get('purchaseOrderCode') || null,
      locationName: params.get('locationName') || null,
      modelName: params.getAll('modelName'),
      brandName: params.getAll('brandName'),
      typeName: params.getAll('typeName'),
      verticalName: params.getAll('verticalName'),
      ids: params.get('ids') || null, // IDs específicos (para notificaciones)
    };
  }, [location.search]);

  const [query, setQuery] = useState(getQueryParams());

  useEffect(() => {
    const newQuery = getQueryParams();
    // Only update state if query params have actually changed to prevent unnecessary re-renders
    if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
      setQuery(newQuery);
    }
  }, [location.search, getQueryParams, query]);

  const updateQuery = useCallback(
    (newParams) => {
      const currentParams = new URLSearchParams(location.search);
      let updated = false;

      // Update basic string/number parameters
      [
        'searchTerm',
        'page',
        'pageSize',
        'sortBy',
        'order',
        'advancedSearch',
        'mainViewMode',
        'invoiceId',
        'purchaseOrderId',
        'invoiceCode',
        'purchaseOrderCode',
        'locationName',
        'ids',
      ].forEach((key) => {
        const newValue =
          newParams[key] !== undefined
            ? String(newParams[key])
            : currentParams.get(key);
        if (newValue !== null && newValue !== '' && newValue !== 'null') {
          if (currentParams.get(key) !== newValue) {
            currentParams.set(key, newValue);
            updated = true;
          }
        } else if (currentParams.has(key)) {
          currentParams.delete(key);
          updated = true;
        }
      });

      // Handle array parameters (conditionName)
      const newConditions = Array.isArray(newParams.conditionName)
        ? newParams.conditionName
        : [];
      const currentConditions = currentParams.getAll('conditionName');
      if (
        JSON.stringify(currentConditions.sort()) !==
        JSON.stringify(newConditions.sort())
      ) {
        currentParams.delete('conditionName');
        newConditions.forEach((cond) =>
          currentParams.append('conditionName', cond),
        );
        updated = true;
      }

      // Handle array parameters (status)
      const newStatus = Array.isArray(newParams.status) ? newParams.status : [];
      const currentStatus = currentParams.getAll('status');
      if (
        JSON.stringify(currentStatus.sort()) !==
        JSON.stringify(newStatus.sort())
      ) {
        currentParams.delete('status');
        newStatus.forEach((stat) => currentParams.append('status', stat));
        updated = true;
      }

      // Handle array parameters (verticalId)
      const newVerticals = Array.isArray(newParams.verticalId)
        ? newParams.verticalId
        : [];
      const currentVerticals = currentParams.getAll('verticalId');
      if (
        JSON.stringify(currentVerticals.sort()) !==
        JSON.stringify(newVerticals.sort())
      ) {
        currentParams.delete('verticalId');
        newVerticals.forEach((v) => currentParams.append('verticalId', v));
        updated = true;
      }

      // Handle array parameters (modelName)
      const newModelNames = Array.isArray(newParams.modelName)
        ? newParams.modelName
        : [];
      const currentModelNames = currentParams.getAll('modelName');
      if (
        JSON.stringify(currentModelNames.sort()) !==
        JSON.stringify(newModelNames.sort())
      ) {
        currentParams.delete('modelName');
        newModelNames.forEach((m) => currentParams.append('modelName', m));
        updated = true;
      }

      // Handle array parameters (brandName)
      const newBrandNames = Array.isArray(newParams.brandName)
        ? newParams.brandName
        : [];
      const currentBrandNames = currentParams.getAll('brandName');
      if (
        JSON.stringify(currentBrandNames.sort()) !==
        JSON.stringify(newBrandNames.sort())
      ) {
        currentParams.delete('brandName');
        newBrandNames.forEach((b) => currentParams.append('brandName', b));
        updated = true;
      }

      // Handle array parameters (typeName)
      const newTypeNames = Array.isArray(newParams.typeName)
        ? newParams.typeName
        : [];
      const currentTypeNames = currentParams.getAll('typeName');
      if (
        JSON.stringify(currentTypeNames.sort()) !==
        JSON.stringify(newTypeNames.sort())
      ) {
        currentParams.delete('typeName');
        newTypeNames.forEach((t) => currentParams.append('typeName', t));
        updated = true;
      }

      // Handle array parameters (verticalName)
      const newVerticalNames = Array.isArray(newParams.verticalName)
        ? newParams.verticalName
        : [];
      const currentVerticalNames = currentParams.getAll('verticalName');
      if (
        JSON.stringify(currentVerticalNames.sort()) !==
        JSON.stringify(newVerticalNames.sort())
      ) {
        currentParams.delete('verticalName');
        newVerticalNames.forEach((v) =>
          currentParams.append('verticalName', v),
        );
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
