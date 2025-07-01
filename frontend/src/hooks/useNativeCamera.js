import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const useNativeCamera = () => {
  const openCamera = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Permite elegir cámara o galería
        quality: 90,
        allowEditing: true, // Abre editor nativo si está disponible
      });

      return photo.webPath; // Esto es un string con la URI (puede usarse como src)
    } catch (err) {
      console.warn('No se pudo obtener la imagen', err);
      return null;
    }
  };

  return { openCamera };
};
