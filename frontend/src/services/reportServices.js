import axios from 'axios';

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

export const generateExcelBajaReport = async (inventories) => {
  try {
    const response = await api.post(
      '/reports/excel',
      {
        inventoryIds: Object.values(inventories).map((inv) => inv.id),
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
    );

    return response;
  } catch (error) {
    console.error('Error en generateExcelBajaReport:', error);
    throw new Error(
      'Error al generar el reporte Excel: ' +
        (error.response?.data?.error || error.message),
    );
  }
};

export const generateWordBajaReport = async (inventories) => {
  try {
    const response = await api.post(
      '/reports/word',
      {
        inventoryIds: Object.values(inventories).map((inv) => inv.id),
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      },
    );

    return response;
  } catch (error) {
    console.error('Error en generateWordBajaReport:', error);
    throw new Error(
      'Error al generar el reporte Word: ' +
        (error.response?.data?.error || error.message),
    );
  }
};
