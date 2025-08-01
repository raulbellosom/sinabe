// File: frontend/src/components/ProjectDetails/Document/ProjectDocumentsViewer.jsx

import React, { useState, useCallback } from 'react';
import ActionButtons from '../../ActionButtons/ActionButtons';
import { RiFolderZipLine } from 'react-icons/ri';
import { BsBadgeHdFill } from 'react-icons/bs';
import { FaCheckSquare, FaFileAlt, FaTrash } from 'react-icons/fa';
import { MdFolderCopy } from 'react-icons/md';
import ImageViewer from '../../ImageViewer/ImageViewer2';
import FileIcon from '../../FileIcon/FileIcon';
import Notifies from '../../Notifies/Notifies';
import {
  downloadFilesAsZip,
  downloadImagesAsZip,
} from '../../../utils/downloadImagesAsZip';
import ProjectDocumentFormModal from './ProjectDocumentFormModal';
import ConfirmDeleteProjectDocumentModal from './ConfirmDeleteProjectDocumentModal';
import ProjectBulkUploadModal from './ProjectBulkUploadModal';
import { Tooltip } from 'flowbite-react';
import { FaImages } from 'react-icons/fa';
import classNames from 'classnames';
import { FaFileArrowUp } from 'react-icons/fa6';
import { useMediaQuery } from 'react-responsive';
import { useDeleteProjectDocument } from '../../../hooks/useProjectDocuments';

