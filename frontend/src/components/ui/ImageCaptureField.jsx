import { useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Capacitor } from '@capacitor/core';
import { Camera, ImagePlus, X } from 'lucide-react';

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
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
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

    inputRef.current?.click();
  };

  const handleRemove = (indexToRemove) => {
    onChange(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="text-sm"
        >
          <ImagePlus className="w-4 h-4" />
          Seleccionar
        </Button>
        <Button
          variant="ghost"
          disabled={disabled || busy}
          onClick={handleTakePhoto}
          className="text-sm"
        >
          <Camera className="w-4 h-4" />
          Usar cámara
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || busy}
      />

      {files.length ? (
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
      ) : (
        <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]">
          <p className="text-sm text-[color:var(--foreground-muted)]">
            Sin imágenes
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageCaptureField;
