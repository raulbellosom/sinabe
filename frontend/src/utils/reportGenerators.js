import { saveAs } from 'file-saver';
import {
  generateExcelBajaReport,
  generateWordBajaReport,
} from '../services/reportServices';

export const generateExcelReport = async (inventories) => {
  try {
    const response = await generateExcelBajaReport(inventories);
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    const filename =
      response.headers['content-disposition']
        ?.split('filename=')[1]
        ?.replace(/['"]/g, '') || 'Baja_de_equipos.xlsx';
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error en generateExcelReport:', error);
    throw new Error(
      'Error al generar el reporte Excel: ' +
        (error.response?.data?.error || error.message),
    );
  }
};

export const generateWordReport = async (inventories) => {
  try {
    const response = await generateWordBajaReport(inventories);
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    const filename =
      response.headers['content-disposition']
        ?.split('filename=')[1]
        ?.replace(/['"]/g, '') || 'Baja_de_equipos.docx';
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error en generateWordReport:', error);
    throw new Error(
      'Error al generar el documento Word: ' +
        (error.response?.data?.error || error.message),
    );
  }
};
