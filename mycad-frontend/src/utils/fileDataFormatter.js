// fileDataFormatter.js

/**
 * Formatea un array de archivos o imágenes.
 * @param {Array} items - El array de archivos o imágenes a formatear.
 * @return {Array} El nuevo array con la información formateada.
 */
const formatFileData = (items) => {
  if (!items || items.length === 0) return [];

  return items.map((item, index) => ({
    ...item,
    name: item.metadata?.originalname || `Archivo ${index + 1}`,
  }));
};

export default formatFileData;
