import React, { useState, useCallback } from 'react';
import ImageViewer from '../ImageViewer/ImageViewer2';
import { Checkbox } from 'flowbite-react';
import { FaCheckSquare, FaFileDownload, FaListUl } from 'react-icons/fa';
import { MdInsertDriveFile, MdViewAgenda, MdGridView } from 'react-icons/md';
import ActionButtons from '../ActionButtons/ActionButtons';
import { RiFolderZipLine } from 'react-icons/ri';
import { BsBadgeHdFill } from 'react-icons/bs';
import FileIcon from '../FileIcon/FileIcon';
import formatFileData from '../../utils/fileDataFormatter';
import {
  downloadFilesAsZip,
  downloadImagesAsZip,
} from '../../utils/downloadImagesAsZip';
import Notifies from '../Notifies/Notifies';
import { Link } from 'react-router-dom';

/**
 * @param {Array} data - Lista de elementos (inventarios, etc.) cada uno con su "id", "images", "files".

 */
const TableResources = ({ data = [] }) => {
  const [resourceMode, setResourceMode] = useState('images-grouped');
  const [selectedImages, setSelectedImages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  const getImageKey = (image) => {
    if (image instanceof File) return image.name;
    return image.url || image.path || image.thumbnail || image;
  };

  const getFileKey = (file) => file.id || file.url || file.path || file.name;

  const toggleImageSelection = useCallback((inventoryId, image) => {
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
  }, []);

  const toggleFileSelection = useCallback((inventoryId, file) => {
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
  }, []);

  const selectAllImagesInInventory = (inventoryId, images) => {
    setSelectedImages((prev) => {
      const allKeys = images.map((img) => getImageKey(img));
      const current = prev[inventoryId] || [];
      if (current.length === allKeys.length && allKeys.length > 0) {
        // If all are selected, deselect all
        return { ...prev, [inventoryId]: [] };
      }
      // Otherwise, select all
      return { ...prev, [inventoryId]: allKeys };
    });
  };

  const selectAllFilesInInventory = (inventoryId, files) => {
    setSelectedFiles((prev) => {
      const allKeys = files.map((file) => getFileKey(file));
      const current = prev[inventoryId] || [];
      if (current.length === allKeys.length && allKeys.length > 0) {
        // If all are selected, deselect all
        return { ...prev, [inventoryId]: [] };
      }
      // Otherwise, select all
      return { ...prev, [inventoryId]: allKeys };
    });
  };

  const selectAllOverallImages = () => {
    const allImages = data.reduce((acc, item) => {
      const keys = (item.images || []).map((img) => getImageKey(img));
      return { ...acc, [item.id]: keys };
    }, {});

    // Check if all available images are currently selected
    const totalAvailableImages = data.flatMap(
      (item) => item.images || [],
    ).length;
    const totalSelectedImages = Object.values(selectedImages).flat().length;

    if (
      totalSelectedImages === totalAvailableImages &&
      totalAvailableImages > 0
    ) {
      setSelectedImages({}); // Deselect all
    } else {
      setSelectedImages(allImages); // Select all
    }
  };

  const selectAllOverallFiles = () => {
    const allFiles = data.reduce((acc, item) => {
      const keys = (item.files || []).map((file) => getFileKey(file));
      return { ...acc, [item.id]: keys };
    }, {});

    // Check if all available files are currently selected
    const totalAvailableFiles = data.flatMap((item) => item.files || []).length;
    const totalSelectedFiles = Object.values(selectedFiles).flat().length;

    if (totalSelectedFiles === totalAvailableFiles && totalAvailableFiles > 0) {
      setSelectedFiles({}); // Deselect all
    } else {
      setSelectedFiles(allFiles); // Select all
    }
  };

  const getAllSelectedImages = () => {
    return Object.entries(selectedImages).reduce((acc, [itemId, keys]) => {
      const item = data.find((inv) => String(inv.id) === String(itemId));
      if (!item) return acc;
      const mappedImages = keys
        .map((k) => item.images?.find((img) => getImageKey(img) === k))
        .filter(Boolean); // Filter out undefined if image not found
      return [...acc, ...mappedImages];
    }, []);
  };

  const getAllSelectedFiles = () => {
    return Object.entries(selectedFiles).reduce((acc, [itemId, keys]) => {
      const item = data.find((inv) => String(inv.id) === String(itemId));
      if (!item) return acc;
      const mappedFiles = keys
        .map((k) => item.files?.find((f) => getFileKey(f) === k))
        .filter(Boolean); // Filter out undefined if file not found
      return [...acc, ...mappedFiles];
    }, []);
  };

  const handleDownloadZipClick = (isLowQuality = false) => {
    const imagesToDownload = getAllSelectedImages();
    if (imagesToDownload.length === 0) {
      Notifies('error', 'Selecciona al menos una imagen para descargar.');
      return;
    }
    downloadImagesAsZip(imagesToDownload, isLowQuality);
  };

  const handleDownloadFilesZipClick = () => {
    const filesToDownload = getAllSelectedFiles();
    if (filesToDownload.length === 0) {
      Notifies('error', 'Selecciona al menos un archivo para descargar.');
      return;
    }
    downloadFilesAsZip(filesToDownload);
  };

  const resourceViewModeButtons = [
    {
      label: 'Agrupadas',
      icon: MdViewAgenda,
      action: () => setResourceMode('images-grouped'),
      color: resourceMode === 'images-grouped' ? 'purple' : 'stone',
      filled: resourceMode === 'images-grouped',
    },
    {
      label: 'Planas',
      icon: MdGridView,
      action: () => setResourceMode('images-flat'),
      color: resourceMode === 'images-flat' ? 'purple' : 'stone',
      filled: resourceMode === 'images-flat',
    },
    {
      label: 'Archivos',
      icon: MdInsertDriveFile,
      action: () => setResourceMode('files'),
      color: resourceMode === 'files' ? 'purple' : 'stone',
      filled: resourceMode === 'files',
    },
  ];

  const totalImageCount = data.flatMap((item) => item.images || []).length;
  const totalFileCount = data.flatMap((item) => item.files || []).length;

  return (
    <div className="rounded-lg  dark:bg-gray-900 flex flex-col h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 items-center flex-wrap justify-between w-full">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Recursos del Inventario
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ActionButtons extraActions={resourceViewModeButtons} />
            </div>
          </div>
          <div className="flex-grow md:flex-grow-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Acciones
            </span>
            <div className="flex items-center gap-2">
              {resourceMode === 'images-grouped' ||
              resourceMode === 'images-flat' ? (
                <>
                  <ActionButtons
                    extraActions={[
                      {
                        label: 'Comprimir',
                        icon: RiFolderZipLine,
                        action: () => handleDownloadZipClick(true),
                        color: 'teal',
                        disabled: getAllSelectedImages().length === 0,
                      },
                      {
                        label: 'HD',
                        icon: BsBadgeHdFill,
                        action: () => handleDownloadZipClick(false),
                        color: 'green',
                        disabled: getAllSelectedImages().length === 0,
                      },
                      {
                        label: 'Sel. Todas',
                        icon: FaCheckSquare,
                        action: selectAllOverallImages,
                        color: 'blue',
                        disabled:
                          totalImageCount === 0 ||
                          getAllSelectedImages().length === totalImageCount,
                      },
                    ]}
                  />
                </>
              ) : (
                <ActionButtons
                  extraActions={[
                    {
                      label: 'Comprimir Archivos',
                      icon: RiFolderZipLine,
                      action: handleDownloadFilesZipClick,
                      color: 'teal',
                      disabled: getAllSelectedFiles().length === 0,
                    },
                    {
                      label: 'Seleccionar Todos',
                      icon: FaCheckSquare,
                      action: selectAllOverallFiles,
                      color: 'blue',
                      disabled:
                        totalFileCount === 0 ||
                        getAllSelectedFiles().length === totalFileCount,
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No hay inventarios para mostrar recursos.
          </div>
        )}

        {/* ======================= FILES VIEW ======================= */}
        {resourceMode === 'files' && (
          <div className="space-y-6">
            {data.map((item) => {
              const itemFiles = formatFileData(item.files) || [];
              if (itemFiles.length === 0) return null;

              const selectedCount = (selectedFiles[item.id] || []).length;
              const allSelectedInItem =
                selectedCount === itemFiles.length && itemFiles.length > 0;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      <Link
                        to={`/inventories/view/${item.id}`}
                        className="text-lg font-semibold text-gray-700 dark:text-gray-200"
                      >
                        {item.model?.name || 'Sin nombre'} -{' '}
                        {item.model?.brand?.name || 'Sin marca'} -{' '}
                        {item.model?.type?.name || 'Sin tipo'} -{' '}
                        {item.serialNumber || 'S/N'} - Archivos (
                        {itemFiles.length})
                      </Link>{' '}
                    </h3>
                    <Checkbox
                      checked={allSelectedInItem}
                      onChange={() =>
                        selectAllFilesInInventory(item.id, itemFiles)
                      }
                      className="cursor-pointer w-5 h-5 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {itemFiles.map((file, fileIndex) => {
                      const isFileSelected = (
                        selectedFiles[item.id] || []
                      ).includes(getFileKey(file));
                      return (
                        <div
                          key={getFileKey(file) || fileIndex}
                          className={`relative flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200
                            ${isFileSelected ? 'border-2 border-purple-500 ring-2 ring-purple-300' : 'border border-gray-200 dark:border-gray-600'}`}
                          onClick={() => toggleFileSelection(item.id, file)}
                        >
                          <Checkbox
                            checked={isFileSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleFileSelection(item.id, file);
                            }}
                            className="absolute top-2 right-2 cursor-pointer w-5 h-5 text-purple-500 focus:ring-purple-500"
                          />
                          <FileIcon
                            fileName={file.name}
                            file={file}
                            className="w-16 h-16 mb-2 text-gray-400 dark:text-gray-300"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================= IMAGES GROUPED VIEW ======================= */}
        {resourceMode === 'images-grouped' && (
          <div className="space-y-6">
            {data.map((item) => {
              const itemImages = item.images || [];
              if (itemImages.length === 0) return null;

              const selectedCount = (selectedImages[item.id] || []).length;
              const allSelectedInItem =
                selectedCount === itemImages.length && itemImages.length > 0;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Link
                      to={`/inventories/view/${item.id}`}
                      className="text-lg font-semibold text-gray-700 dark:text-gray-200"
                    >
                      {item.model?.name || 'Sin nombre'} -{' '}
                      {item.model?.brand?.name || 'Sin marca'} -{' '}
                      {item.model?.type?.name || 'Sin tipo'} -{' '}
                      {item.serialNumber || 'S/N'}- Imágenes (
                      {itemImages.length})
                    </Link>
                    <Checkbox
                      checked={allSelectedInItem}
                      onChange={() =>
                        selectAllImagesInInventory(item.id, itemImages)
                      }
                      className="cursor-pointer w-5 h-5 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div
                    className={
                      'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 xl:grid-cols-12 gap-4'
                    }
                  >
                    {itemImages.map((image, imageIndex) => {
                      const key = getImageKey(image);
                      const isImageSelected = (
                        selectedImages[item.id] || []
                      ).includes(key);

                      return (
                        <div
                          key={key || imageIndex}
                          className={`relative group rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 w-full aspect-square ${
                            isImageSelected
                              ? 'border-2 border-purple-500 ring-2 ring-purple-300'
                              : 'border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <ImageViewer
                            images={[{ ...image, id: key }]}
                            containerClassNames="w-full h-full"
                            imageStyles="w-full h-full object-cover"
                            showCheckboxes
                            selectedImages={selectedImages[item.id] || []}
                            onImageSelect={(imageId, checked) =>
                              toggleImageSelection(item.id, image)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================= IMAGES FLAT VIEW ======================= */}
        {resourceMode === 'images-flat' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 xl:grid-cols-12 gap-4">
            {data.flatMap((item) =>
              Array.from(new Set(item.images || [])).map((img) => {
                const key = getImageKey(img);
                const sel = selectedImages[item.id] || [];
                const isSel = sel.includes(key);
                return (
                  <div
                    key={`${item.id}-${key}`}
                    className="relative w-full aspect-square"
                  >
                    <ImageViewer
                      images={[img]}
                      showCheckboxes
                      selectedImages={sel}
                      onImageSelect={() => toggleImageSelection(item.id, img)}
                    />
                  </div>
                );
              }),
            )}
          </div>
          // TODO, CONTINUAR CON HACER QUE LOS CHECKBOXES FUNCIONEN EN LAS IMAGENES EN GENERAL
        )}
      </div>
    </div>
  );
};

export default TableResources;
