import axios from 'axios';
import { saveAs } from 'file-saver';

const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const API_URL = raw.endsWith('/api') ? raw : `${raw}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores de respuesta globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es error 401 (no autorizado), verificar si es un error de sesión expirada
    // NO limpiar datos si es un error de login (credenciales incorrectas)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/login');

      // Solo limpiar datos y recargar si NO es una petición de login
      // y si NO estamos ya en la página de login
      if (!isLoginRequest && !window.location.pathname.includes('/login')) {
        console.warn('Token expired or invalid, clearing auth data');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
      }
    }

    return Promise.reject(error);
  },
);

const headerFormData = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (credentials) => {
  try {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
};

export const updateInventoriesStatus = async (inventoryIds, status) => {
  try {
    const response = await api.patch('/inventories/bulk-status', {
      inventoryIds,
      status,
    });
    return response.data;
  } catch (error) {
    console.error('Error en updateInventoriesStatus:', error);
    throw error;
  }
};

export const loadUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error en loadUser:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.get('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

export const updateProfile = async (profile) => {
  try {
    const response = await api.put('/auth/updateProfile', profile);
    return response.data;
  } catch (error) {
    console.error('Error en updateProfile:', error);
    throw error;
  }
};

export const updatePassword = async (passwords) => {
  try {
    const response = await api.put('/auth/updatePassword', passwords);
    return response.data;
  } catch (error) {
    console.error('Error en updatePassword:', error);
    throw error;
  }
};

export const updateProfileImage = async (profileImage) => {
  try {
    let data = new FormData();
    data.append('profileImage', profileImage);
    const response = await api.put(
      '/auth/updateProfileImage',
      data,
      headerFormData,
    );
    return response.data;
  } catch (error) {
    console.error('Error en updateProfileImage:', error);
    throw error;
  }
};

export const updateSignature = async (signatureImage) => {
  try {
    let data = new FormData();
    data.append('signature', signatureImage);
    const response = await api.put(
      '/auth/updateSignature',
      data,
      headerFormData,
    );
    return response.data;
  } catch (error) {
    console.error('Error en updateSignature:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get(`/users`);
    return response.data;
  } catch (error) {
    console.error('Error en getUsers:', error);
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    let data = new FormData();

    const image = user?.photo[0] || null;

    if (image instanceof File) {
      data.append('profileImage', image);
    }

    data.append(
      'userData',
      JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userName: user.userName,
        password: user.password,
        repeatPassword: user.repeatPassword,
      }),
    );
    const response = await api.post(`/users`, data, headerFormData);
    return response.data;
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error;
  }
};

export const updateUser = async (user) => {
  try {
    let data = new FormData();
    const image = user?.photo[0] || null;

    if (image instanceof File) {
      data.append('profileImage', image);
    }
    data.append(
      'userData',
      JSON.stringify({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userName: user.userName,
        status: user.status,
        password: user.password,
        repeatPassword: user.repeatPassword,
        employeeNumber: user.employeeNumber,
        jobTitle: user.jobTitle,
        department: user.department,
      }),
    );
    const response = await api.put(`/users/${user.id}`, data, headerFormData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changePasswordUser = async (user) => {
  try {
    const response = await api.put(`/users/changePassword/${user.id}`, user);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const searchUsers = async ({
  searchTerm,
  sortBy,
  order,
  page,
  pageSize,
  signal,
}) => {
  try {
    const response = await api.get('/users/search', {
      params: {
        searchTerm,
        sortBy,
        order,
        page,
        pageSize,
      },
      signal: signal,
    });
    if (response.status !== 200) {
      throw new Error(response.message || 'Hubo un error al hacer la busqueda');
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const response = await api.get(`/dashboard`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventories = async () => {
  try {
    const response = await api.get(`/inventories`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventory = async ({ id: inventoryId, signal }) => {
  try {
    const response = await api.get(`/inventories/${inventoryId}`, { signal });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInventory = async (inventory) => {
  try {
    let data = new FormData();

    if (inventory.images && inventory.images.length > 0) {
      inventory.images.forEach((image) => {
        data.append('images', image);
      });
    }

    if (inventory.files && inventory.files.length > 0) {
      inventory.files.forEach((file) => {
        data.append('files', file);
      });
    }

    data.append('inventory', JSON.stringify(inventory));
    const response = await api.post(`/inventories`, data, headerFormData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInventory = async (inventory) => {
  try {
    const id = inventory.id;
    let data = new FormData();
    let currentImages = inventory.images.filter(
      (image) => image instanceof File,
    );
    inventory.images = inventory.images.filter(
      (image) => !(image instanceof File),
    );
    let currentFiles = inventory.files.filter((file) => file instanceof File);
    inventory.files = inventory.files.filter((file) => !(file instanceof File));

    if (currentImages && currentImages.length > 0) {
      currentImages.forEach((image) => {
        data.append('images', image);
      });
    }

    if (currentFiles && currentFiles.length > 0) {
      currentFiles.forEach((file) => {
        data.append('files', file);
      });
    }

    data.append('inventory', JSON.stringify(inventory));
    const response = await api.put(`/inventories/${id}`, data, headerFormData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const migrateInventory = async (inventory) => {
  try {
    const response = await api.post('/inventories/migrate', { inventory });
    console.log(response);
    if (response.status !== 200) {
      throw new Error('Error al enviar el inventario');
    }
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteInventory = async (inventoryId) => {
  try {
    const response = await api.delete(`/inventories/${inventoryId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// api.js
export const checkSerialNumber = async (serialNumber, inventoryId) => {
  try {
    const response = await api.post('/inventories/checkSerialNumber', {
      serialNumber,
      inventoryId,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const searchInventories = async ({
  searchTerm,
  sortBy,
  order,
  page,
  pageSize,
  conditionName,
  deepSearch = [],
  status,
  signal,
  advancedSearch = 'true',
  deadlineId = null,
}) => {
  try {
    const parsedDeepSearch = JSON.stringify(deepSearch);
    const response = await api.get('/inventories/search', {
      params: {
        searchTerm,
        sortBy,
        order,
        page,
        pageSize,
        conditionName,
        deepSearch: parsedDeepSearch,
        status,
        advancedSearch,
        deadlineId,
      },
      signal: signal,
    });
    if (response.status !== 200) {
      throw new Error(response.message || 'Hubo un error al hacer la busqueda');
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createMultipleInventories = async (csvFile, userId) => {
  try {
    let data = new FormData();

    data.append('csvFile', csvFile);
    data.append('userId', JSON.stringify(userId));

    const response = await api.post(
      `/inventories/createMultipleInventories`,
      data,
      headerFormData,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventoryModels = async () => {
  try {
    const response = await api.get(`/inventories/inventoryModels`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventoryModel = async (inventoryModelId) => {
  try {
    const response = await api.post(
      `/inventories/inventoryModels/${inventoryModelId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInventoryModel = async (inventoryModel) => {
  try {
    const response = await api.post(
      `/inventories/inventoryModels`,
      inventoryModel,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInventoryModel = async (inventoryModel) => {
  try {
    const response = await api.put(
      `/inventories/inventoryModels/${inventoryModel.id}`,
      inventoryModel,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteInventoryModel = async (inventoryModelId) => {
  try {
    const response = await api.delete(
      `/inventories/inventoryModels/${inventoryModelId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createMultipleModels = async (csvFile) => {
  try {
    let data = new FormData();

    data.append('csvFile', csvFile);

    const response = await api.post(
      `/inventories/inventoryModels/createMultipleModels`,
      data,
      headerFormData,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const searchModels = async ({
  searchTerm,
  sortBy,
  order,
  page,
  pageSize,
  signal,
  excludeVerticalId, // ← nuevo parámetro opcional
}) => {
  try {
    const params = {
      searchTerm,
      sortBy,
      order,
      page,
      pageSize,
    };

    // Si recibimos excludeVerticalId, lo añadimos a los params
    if (excludeVerticalId != null) {
      params.excludeVerticalId = excludeVerticalId;
    }

    const response = await api.get('/inventories/inventoryModels/search', {
      params,
      signal,
    });
    if (response.status !== 200) {
      throw new Error(response.message || 'Hubo un error al hacer la búsqueda');
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventoryTypes = async () => {
  try {
    const response = await api.get(`/inventories/inventoryTypes`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getInventoryType = async (inventoryTypeId) => {
  try {
    const response = await api.post(
      `/inventories/inventoryTypes/${inventoryTypeId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInventoryType = async (inventoryType) => {
  try {
    const response = await api.post(
      `/inventories/inventoryTypes`,
      inventoryType,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInventoryType = async (inventoryType) => {
  try {
    const response = await api.put(
      `/inventories/inventoryTypes/${inventoryType.id}`,
      inventoryType,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteInventoryType = async (inventoryTypeId) => {
  try {
    const response = await api.delete(
      `/inventories/inventoryTypes/${inventoryTypeId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getInventoryBrands = async () => {
  try {
    const response = await api.get(`/inventories/inventoryBrands`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventoryBrand = async (inventoryBrandId) => {
  try {
    const response = await api.post(
      `/inventories/inventoryBrands/${inventoryBrandId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInventoryBrand = async (inventoryBrand) => {
  console.log(inventoryBrand);
  try {
    const response = await api.post(
      `/inventories/inventoryBrands`,
      inventoryBrand,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInventoryBrand = async (inventoryBrand) => {
  try {
    const response = await api.put(
      `/inventories/inventoryBrands/${inventoryBrand.id}`,
      inventoryBrand,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteInventoryBrand = async (inventoryBrandId) => {
  try {
    const response = await api.delete(
      `/inventories/inventoryBrands/${inventoryBrandId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventoryConditions = async () => {
  try {
    const response = await api.get(`/inventories/inventoryConditions`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInventoryCondition = async (inventoryConditionId) => {
  try {
    const response = await api.post(
      `/inventories/inventoryConditions/${inventoryConditionId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInventoryCondition = async (inventoryCondition) => {
  try {
    const response = await api.post(
      `/inventories/inventoryConditions`,
      inventoryCondition,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateInventoryCondition = async (inventoryCondition) => {
  try {
    const response = await api.put(
      `/inventories/inventoryConditions/${inventoryCondition.id}`,
      inventoryCondition,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteInventoryCondition = async (inventoryConditionId) => {
  try {
    const response = await api.delete(
      `/inventories/inventoryConditions/${inventoryConditionId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCustomFields = async () => {
  try {
    const response = await api.get(`/inventories/customFields`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createCustomField = async (customField) => {
  try {
    const response = await api.post(`/inventories/customFields`, customField);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCustomField = async (customField) => {
  try {
    const response = await api.put(
      `/inventories/customFields/${customField.id}`,
      customField,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCustomField = async (customFieldId) => {
  try {
    const response = await api.delete(
      `/inventories/customFields/${customFieldId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCustomFieldValues = async ({ customFieldId, query }) => {
  try {
    const response = await api.get(
      `/inventories/customFields/${customFieldId}/values`,
      {
        params: {
          query,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addCustomFieldValue = async (customFieldValue) => {
  try {
    const response = await api.post(
      `/inventories/customFields/values`,
      customFieldValue,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const downloadFile = async (file) => {
  try {
    const response = await api.get(file.url, {
      responseType: 'blob',
    });
    const fileName = `${file?.metadata?.originalname || file?.id}`;

    saveAs(response.data, fileName ?? 'file');
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Descarga un archivo y retorna el blob (sin guardarlo).
 * @param {Object} file
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
export const fetchFileBlob = async (file) => {
  try {
    const response = await api.get(file.url, {
      responseType: 'blob',
    });
    const fileName = file?.metadata?.originalname || file?.id || 'archivo';
    return { blob: response.data, fileName };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ===============================================
// 🆕 ASIGNACIÓN MASIVA DE INVENTARIOS
// ===============================================

// Asignar múltiples inventarios a una factura
export const assignInventoriesToInvoice = async ({
  invoiceId,
  inventoryIds,
}) => {
  try {
    const response = await api.post(`/invoices/${invoiceId}/inventories`, {
      inventoryIds,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Asignar múltiples inventarios a una orden de compra
export const assignInventoriesToPurchaseOrder = async ({
  purchaseOrderId,
  inventoryIds,
}) => {
  try {
    const response = await api.post(
      `/purchase-orders/${purchaseOrderId}/inventories`,
      { inventoryIds },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Obtener lista de Purchase Orders para autocomplete
export const getPurchaseOrdersList = async () => {
  try {
    const response = await api.get('/inventories/purchase-orders-list');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Obtener lista de Invoices para autocomplete
export const getInvoicesList = async () => {
  try {
    const response = await api.get('/inventories/invoices-list');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Crear nueva Purchase Order
export const createPurchaseOrderSimple = async (purchaseOrder) => {
  try {
    const response = await api.post(
      '/purchase-orders/without-project',
      purchaseOrder,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Crear nueva Invoice
export const createInvoiceSimple = async (invoice) => {
  try {
    const response = await api.post('/invoices/independent', invoice);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default api;
