import React from 'react';
import { FileInput, Label } from 'flowbite-react';
import { ErrorMessage } from 'formik';
import ImageViewer from '../ImageViewer/ImageViewer2';
import classNames from 'classnames';
import imageCompression from 'browser-image-compression';
import Notifies from '../Notifies/Notifies';
import { IoMdCloudUpload } from 'react-icons/io';
import { useNativeCamera } from '../../hooks/useNativeCamera';
import { useMediaQuery } from 'react-responsive';
import { FaCamera } from 'react-icons/fa';

const ImagePicker = ({
  className,
  field,
  form: { setFieldValue, touched, errors },
  ...props
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { openCamera } = useNativeCamera();

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/heic',
    'image/heif',
  ];
  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
    '.heic',
    '.heif',
  ];

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    const currentFiles = field.value || [];
    const processedFiles = [];

    for (const file of files) {
      const ext =
        file.name?.toLowerCase().slice(file.name.lastIndexOf('.')) || '';
      if (
        allowedTypes.includes(file.type) ||
        (file.type === '' && allowedExtensions.includes(ext))
      ) {
        try {
          if (file.size > 3 * 1024 * 1024) {
            const compressed = await imageCompression(file, {
              maxSizeMB: 3,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });

            const newFile = new File([compressed], file.name, {
              type: compressed.type,
              lastModified: Date.now(),
            });

            processedFiles.push(newFile);
          } else {
            processedFiles.push(file);
          }
        } catch (error) {
          console.error('Error al comprimir la imagen:', error);
          Notifies('error', `Error al comprimir la imagen "${file.name}"`);
        }
      } else {
        Notifies('error', `Tipo de archivo no permitido: ${file.name}`);
      }
    }

    setFieldValue(field.name, [...(field.value || []), ...processedFiles]);
  };

  const handleRemoveImage = (idOrIndex) => {
    const updatedFiles = field.value.filter((img, i) =>
      img.id !== undefined ? img.id !== idOrIndex : i !== idOrIndex,
    );
    setFieldValue(field.name, updatedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange({ target: { files: Array.from(e.dataTransfer.files) } });
  };

  const handleOpenCamera = async () => {
    const uri = await openCamera();
    if (uri) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: blob.type,
      });
      setFieldValue(field.name, [...(field.value || []), file]);
    }
  };

  const hasImages = field.value && field.value.length > 0;

  return (
    <div className={classNames('w-full h-fit overflow-hidden', className)}>
      <Label
        htmlFor={props.id || props.name}
        className="block text-sm font-medium"
        color={touched[field.name] && errors[field.name] ? 'failure' : ''}
        value={props.label}
      />

      {hasImages ? (
        <div
          className={classNames(
            'mt-1 gap-2 grid grid-cols-[repeat(auto-fill,_minmax(100px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(100px,_1fr))]',
          )}
        >
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() =>
              document.getElementById(props.id || props.name).click()
            }
            className="relative group flex items-center justify-center rounded-md overflow-hidden shadow-md transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground hover:bg-neutral-50 aspect-square w-full h-full min-w-[100px] min-h-[100px]"
          >
            <IoMdCloudUpload
              size={28}
              className="text-gray-500 dark:text-gray-400"
            />
          </div>

          {/* Botón de cámara como una imagen más */}
          {isMobile && (
            <div
              onClick={handleOpenCamera}
              className="relative group flex items-center justify-center rounded-md overflow-hidden shadow-md transition-all duration-200 cursor-pointer border-2 border-dashed border-sinabe-primary hover:bg-sinabe-primary/10 aspect-square w-full h-full min-w-[100px] min-h-[100px]"
            >
              <span className="text-sinabe-primary font-semibold text-sm text-center flex flex-col items-center justify-center gap-2">
                <FaCamera size={24} />
                Usar cámara
              </span>
            </div>
          )}

          {/* Input real */}
          <input
            id={props.id || props.name}
            multiple={props.multiple}
            accept={allowedTypes.join(',')}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <ImageViewer
            images={field.value}
            onRemove={handleRemoveImage}
            imageStyles="object-cover w-full h-full aspect-square"
            containerClassNames="contents"
          />
        </div>
      ) : (
        <div className="mt-1 flex flex-col md:flex-row items-center justify-center gap-2 text-center">
          {/* Dropzone ocupa la mitad */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() =>
              document.getElementById(props.id || props.name).click()
            }
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground cursor-pointer hover:bg-neutral-50 p-6 rounded-md min-h-[30dvh]"
          >
            <IoMdCloudUpload
              size={32}
              className="text-gray-500 dark:text-gray-400 mb-2"
            />
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              <span className="font-semibold">Haz clic aquí</span> o arrastra y
              suelta tus imágenes
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              SVG, PNG, JPG o GIF
            </p>
            <input
              id={props.id || props.name}
              multiple={props.multiple}
              accept={allowedTypes.join(',')}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Botón de cámara ocupa la mitad */}
          {isMobile && (
            <button
              onClick={handleOpenCamera}
              type="button"
              className="flex-1 min-h-[30dvh] w-full border-2 border-dashed border-sinabe-primary hover:bg-sinabe-primary/10 text-sinabe-primary rounded-md flex flex-col items-center justify-center px-4 py-2 text-sm font-semibold"
            >
              <span>
                <FaCamera size={24} />
              </span>
              Usar cámara
            </button>
          )}
        </div>
      )}

      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default ImagePicker;
