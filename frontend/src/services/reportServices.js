import api from '../lib/api/client';
import { API_URL } from '../config/env';

export { API_URL };

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

export const exportInventoriesExcel = async (inventoryIds) => {
  const response = await api.post(
    '/reports/export-excel',
    { inventoryIds },
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
