import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useFormikContext } from 'formik';
import { Image, Paperclip, Upload } from 'lucide-react';
import { isImageFile } from '../../config/fileTypes';

const MAX_IMAGE_MB = 3;

const compressImage = async (file) => {
  if (file.size <= MAX_IMAGE_MB * 1024 * 1024) return file;
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_IMAGE_MB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
  return new File([compressed], file.name, {
    type: compressed.type,
    lastModified: Date.now(),
  });
};

/**
 * GlobalDropZone
 *
 * Wraps inventory form content. Listens for drag events on the entire document.
 * When files are dropped anywhere on the screen:
 *   - image/* → appended to formik field `images`
 *   - everything else → appended to formik field `files`
 *
 * Must be rendered inside a <FormikProvider>.
 */
const GlobalDropZone = ({
  children,
  imagesField = 'images',
  filesField = 'files',
}) => {
  const { values, setFieldValue } = useFormikContext();
  const [dragging, setDragging] = useState(false);
  const [processingImages, setProcessingImages] = useState(0);
  const [processingFiles, setProcessingFiles] = useState(0);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e) => {
      // Only activate when there are actual files in the drag payload
      if (!e.dataTransfer?.types?.includes('Files')) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) setDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setDragging(false);
      }
    };

    const handleDragOver = (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return;
      e.preventDefault();
      // Keep the "copy" cursor
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setDragging(false);

      const dropped = Array.from(e.dataTransfer.files || []);
      if (!dropped.length) return;

      const imageFiles = dropped.filter(isImageFile);
      const otherFiles = dropped.filter((f) => !isImageFile(f));

      if (imageFiles.length) {
        setProcessingImages(imageFiles.length);
        try {
          const compressed = await Promise.all(imageFiles.map(compressImage));
          const current = Array.isArray(values[imagesField])
            ? values[imagesField]
            : [];
          setFieldValue(imagesField, [...current, ...compressed]);
        } finally {
          setProcessingImages(0);
        }
      }

      if (otherFiles.length) {
        setProcessingFiles(otherFiles.length);
        try {
          const current = Array.isArray(values[filesField])
            ? values[filesField]
            : [];
          setFieldValue(filesField, [...current, ...otherFiles]);
        } finally {
          setProcessingFiles(0);
        }
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [values, imagesField, filesField, setFieldValue]);

  const isProcessing = processingImages > 0 || processingFiles > 0;

  const overlay = (
    <AnimatePresence>
      {(dragging || isProcessing) && (
        <motion.div
          key="global-drop-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-10000 flex flex-col items-center justify-center pointer-events-none"
          style={{ backdropFilter: 'blur(6px)' }}
        >
          {/* Dark tinted background */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Animated dashed border frame */}
          <motion.div
            className="absolute inset-3 sm:inset-6 rounded-2xl border-4 border-dashed border-white/40"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22 }}
          />

          {/* Content card — responsive sizing */}
          <motion.div
            className={[
              'relative z-10 flex flex-col items-center text-center text-white',
              'gap-4 sm:gap-6',
              'px-6 py-7 sm:px-12 sm:py-10',
              'mx-4 w-[min(90vw,420px)]',
              'rounded-2xl sm:rounded-3xl',
              /* Glass card with visible depth */
              'bg-white/15 backdrop-blur-sm',
              'border border-white/30',
              'shadow-[0_8px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]',
            ].join(' ')}
            initial={{ y: 16, opacity: 0, scale: 0.93 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {isProcessing ? (
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <p
                  className="text-lg sm:text-xl font-bold tracking-wide"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                  Procesando archivos…
                </p>
              </>
            ) : (
              <>
                {/* Bouncing upload icon with glow */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.3,
                    ease: 'easeInOut',
                  }}
                  className="p-4 rounded-full bg-white/20 border border-white/30 shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                >
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>

                {/* Main text */}
                <div className="space-y-1">
                  <p
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
                  >
                    Suelta los archivos aquí
                  </p>
                  <p
                    className="text-sm sm:text-base text-white/75 font-medium"
                    style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
                  >
                    Se clasificarán automáticamente
                  </p>
                </div>

                {/* Classification hints */}
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 w-full justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/25 shadow-inner">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span
                      className="text-xs sm:text-sm font-semibold whitespace-nowrap"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                    >
                      Imágenes → Galería
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/25 shadow-inner">
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span
                      className="text-xs sm:text-sm font-semibold whitespace-nowrap"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                    >
                      Otros → Archivos
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {children}
      {typeof document !== 'undefined' && createPortal(overlay, document.body)}
    </>
  );
};

export default GlobalDropZone;
