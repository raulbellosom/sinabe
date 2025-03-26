import React, { useState } from 'react';
import ImageViewer from '../../../components/ImageViewer/ImageViewer';
import { Link } from 'react-router-dom';
import { Checkbox } from 'flowbite-react';
import { FaCheckSquare, FaListUl } from 'react-icons/fa';
import { MdGridOn } from 'react-icons/md';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import { RiFolderZipLine } from 'react-icons/ri';

/**
 * @param {Array} inventories - Lista de inventarios (cada inventario con su "id", "model", "images", etc.)
 * @param {Function} onDownloadZip - Función para descargar en ZIP las imágenes seleccionadas.
 */
const InventoriesImagesView = ({ inventories = [], onDownloadZip }) => {
  // Modo de visualización: "grouped" (por inventario) o "flat" (todas juntas)
  const [mode, setMode] = useState('grouped');

  // Estado que almacena las imágenes seleccionadas:
  // Estructura: { [inventoryId]: [imageKey1, imageKey2, ...], ... }
  const [selectedImages, setSelectedImages] = useState({});

  // Función para obtener una "clave" única de cada imagen (puede ser la url, id, o nombre de archivo)
  const getImageKey = (image) => {
    if (image instanceof File) return image.name;
    return image.url || image; // Ajusta según tu estructura
  };

  /**
   * Alterna la selección de una imagen (añadir/quitar del estado)
   */
  const toggleImageSelection = (inventoryId, image) => {
    const key = getImageKey(image);
    setSelectedImages((prev) => {
      const current = prev[inventoryId] || [];
      const isSelected = current.includes(key);
      let updated;
      if (isSelected) {
        // Quitar la imagen de la selección
        updated = current.filter((k) => k !== key);
      } else {
        // Añadir la imagen a la selección
        updated = [...current, key];
      }
      return { ...prev, [inventoryId]: updated };
    });
  };

  /**
   * Selecciona/deselecciona todas las imágenes de un inventario
   */
  const selectAllInInventory = (inventoryId, images) => {
    setSelectedImages((prev) => {
      const allKeys = images.map((img) => getImageKey(img));
      const current = prev[inventoryId] || [];
      // Si ya están todas seleccionadas, se deseleccionan
      if (current.length === allKeys.length) {
        return { ...prev, [inventoryId]: [] };
      }
      // Caso contrario, seleccionamos todas
      return { ...prev, [inventoryId]: allKeys };
    });
  };

  const selectAllInventories = () => {
    const allImages = inventories.reduce((acc, inv) => {
      const keys = inv.images.map((img) => getImageKey(img));
      return { ...acc, [inv.id]: keys };
    }, {});
    setSelectedImages(allImages);
  };

  /**
   * Retorna un array plano con todas las imágenes seleccionadas
   * Estructura de retorno: [{ inventoryId, imageKey }, ...]
   */
  const getAllSelectedImages = () => {
    return Object.entries(selectedImages).reduce((acc, [invId, keys]) => {
      const mapped = keys.map((k) => ({ inventoryId: invId, imageKey: k }));
      return [...acc, ...mapped];
    }, []);
  };

  /**
   * Maneja la descarga de las imágenes seleccionadas
   */
  const handleDownloadZip = (isLowQuality = false) => {
    const imagesToDownload = getAllSelectedImages();
    if (imagesToDownload.length === 0) {
      alert('Selecciona al menos una imagen para descargar las imágenes.');
      return;
    }
    onDownloadZip(imagesToDownload, isLowQuality);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md dark:bg-gray-900">
      {/* Título principal */}
      <h2 className="text-2xl font-semibold mb-4">Inventario por Imágenes</h2>

      {/* Botones para cambiar el modo de visualización */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <ActionButtons
            extraActions={[
              {
                label: 'Listado',
                icon: FaListUl,
                action: () => setMode('grouped'),
                color: 'stone',
              },
              {
                label: 'Cuadrícula',
                icon: MdGridOn,
                action: () => setMode('flat'),
                color: 'stone',
              },
            ]}
          />
        </div>

        {/* Botón para descargar ZIP de las imágenes seleccionadas */}
        <div className="flex gap-2">
          <ActionButtons
            extraActions={[
              {
                label: 'Comprimir',
                icon: RiFolderZipLine,
                action: () => handleDownloadZip(true),
                color: 'teal',
              },
              {
                label: 'Descargar',
                icon: RiFolderZipLine,
                action: () => handleDownloadZip(false),
                color: 'green',
              },
              {
                label: 'Todo',
                icon: FaCheckSquare,
                action: () => selectAllInventories(),
                color: 'blue',
              },
            ]}
          />
        </div>
      </div>

      {/* Renderizado condicional según el modo */}
      {mode === 'grouped' ? (
        // Modo agrupado por inventario
        <div className="space-y-6">
          {inventories?.map((inventory) => {
            const invImages = inventory.images || [];
            return (
              <div
                key={inventory.id}
                className="border rounded p-4 bg-gray-50 dark:bg-gray-800"
              >
                {/* Encabezado del inventario */}
                <div className="flex justify-between items-center mb-4">
                  {/* Link al detalle del inventario */}
                  <Link
                    to={`/inventories/view/${inventory.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {inventory.model?.name || 'Sin nombre'} -{' '}
                    {inventory.model?.brand?.name || 'Sin marca'} -{' '}
                    {inventory.serialNumber || 'S/N'}
                  </Link>

                  {/* Botón para seleccionar todas las imágenes de este inventario */}
                  <Checkbox
                    checked={
                      selectedImages[inventory.id]?.length === invImages.length
                    }
                    onChange={() =>
                      selectAllInInventory(inventory.id, invImages)
                    }
                    title="Seleccionar todas las imágenes"
                    className="cursor-pointer w-7 h-7 text-purple-500 focus:ring-purple-500"
                  />
                </div>

                {/* Grid de imágenes */}
                <div className="flex flex-wrap gap-8">
                  {invImages.map((image, index) => {
                    const key = getImageKey(image);
                    const isSelected =
                      !!selectedImages[inventory.id]?.includes(key);
                    return (
                      <div key={index} className="relative">
                        {/* Usamos ImageViewer para mostrar la imagen (con lightbox y zoom) */}
                        <ImageViewer
                          images={[image]}
                          containerClassNames="w-full h-36 md:h-44 object-cover rounded"
                          // Puedes añadir otras props si deseas
                        />

                        {/* Checkbox para selección */}
                        <div className="absolute top-2 right-2">
                          <Checkbox
                            className="cursor-pointer w-7 h-7 text-purple-500 focus:ring-purple-500"
                            checked={isSelected}
                            onChange={() =>
                              toggleImageSelection(inventory.id, image)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Modo todas las imágenes en una sola cuadrícula
        <div className="flex flex-wrap gap-8">
          {inventories?.flatMap((inventory) => {
            const invImages = inventory.images || [];
            return invImages.map((image, index) => {
              const key = getImageKey(image);
              const isSelected = !!selectedImages[inventory.id]?.includes(key);
              return (
                <div
                  key={`${inventory.id}-${index}`}
                  className="relative bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <ImageViewer
                    images={[image]}
                    containerClassNames="w-full h-36 md:h-44 object-cover rounded"
                  />
                  <div className="absolute top-2 right-2">
                    <Checkbox
                      className="cursor-pointer w-7 h-7 text-purple-500 focus:ring-purple-500"
                      checked={isSelected}
                      onChange={() => toggleImageSelection(inventory.id, image)}
                    />
                  </div>
                </div>
              );
            });
          })}
        </div>
      )}
    </div>
  );
};

export default InventoriesImagesView;
