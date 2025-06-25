import api from './api'; // tu instancia de Axios

export const searchUsers = async ({
  searchTerm,
  sortBy = 'updatedAt',
  order = 'desc',
  page = 1,
  pageSize = 10,
  role,
  status,
  signal,
  roles = [],
}) => {
  try {
    const response = await api.get('/users/search', {
      params: {
        searchTerm,
        sortBy,
        order,
        page,
        pageSize,
        role,
        status,
        roles,
      },
      signal,
    });

    if (response.status !== 200) {
      throw new Error(response.message || 'Hubo un error al hacer la búsqueda');
    }

    return response.data;
  } catch (error) {
    console.error('[searchUsers] Error:', error);
    throw error;
  }
};
