// File: frontend/src/components/ProjectDetails/Document/ProjectDocumentsViewer.jsx

import React, { useState, useCallback } from 'react';
import ActionButtons from '../../ActionButtons/ActionButtons';
import { RiFolderZipLine } from 'react-icons/ri';
import { BsBadgeHdFill } from 'react-icons/bs';
import { FaCheckSquare, FaFileAlt, FaPlus } from 'react-icons/fa';
import {
  MdInsertDriveFile,
  MdGridView,
  MdPhotoLibrary,
  MdFolderCopy,
} from 'react-icons/md';
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
import { FaTable, FaImages } from 'react-icons/fa';
import classNames from 'classnames';

const ProjectDocumentsViewer = ({ documents = [], onRefresh, projectId }) => {
  const [viewMode, setViewMode] = useState('images');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

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
      .map((img) => ({
        ...img,
        url: img.fileUrl, // 👈 aquí lo normalizamos
      }));

    if (selected.length === 0)
      return Notifies('error', 'Selecciona al menos una imagen');
    downloadImagesAsZip(selected, isCompressed);
  };

  const handleDownloadFiles = () => {
    const selected = files
      .filter((f) => selectedFiles.includes(f.id))
      .map((file) => ({
        ...file,
        url: file.fileUrl, // 👈 normalizamos
      }));

    if (selected.length === 0)
      return Notifies('error', 'Selecciona al menos un archivo');

    downloadFilesAsZip(selected);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
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
                  label: 'Agregar Archivo',
                  icon: FaPlus,
                  color: 'indigo',
                  filled: true,
                  action: () => {
                    setSelectedDoc(null);
                    setShowFormModal(true);
                  },
                },
                {
                  label: 'Cargar múltiples',
                  icon: MdGridView,
                  color: 'indigo',
                  action: () => setShowBulkUploadModal(true),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center justify-end">
        {viewMode === 'images' ? (
          <>
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
                  label: 'Seleccionar todas',
                  icon: FaCheckSquare,
                  color: 'gray',
                  action: () => setSelectedImages(images.map((img) => img.id)),
                  disabled: images.length === 0,
                },
              ]}
            />
          </>
        ) : (
          <>
            <ActionButtons
              extraActions={[
                {
                  label: 'Descargar archivos',
                  icon: RiFolderZipLine,
                  color: 'teal',
                  action: handleDownloadFiles,
                  disabled: selectedFiles.length === 0,
                },
                {
                  label: 'Seleccionar todos',
                  icon: FaCheckSquare,
                  color: 'gray',
                  action: () => setSelectedFiles(files.map((f) => f.id)),
                  disabled: files.length === 0,
                },
              ]}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div>
        {viewMode === 'images' && (
          <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-4">
            {images.map((img) => (
              <ImageViewer
                key={img.id}
                images={[{ ...img, id: img.id, url: img.fileUrl }]}
                showCheckboxes
                selectedImages={selectedImages}
                onImageSelect={() => toggleImageSelection(img.id)}
              />
            ))}
          </div>
        )}

        {viewMode === 'files' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-2 rounded-md border transition cursor-pointer ${
                  selectedFiles.includes(file.id)
                    ? 'border-purple-500 ring-2 ring-purple-300'
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
        document={selectedDoc}
        onSuccess={() => {
          setShowDeleteModal(false);
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default ProjectDocumentsViewer;
