import { useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Capacitor } from '@capacitor/core';
import { Camera, ImagePlus, X } from 'lucide-react';

import Button from './Button';
import cn from './cn';
import { useNativeCamera } from '../../hooks/useNativeCamera';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file, index) => {
            const fileUrl = file instanceof File 
              ? URL.createObjectURL(file) 
              : FormattedUrlImage(file?.url || file?.thumbnail || file);
            return (
              <article
                key={`${file.name || 'image'}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]"
              >
                <img
                  src={fileUrl}
                  alt={`Imagen ${index + 1}`}
                  className="h-24 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[color:var(--danger)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </article>
            );
          })}
        </div>
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
