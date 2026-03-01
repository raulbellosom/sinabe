import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ModalViewer from '../Modals/ModalViewer';
import ActionButtons from '../ActionButtons/ActionButtons';
import DownloadFileImage from '../../assets/images/download_file.webp';
import { API_URL, downloadFile } from '../../services/api';
import classNames from 'classnames';
import { FallingLines } from 'react-loader-spinner';

import {
  AlertCircle,
  CloudCheck,
  Download,
  Eye,
  File as FileGenericIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  MoreVertical,
  Presentation,
  Trash2,
} from 'lucide-react';

const MENU_WIDTH = 160;

const FileIcon = ({ file, className, onRemove }) => {
  const [isModalDownloadOpen, setIsModalDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloadingError, setIsDownloadingError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const iconSize = 18;

  if (!file) return null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMenu = () => {
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 120; // approx max height
    const top =
      spaceBelow >= menuHeight
        ? rect.bottom + 4
        : rect.top - menuHeight - 4;
    // keep within horizontal bounds
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > window.innerWidth - 8)
      left = window.innerWidth - MENU_WIDTH - 8;
    setMenuPos({ top, left });
    setMenuOpen((prev) => !prev);
  };

  const getFileAccent = (file) => {
    if (!file)
      return { text: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' };
    if (file.type?.includes('pdf'))
      return { text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' };
    if (file.type?.includes('excel') || file.type?.includes('spreadsheetml'))
      return { text: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' };
    if (file.type?.includes('csv'))
      return { text: 'text-lime-500', bg: 'bg-lime-50 dark:bg-lime-900/30' };
    if (file.type?.includes('image'))
      return { text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/30' };
    if (file.type?.includes('powerpoint'))
      return {
        text: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-900/30',
      };
    if (file.type?.includes('word'))
      return { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' };
    if (file.type?.includes('video'))
      return {
        text: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      };
    return { text: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' };
  };

  const getIcon = (file) => {
    const { text } = getFileAccent(file);
    if (!file) return <FileGenericIcon className={text} size={iconSize} />;
    if (file.type?.includes('pdf'))
      return <FileText className={text} size={iconSize} />;
    if (file.type?.includes('excel') || file.type?.includes('spreadsheetml'))
      return <FileSpreadsheet className={text} size={iconSize} />;
    if (file.type?.includes('csv'))
      return <FileSpreadsheet className={text} size={iconSize} />;
    if (file.type?.includes('image'))
      return <FileImage className={text} size={iconSize} />;
    if (file.type?.includes('powerpoint'))
      return <Presentation className={text} size={iconSize} />;
    if (file.type?.includes('word'))
      return <FileText className={text} size={iconSize} />;
    if (file.type?.includes('video'))
      return <FileVideo className={text} size={iconSize} />;
    return <FileGenericIcon className={text} size={iconSize} />;
  };

  const getFileUrl = (file) => {
    if (file instanceof File) return URL.createObjectURL(file);
    if (!file.url) return null;
    if (file.url.startsWith('http') || file.url.startsWith('https'))
      return file.url;
    const cleanApiUrl = API_URL.replace(/\/$/, '');
    const cleanFileUrl = file.url.startsWith('/') ? file.url : `/${file.url}`;
    return `${cleanApiUrl}${cleanFileUrl}`;
  };

  const handleOpenFile = () => {
    const url = getFileUrl(file);
    if (url) window.open(url, '_blank');
    setMenuOpen(false);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setIsDownloadingError(false);
    setIsDownloaded(false);
    downloadFile(file)
      .then(() => setIsDownloaded(true))
      .catch(() => setIsDownloadingError(true))
      .finally(() => setIsDownloading(false));
  };

  const { bg } = getFileAccent(file);
  const canPreview = !!getFileUrl(file);
  const canDownload = !(file instanceof File);

  const menuItems = [
    canPreview && {
      label: 'Abrir',
      icon: Eye,
      onClick: handleOpenFile,
      className: 'text-blue-600 dark:text-blue-400',
    },
    canDownload && {
      label: 'Descargar',
      icon: Download,
      onClick: () => {
        setMenuOpen(false);
        setIsModalDownloadOpen(true);
      },
      className: 'text-green-600 dark:text-green-400',
    },
    onRemove && {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => {
        setMenuOpen(false);
        onRemove();
      },
      className: 'text-red-500 dark:text-red-400',
    },
  ].filter(Boolean);

  return (
    <>
      <div
        className={classNames(
          'group flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 transition-colors hover:bg-[color:var(--surface-hover,color-mix(in_srgb,var(--surface)_92%,black))] dark:hover:bg-white/5',
          className,
        )}
      >
        {/* File type icon badge */}
        <div
          className={classNames(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            bg,
          )}
        >
          {getIcon(file)}
        </div>

        {/* File name */}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--foreground)]">
          {file.name}
        </span>

        {/* 3-dot menu */}
        {menuItems.length > 0 && (
          <div className="shrink-0">
            <button
              ref={btnRef}
              type="button"
              onClick={openMenu}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              title="Opciones"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Portal dropdown — renders outside any overflow container */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
            className="fixed z-[9999] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl ring-1 ring-black/5 dark:ring-white/10"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={classNames(
                    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                    item.className,
                  )}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}

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
            <p className="text-lg font-semibold text-[color:var(--foreground)]">
              ¿Deseas descargar el archivo?
            </p>
            <span className="text-sm text-[color:var(--foreground-muted)]">
              {file.name}
            </span>
            <div className="flex gap-4">
              {!isDownloading && (
                <ActionButtons
                  extraActions={[
                    {
                      label: 'Descargar',
                      icon: Download,
                      action: handleDownload,
                      color: 'green',
                    },
                  ]}
                  onCancel={() => setIsModalDownloadOpen(false)}
                />
              )}
            </div>
            {isDownloading && (
              <FallingLines
                width={80}
                color="#ff5a1f"
                ariaLabel="falling-circles-loading"
              />
            )}
            {isDownloaded && (
              <div className="flex items-center gap-2 text-green-500">
                <CloudCheck size={18} />
                <span>Descargado</span>
              </div>
            )}
            {isDownloadingError && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={18} />
                <span>Error al descargar</span>
              </div>
            )}
          </div>
        </ModalViewer>
      )}
    </>
  );
};

export default FileIcon;
