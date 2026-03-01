import { useState } from 'react';
import ModalViewer from '../Modals/ModalViewer';
import ActionButtons from '../ActionButtons/ActionButtons';
import DownloadFileImage from '../../assets/images/download_file.webp';
import { API_URL, downloadFile } from '../../services/api';
import classNames from 'classnames';
import { FallingLines } from 'react-loader-spinner';

import {
  AlertCircle,
  CloudCheck,
  Eye,
  File as FileGenericIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  Save,
  X,
} from 'lucide-react';

const FileIcon = ({ file, className, size, onRemove }) => {
  const [isModalDownloadOpen, setIsModalDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloadingError, setIsDownloadingError] = useState(false);
  const iconSize = size || 22;

  if (!file) return null;

  const getIcon = (file) => {
    if (!file) return <FileGenericIcon className="text-stone-400" size={iconSize} />;
    if (file.type?.includes('pdf')) {
      return <FileText className="text-red-500" size={iconSize} />;
    } else if (
      file.type?.includes('excel') ||
      file.type?.includes('spreadsheetml')
    ) {
      return <FileSpreadsheet className="text-green-500" size={iconSize} />;
    } else if (file.type?.includes('csv')) {
      return <FileSpreadsheet className="text-lime-500" size={iconSize} />;
    } else if (file.type?.includes('image')) {
      return <FileImage className="text-cyan-500" size={iconSize} />;
    } else if (file.type?.includes('powerpoint')) {
      return <Presentation className="text-purple-500" size={iconSize} />;
    } else if (file.type?.includes('word')) {
      return <FileText className="text-blue-500" size={iconSize} />;
    } else if (file.type?.includes('video')) {
      return <FileVideo className="text-indigo-500" size={iconSize} />;
    } else {
      return <FileGenericIcon className="text-stone-400" size={iconSize} />;
    }
  };

  const handleOpenPdf = () => {
    if (file && file.type?.includes('pdf')) {
      const url = getFileUrl(file);
      if (url) window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setIsDownloadingError(false);
    setIsDownloaded(false);

    downloadFile(file)
      .then(() => {
        setIsDownloaded(true);
      })
      .catch(() => {
        setIsDownloadingError(true);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };
  const getFileUrl = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else if (!file.url) {
      return null;
    } else if (file.url.startsWith('http') || file.url.startsWith('https')) {
      return file.url;
    } else {
      const cleanApiUrl = API_URL.replace(/\/$/, '');
      const cleanFileUrl = file.url.startsWith('/') ? file.url : `/${file.url}`;
      return `${cleanApiUrl}${cleanFileUrl}`;
    }
  };

  return (
    <>
      <div
        className={classNames(
          'h-full w-full flex items-center gap-4 justify-between p-2 rounded-md transition-all cursor-pointer hover:bg-stone-100 ease-in-out duration-100 truncate',
          className,
        )}
      >
        <div className="flex items-center truncate">
          <span>{getIcon(file)}</span>
          <span className="ml-2 truncate text-sm md:text-base">
            {file.name}
          </span>
        </div>
        <div className="flex items-center justify-evenly gap-2">
          {file.type?.includes('pdf') && (
            <span onClick={handleOpenPdf}>
              <Eye className="text-blue-500 cursor-pointer" size={iconSize} />
            </span>
          )}
          {!(file instanceof File) && (
            <span onClick={() => setIsModalDownloadOpen(true)}>
              <Save className="text-green-500 cursor-pointer" size={iconSize} />
            </span>
          )}

          {onRemove && (
            <span>
              <X
                className=" text-red-500 cursor-pointer"
                size={iconSize}
                onClick={onRemove}
              />
            </span>
          )}
        </div>
      </div>

      {isModalDownloadOpen && (
        <ModalViewer
          title="Descargar Archivo"
          isOpenModal={isModalDownloadOpen}
          onCloseModal={() => setIsModalDownloadOpen(false)}
        >
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <img
              src={DownloadFileImage}
              alt="Download File"
              className="h-48 w-auto"
            />
            <p className="text-lg font-semibold">
              ¿Deseas descargar el archivo?
            </p>
            <span className="text-sm text-neutral-500">{file.name}</span>
            <div className="flex gap-4">
              {!isDownloading && (
                <ActionButtons
                  extraActions={[
                    {
                      label: 'Descargar',
                      icon: Save,
                      action: handleDownload,
                      color: 'green',
                    },
                  ]}
                  onCancel={() => setIsModalDownloadOpen(false)}
                />
              )}
            </div>
            {/* Barra de progreso */}
            {isDownloading && (
              <FallingLines
                width={80}
                color="#ff5a1f"
                ariaLabel="falling-circles-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            )}
            {isDownloaded && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-500">Descargado</span>
                <CloudCheck className="text-green-500" size={iconSize} />
              </div>
            )}
            {isDownloadingError && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-red-500">Error al descargar</span>
                <AlertCircle className="text-red-500" size={iconSize} />
              </div>
            )}
          </div>
        </ModalViewer>
      )}
    </>
  );
};

export default FileIcon;
