import JSZip from 'jszip';
import FileSaver from 'file-saver';
// Si tienes un base URL para las imágenes, por ejemplo:
import { API_URL } from '../services/api';

export const downloadImagesAsZip = async (selectedImages) => {
  if (!selectedImages || selectedImages.length === 0) {
    alert('No hay imágenes seleccionadas para descargar.');
    return;
  }
  // Puedes agregar un estado de "loading" en tu componente padre si lo requieres.
  const zip = new JSZip();
  // Creamos una carpeta "images" dentro del zip
  const folder = zip.folder('images');

  // Recorremos cada imagen seleccionada
  const promises = selectedImages.map(async (imgObj, index) => {
    try {
      // Suponemos que "imgObj.imageKey" contiene la URL completa de la imagen.
      // Si las URLs son relativas, concatena la base URL, por ejemplo:
      const url = `${API_URL}/${imgObj.imageKey}`;
      const response = await fetch(url);
      const blob = await response.blob();
      // Se asigna un nombre secuencial a cada imagen
      folder.file(`image_${index + 1}.jpg`, blob);
    } catch (error) {
      console.error(`Error descargando la imagen ${imgObj.imageKey}:`, error);
    }
  });

  await Promise.all(promises);

  // Formateamos la fecha actual para el nombre del archivo ZIP
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`;
  const fileName = `images_${formattedDate}.zip`;

  // Generamos el ZIP y lo descargamos
  zip.generateAsync({ type: 'blob' }).then((content) => {
    FileSaver.saveAs(content, fileName);
  });
};
