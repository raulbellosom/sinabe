import { useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Capacitor } from '@capacitor/core';
import { Camera, ImagePlus, Upload } from 'lucide-react';

import Button from './Button';
import cn from './cn';
import { useNativeCamera } from '../../hooks/useNativeCamera';
import ImageViewer from '../ImageViewer/ImageViewer2';

const toFileFromBase64 = async (base64String) => {
  const blob = await fetch(`data:image/jpeg;base64,${base64String}`).then(
    (res) => res.blob(),
  );

  return new File([blob], `photo_${Date.now()}.jpg`, {
    type: blob.type || 'image/jpeg',
  });
};

const ImageCaptureField = ({
  value = [],
  onChange = () => {},
  maxSizeMB = 3,
  className = '',
  disabled = false,
}) => {
  // Separate refs: one for gallery/file picker, one for camera (web fallback)
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { openCamera } = useNativeCamera();

  const files = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const processFile = async (file) => {
    if (!file) return null;

    if (file.size <= maxSizeMB * 1024 * 1024) {
      return file;
    }

    const compressed = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    return new File([compressed], file.name, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  };

  const appendFiles = async (incoming) => {
    setBusy(true);

    try {
      const normalized = await Promise.all(incoming.map(processFile));
      const nextFiles = [...files, ...normalized.filter(Boolean)];
      onChange(nextFiles);
    } finally {
      setBusy(false);
    }
  };

  const handleFileChange = async (event) => {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;
    await appendFiles(incoming);
    event.target.value = '';
  };

  const handleTakePhoto = async () => {
    if (disabled || busy) return;

    if (Capacitor.isNativePlatform()) {
      const photo = await openCamera();
      if (photo?.base64String) {
        const file = await toFileFromBase64(photo.base64String);
        await appendFiles([file]);
      }
      return;
    }

    // Web fallback: trigger the camera-capture input
    cameraInputRef.current?.click();
  };

  const handleRemove = (indexToRemove) => {
    onChange(files.filter((_, index) => index !== indexToRemove));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !busy) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || busy) return;
    const incoming = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (!incoming.length) return;
    await appendFiles(incoming);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Always-visible dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full p-4 rounded-lg border-2 border-dashed transition-all duration-200',
          disabled
            ? 'opacity-60 cursor-not-allowed border-[color:var(--border)] bg-[color:var(--surface-muted)]'
            : isDragging
              ? 'border-[color:var(--primary)] bg-[color:var(--primary)]/5'
              : 'border-[color:var(--border)] bg-[color:var(--surface-muted)] hover:border-[color:var(--primary)]/50',
        )}
      >
        <Upload className="w-7 h-7 mb-2 text-[color:var(--foreground-muted)]" />
        <p className="text-sm text-[color:var(--foreground-muted)] mb-3">
          {isDragging
            ? 'Suelta las imágenes aquí'
            : 'Arrastra imágenes aquí o usa los botones'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || busy}
            onClick={() => fileInputRef.current?.click()}
            className="text-sm"
          >
            <ImagePlus className="w-4 h-4" />
            Seleccionar
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || busy}
            onClick={handleTakePhoto}
            className="text-sm"
          >
            <Camera className="w-4 h-4" />
            Usar cámara
          </Button>
        </div>
      </div>

      {/* File picker input — no capture attribute */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || busy}
      />

      {/* Camera input — web fallback only, with capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || busy}
      />

      {/* Images grid */}
      {files.length > 0 && (
        <ImageViewer
          images={files.map((file, index) => ({
            id: file.id || index,
            url: file instanceof File ? file : file?.url || file,
            thumbnail:
              file instanceof File
                ? file
                : file?.thumbnail || file?.url || file,
            name: file.name || `image-${index}`,
          }))}
          onRemove={(imageId) => {
            const indexToRemove =
              typeof imageId === 'number'
                ? imageId
                : files.findIndex((f, i) => (f.id || i) === imageId);
            if (indexToRemove !== -1) handleRemove(indexToRemove);
          }}
          containerClassNames="grid grid-cols-2 gap-3 sm:grid-cols-3"
          imageStyles="h-24"
        />
      )}
    </div>
  );
};

export default ImageCaptureField;
