import api from './api'; // tu instancia de Axios

export const searchInventories = async ({
  searchTerm,
  sortBy = 'updatedAt',
  order = 'desc',
  page = 1,
  pageSize = 10,
  conditionName,
  deepSearch = [],
  status,
  advancedSearch = 'true',
  deadlineId = null,
  projectId = null,
  purchaseOrderId = null,
  invoiceId = null,
  verticalId = null,
  locationName = null,
  signal,
}) => {
  try {
    const response = await api.get('/inventories/search', {
      params: {
        searchTerm,
        sortBy,
        order,
        page,
        pageSize,
        conditionName,
        deepSearch: JSON.stringify(deepSearch),
        status,
        advancedSearch,
        deadlineId,
        projectId,
        purchaseOrderId,
        invoiceId,
        verticalId,
        locationName,
      },
      signal,
    });

    if (response.status !== 200) {
      throw new Error(response.message || 'Hubo un error al hacer la búsqueda');
    }

    return response.data;
  } catch (error) {
    console.error('[searchInventories] Error:', error);
    throw error;
  }
};
