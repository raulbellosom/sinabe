import React, { useState } from 'react';
import ImageViewer from '../../../components/ImageViewer/ImageViewer2';
import { Link } from 'react-router-dom';
import { Checkbox } from 'flowbite-react';
import { FaCheckSquare, FaListUl, FaFileDownload } from 'react-icons/fa';
import { MdGridOn, MdInsertDriveFile } from 'react-icons/md';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import { RiFolderZipLine } from 'react-icons/ri';
import { BsBadgeHdFill } from 'react-icons/bs';
import FileIcon from '../../../components/FileIcon/FileIcon';

/**
 * @param {Array} inventories - Lista de inventarios (cada inventario con su "id", "model", "images", "files", etc.)
 * @param {Function} onDownloadZip - Función para descargar en ZIP las imágenes seleccionadas.
 * @param {Function} onDownloadFilesZip - Función para descargar en ZIP los archivos seleccionados.
 */
const InventoriesImagesView = ({
  inventories = [],
  onDownloadZip,
  onDownloadFilesZip,
}) => {
  // Modo de visualización: "grouped" (imágenes por inventario), "flat" (todas las imágenes), "files" (archivos)
  const [mode, setMode] = useState('grouped');

  // Estado para imágenes seleccionadas
  const [selectedImages, setSelectedImages] = useState({});
  // Estado para archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState({});

  // Función para obtener una "clave" única de cada imagen
  const getImageKey = (image) => {
    if (image instanceof File) return image.name;
    return image.url || image; // Ajusta según tu estructura
  };

  // Función para obtener una "clave" única de cada archivo
  const getFileKey = (file) => file.id || file.url || file.name;

  // Alternar selección de imagen
  const toggleImageSelection = (inventoryId, image) => {
    const key = getImageKey(image);
    setSelectedImages((prev) => {
      const current = prev[inventoryId] || [];
      const isSelected = current.includes(key);
      let updated;
      if (isSelected) {
        updated = current.filter((k) => k !== key);
      } else {
        updated = [...current, key];
      }
      return { ...prev, [inventoryId]: updated };
    });
  };

  // Alternar selección de archivo
  const toggleFileSelection = (inventoryId, file) => {
    const key = getFileKey(file);
    setSelectedFiles((prev) => {
      const current = prev[inventoryId] || [];
      const isSelected = current.includes(key);
      let updated;
      if (isSelected) {
        updated = current.filter((k) => k !== key);
      } else {
        updated = [...current, key];
      }
      return { ...prev, [inventoryId]: updated };
    });
  };

  // Seleccionar/deseleccionar todas las imágenes de un inventario
  const selectAllInInventoryImages = (inventoryId, images) => {
    setSelectedImages((prev) => {
      const allKeys = images.map((img) => getImageKey(img));
      const current = prev[inventoryId] || [];
      if (current.length === allKeys.length) {
        return { ...prev, [inventoryId]: [] };
      }
      return { ...prev, [inventoryId]: allKeys };
    });
  };

  // Seleccionar/deseleccionar todos los archivos de un inventario
  const selectAllInInventoryFiles = (inventoryId, files) => {
    setSelectedFiles((prev) => {
      const allKeys = files.map((file) => getFileKey(file));
      const current = prev[inventoryId] || [];
      if (current.length === allKeys.length) {
        return { ...prev, [inventoryId]: [] };
      }
      return { ...prev, [inventoryId]: allKeys };
    });
  };

  // Seleccionar todas las imágenes de todos los inventarios
  const selectAllInventoriesImages = () => {
    const allImages = inventories.reduce((acc, inv) => {
      const keys = inv.images.map((img) => getImageKey(img));
      return { ...acc, [inv.id]: keys };
    }, {});
    setSelectedImages(allImages);
  };

  // Seleccionar todos los archivos de todos los inventarios
  const selectAllInventoriesFiles = () => {
    const allFiles = inventories.reduce((acc, inv) => {
      const keys = inv.files.map((file) => getFileKey(file));
      return { ...acc, [inv.id]: keys };
    }, {});
    setSelectedFiles(allFiles);
  };

  // Array plano con todas las imágenes seleccionadas
  const getAllSelectedImages = () => {
    return Object.entries(selectedImages).reduce((acc, [invId, keys]) => {
      const mapped = keys.map((k) => ({ inventoryId: invId, imageKey: k }));
      return [...acc, ...mapped];
    }, []);
  };

  // Array plano con todos los archivos seleccionados
  const getAllSelectedFiles = () => {
    return Object.entries(selectedFiles).reduce((acc, [invId, keys]) => {
      const mapped = keys
        .map((k) => {
          // Buscar el archivo original para obtener toda su info
          const inventory = inventories.find(
            (inv) => String(inv.id) === String(invId),
          );
          const file = inventory?.files?.find((f) => getFileKey(f) === k);
          return file ? { ...file, inventoryId: invId } : null;
        })
        .filter(Boolean);
      return [...acc, ...mapped];
    }, []);
  };

  // Descargar imágenes seleccionadas
  const handleDownloadZip = (isLowQuality = false) => {
    const imagesToDownload = getAllSelectedImages();
    if (imagesToDownload.length === 0) {
      alert('Selecciona al menos una imagen para descargar.');
      return;
    }
    onDownloadZip(imagesToDownload, isLowQuality);
  };

  // Descargar archivos seleccionados
  const handleDownloadFilesZip = () => {
    const filesToDownload = getAllSelectedFiles();
    if (filesToDownload.length === 0) {
      alert('Selecciona al menos un archivo para descargar.');
      return;
    }
    onDownloadFilesZip(filesToDownload);
  };

  // Descargar archivo individual
  const handleDownloadSingleFile = (file) => {
    // Si tienes la URL directa:
    const link = document.createElement('a');
    link.href = file.url || file.path || file.downloadUrl;
    link.download = file.name || 'archivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizado
  return (
    <div className="p-4 bg-white rounded shadow-md dark:bg-gray-900 relative">
      <h2 className="text-2xl font-semibold mb-4">
        Inventario por {mode === 'files' ? 'Archivos' : 'Imágenes'}
      </h2>

      {/* Botones para cambiar el modo de visualización */}
      <div className="sticky -top-4 z-10 bg p-4 border-b bg-white left-0 flex flex-col md:flex-row items-center justify-between gap-2 mb-4">
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
              {
                label: 'Archivos',
                icon: MdInsertDriveFile,
                action: () => setMode('files'),
                color: 'stone',
              },
            ]}
          />
        </div>

        {/* Botones para descargar ZIP */}
        <div className="flex gap-2">
          {mode === 'files' ? (
            <ActionButtons
              extraActions={[
                {
                  label: 'ZIP',
                  icon: RiFolderZipLine,
                  action: handleDownloadFilesZip,
                  color: 'teal',
                },
                {
                  label: 'Todo',
                  icon: FaCheckSquare,
                  action: selectAllInventoriesFiles,
                  color: 'blue',
                },
              ]}
            />
          ) : (
            <ActionButtons
              extraActions={[
                {
                  label: 'Comprimir',
                  icon: RiFolderZipLine,
                  action: () => handleDownloadZip(true),
                  color: 'teal',
                },
                {
                  label: 'HD',
                  icon: BsBadgeHdFill,
                  action: () => handleDownloadZip(false),
                  color: 'green',
                },
                {
                  label: 'Todo',
                  icon: FaCheckSquare,
                  action: selectAllInventoriesImages,
                  color: 'blue',
                },
              ]}
            />
          )}
        </div>
      </div>

      {/* Renderizado condicional según el modo */}

      {mode === 'files' ? (
        <div className="space-y-6">
          {inventories?.map((inventory) => {
            const invFiles = inventory.files || [];
            // Archivos seleccionados SOLO de este inventario
            const selectedFilesInInventory = (selectedFiles[inventory.id] || [])
              .map((key) => invFiles.find((f) => getFileKey(f) === key))
              .filter(Boolean);

            return (
              <div
                key={inventory.id}
                className="border rounded p-4 bg-gray-50 dark:bg-gray-800"
              >
                {/* Encabezado del inventario */}
                <div className="flex justify-between items-center mb-4">
                  <Link
                    to={`/inventories/view/${inventory.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {inventory.model?.name || 'Sin nombre'} -{' '}
                    {inventory.model?.brand?.name || 'Sin marca'} -{' '}
                    {inventory.model?.type?.name || 'Sin tipo'} -{' '}
                    {inventory.serialNumber || 'S/N'}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedFiles[inventory.id]?.length ===
                          invFiles.length && invFiles.length > 0
                      }
                      onChange={() =>
                        selectAllInInventoryFiles(inventory.id, invFiles)
                      }
                      title="Seleccionar todos los archivos"
                      className="cursor-pointer w-7 h-7 text-purple-500 focus:ring-purple-500"
                    />
                    {/* Botón ZIP por inventario */}
                    <button
                      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Descargar seleccionados en ZIP"
                      onClick={() => {
                        if (selectedFilesInInventory.length === 0) {
                          alert(
                            'Selecciona al menos un archivo para descargar.',
                          );
                          return;
                        }
                        onDownloadFilesZip(selectedFilesInInventory);
                      }}
                    >
                      <RiFolderZipLine className="text-xl text-teal-600" />
                    </button>
                  </div>
                </div>
                {/* Lista de archivos tipo stack */}
                <div className="flex flex-col gap-2">
                  {invFiles.length === 0 && (
                    <div className="text-gray-500 py-4">
                      Sin archivos disponibles.
                    </div>
                  )}
                  {invFiles.map((file) => {
                    const key = getFileKey(file);
                    const isSelected =
                      !!selectedFiles[inventory.id]?.includes(key);
                    // Usar el nombre original del archivo
                    const fileWithInfo = {
                      ...file,
                      name:
                        file.metadata?.originalname ||
                        file.name ||
                        file.originalName ||
                        'Archivo',
                    };
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded px-2 py-1 shadow-sm"
                      >
                        <Checkbox
                          className="cursor-pointer text-purple-500 focus:ring-purple-500"
                          checked={isSelected}
                          onChange={() =>
                            toggleFileSelection(inventory.id, file)
                          }
                        />
                        <div className="flex-1">
                          <FileIcon file={fileWithInfo} />
                        </div>
                        {/* No agregues botón de descarga aquí, FileIcon ya lo tiene */}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : mode === 'grouped' ? (
        // ...modo imágenes agrupadas (igual que antes)...
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
                  <Link
                    to={`/inventories/view/${inventory.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {inventory.model?.name || 'Sin nombre'} -{' '}
                    {inventory.model?.brand?.name || 'Sin marca'} -{' '}
                    {inventory.serialNumber || 'S/N'}
                  </Link>
                  <Checkbox
                    checked={
                      selectedImages[inventory.id]?.length === invImages.length
                    }
                    onChange={() =>
                      selectAllInInventoryImages(inventory.id, invImages)
                    }
                    title="Seleccionar todas las imágenes"
                    className="cursor-pointer w-7 h-7 text-purple-500 focus:ring-purple-500"
                  />
                </div>
                {/* Grid de imágenes */}
                <div className="flex flex-wrap gap-3 md:gap-8">
                  {invImages.map((image, index) => {
                    const key = getImageKey(image);
                    const isSelected =
                      !!selectedImages[inventory.id]?.includes(key);
                    return (
                      <div key={index} className="relative">
                        <ImageViewer
                          images={[image]}
                          containerClassNames="w-28 h-28"
                        />
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
        // ...modo imágenes plano (igual que antes)...
        <div className="flex flex-wrap gap-4 md:gap-8">
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
                    containerClassNames="w-12 h-12 min-w-12 min-h-12"
                    imageStyles="w-12 h-12"
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
