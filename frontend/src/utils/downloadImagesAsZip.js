import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { API_URL } from '../services/api';

/**
 * Función que recibe un blob de imagen, lo dibuja en un canvas y genera un nuevo blob comprimido
 * @param {Blob} blob - Blob original de la imagen.
 * @param {number} quality - Calidad de compresión entre 0 y 1 (por ejemplo, 0.3 para 30% de calidad).
 * @returns {Promise<Blob>} Blob comprimido.
 */
const compressImage = (blob, quality = 0.3) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Creamos un canvas con el tamaño original de la imagen.
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // Generamos un nuevo blob a partir del canvas con la calidad indicada.
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () =>
      reject(new Error('Error cargando la imagen para compresión'));
    // Creamos una URL temporal para cargar la imagen.
    img.src = URL.createObjectURL(blob);
  });
};

export const downloadImagesAsZip = async (
  selectedImages = [],
  isLowQuality = false,
) => {
  if (!selectedImages || selectedImages.length === 0) {
    alert('No hay imágenes seleccionadas para descargar.');
    return;
  }

  // Inicializamos el zip y creamos una carpeta 'images'
  const zip = new JSZip();
  const folder = zip.folder('images');

  // Procesamos cada imagen seleccionada
  const promises = selectedImages?.map(async (imgObj, index) => {
    try {
      const url = `${API_URL}/${imgObj.imageKey}`;
      const response = await fetch(url);
      let blob = await response.blob();
      if (isLowQuality) {
        blob = await compressImage(blob, 0.2); // Ajusta el valor de calidad según tus necesidades.
      }
      folder.file(`image_${index + 1}.jpg`, blob);
    } catch (error) {
      console.error(`Error descargando la imagen ${imgObj.imageKey}:`, error);
    }
  });

  await Promise.all(promises);

  // Se genera un nombre de archivo basado en la fecha actual.
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`;
  const fileName = `images_${formattedDate}.zip`;

  // Se genera el ZIP y se inicia la descarga.
  zip.generateAsync({ type: 'blob' }).then((content) => {
    FileSaver.saveAs(content, fileName);
  });
};