const ProjectDocumentsViewer = ({ documents = [], onRefresh, projectId }) => {
  const [viewMode, setViewMode] = useState('images');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const deleteMutation = useDeleteProjectDocument(projectId);

  const images = documents.filter((doc) =>
    doc.metadata?.mimetype?.startsWith('image/'),
  );
  const files = documents.filter(
    (doc) => !doc.metadata?.mimetype?.startsWith('image/'),
  );

  const toggleImageSelection = useCallback((id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((img) => img !== id) : [...prev, id],
    );
  }, []);

  const toggleFileSelection = useCallback((id) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }, []);

  const handleDownloadImages = (isCompressed = false) => {
    const selected = images
      .filter((img) => selectedImages.includes(img.id))
      .map((img) => ({ ...img, url: img.fileUrl }));
    if (selected.length === 0)
      return Notifies('error', 'Selecciona al menos una imagen');
    downloadImagesAsZip(selected, isCompressed);
  };

  const handleDownloadFiles = () => {
    const selected = files
      .filter((f) => selectedFiles.includes(f.id))
      .map((file) => ({ ...file, url: file.fileUrl }));
    if (selected.length === 0)
      return Notifies('error', 'Selecciona al menos un archivo');
    downloadFilesAsZip(selected);
  };

  const handleBulkDelete = (ids) => {
    if (ids.length === 0) {
      return Notifies('error', 'Selecciona al menos un ítem');
    }
    // Solo abrimos el modal; la mutación la disparará el modal
    setShowDeleteModal(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col justify-between items-start md:items-center gap-6">
        <div className="flex flex-col justify-start w-full">
          <h2 className="text-base md:text-lg font-semibold">
            <FaFileAlt className="inline mr-2 text-sinabe-primary" />
            Documentos del Proyecto
          </h2>
          <p className="text-sm text-gray-500">
            Imágenes y archivos asociados al proyecto.
          </p>
        </div>
        <div className="flex w-full gap-2 items-center justify-between">
          <div className="flex items-center space-x-2 border rounded-md p-1">
            <Tooltip content="Vista de Imágenes">
              <button
                onClick={() => setViewMode('images')}
                className={classNames(
                  'p-2 rounded-md transition-colors duration-200',
                  {
                    'bg-purple-600 text-white': viewMode === 'images',
                    'text-gray-600 hover:bg-gray-200': viewMode !== 'images',
                  },
                )}
              >
                <FaImages className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip content="Vista de Archivos">
              <button
                onClick={() => setViewMode('files')}
                className={classNames(
                  'p-2 rounded-md transition-colors duration-200',
                  {
                    'bg-purple-600 text-white': viewMode === 'files',
                    'text-gray-600 hover:bg-gray-200': viewMode !== 'files',
                  },
                )}
              >
                <MdFolderCopy className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 text-nowrap">
            <ActionButtons
              extraActions={[
                {
                  label: isMobile ? 'Documentos' : 'Agregar Doc',
                  icon: FaFileArrowUp,
                  color: 'indigo',
                  filled: true,
                  action: () => {
                    setSelectedDoc(null);
                    setShowFormModal(true);
                  },
                },
                {
                  label: isMobile ? 'Imágenes' : 'Subir Imágenes',
                  icon: FaImages,
                  color: 'indigo',
                  action: () => setShowBulkUploadModal(true),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 md:flex gap-4 items-center justify-end">
        {viewMode === 'images' ? (
          <ActionButtons
            extraActions={[
              {
                label: 'Comprimir',
                icon: RiFolderZipLine,
                color: 'teal',
                action: () => handleDownloadImages(true),
                disabled: selectedImages.length === 0,
              },
              {
                label: 'HD',
                icon: BsBadgeHdFill,
                color: 'blue',
                action: () => handleDownloadImages(false),
                disabled: selectedImages.length === 0,
              },
              {
                label:
                  selectedImages.length === images.length && images.length > 0
                    ? isMobile
                      ? 'Deseleccionar'
                      : 'Deseleccionar todas'
                    : isMobile
                      ? 'Todas'
                      : 'Seleccionar todas',
                icon: FaCheckSquare,
                color: 'gray',
                action: () =>
                  selectedImages.length === images.length
                    ? setSelectedImages([])
                    : setSelectedImages(images.map((img) => img.id)),
                disabled: images.length === 0,
              },
              {
                label: isMobile ? 'Eliminar' : 'Eliminar seleccionados',
                icon: FaTrash,
                color: 'red',
                action: () => handleBulkDelete(selectedImages),
                disabled: selectedImages.length === 0,
              },
            ]}
          />
        ) : (
          <ActionButtons
            extraActions={[
              {
                label: isMobile ? 'Descargar' : 'Descargar archivos',
                icon: RiFolderZipLine,
                color: 'teal',
                action: handleDownloadFiles,
                disabled: selectedFiles.length === 0,
              },
              {
                label:
                  selectedFiles.length === files.length && files.length > 0
                    ? isMobile
                      ? 'Deseleccionar'
                      : 'Deseleccionar todos'
                    : isMobile
                      ? 'Todos'
                      : 'Seleccionar todos',
                icon: FaCheckSquare,
                color: 'gray',
                action: () =>
                  selectedFiles.length === files.length
                    ? setSelectedFiles([])
                    : setSelectedFiles(files.map((f) => f.id)),
                disabled: files.length === 0,
              },
              {
                label: isMobile ? 'Eliminar' : 'Eliminar seleccionados',
                icon: FaTrash,
                color: 'red',
                action: () => handleBulkDelete(selectedFiles),
                disabled: selectedFiles.length === 0,
              },
            ]}
          />
        )}
      </div>

      {/* Content */}
      <div>
        {viewMode === 'images' && (
          <ImageViewer
            images={images.map((img) => ({
              ...img,
              id: img.id,
              url: img.fileUrl,
            }))}
            containerClassNames="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-4"
            showCheckboxes
            selectedImages={selectedImages}
            onImageSelect={toggleImageSelection}
          />
        )}
        {viewMode === 'files' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-2 rounded-md border transition cursor-pointer ${
                  selectedFiles.includes(file.id)
                    ? 'border-purple-500 ring-2 ring-purple-300 m-2'
                    : 'border-gray-200'
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <FileIcon
                  file={{
                    ...file,
                    type: file.metadata?.mimetype,
                    url: file.fileUrl,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <ProjectDocumentFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        projectId={projectId}
        document={selectedDoc}
        onSuccess={() => {
          setShowFormModal(false);
          onRefresh?.();
        }}
      />
      <ProjectBulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        projectId={projectId}
        onSuccess={() => {
          setShowBulkUploadModal(false);
          onRefresh?.();
        }}
      />
      <ConfirmDeleteProjectDocumentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        documents={
          viewMode === 'images'
            ? images.filter((img) => selectedImages.includes(img.id))
            : files.filter((f) => selectedFiles.includes(f.id))
        }
        projectId={projectId}
        onSuccess={() => {
          setShowDeleteModal(false);
          if (viewMode === 'images') setSelectedImages([]);
          else setSelectedFiles([]);
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default ProjectDocumentsViewer;
