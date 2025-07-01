import React from 'react';
import { FileInput, Label } from 'flowbite-react';
import { ErrorMessage } from 'formik';
import ImageViewer from '../ImageViewer/ImageViewer2';
import classNames from 'classnames';
import imageCompression from 'browser-image-compression';
import Notifies from '../Notifies/Notifies';
import { IoMdCloudUpload } from 'react-icons/io';

const ImagePicker = ({
  className,
  field,
  form: { setFieldValue, touched, errors },
  ...props
}) => {
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
      const ext = file.name
        ? file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
        : '';

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
        Notifies(
          'error',
          `Tipo de archivo no permitido: ${file.name}. Solo se aceptan imágenes.`,
        );
      }
    }

    const combinedFiles = [...currentFiles, ...processedFiles];
    setFieldValue(field.name, combinedFiles);
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
    const newFiles = Array.from(e.dataTransfer.files);
    handleFileChange({ target: { files: newFiles } });
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

      {/* Vista con imágenes (grid + dropzone dentro) */}
      {hasImages ? (
        <div
          className={classNames(
            'mt-1 gap-2 grid grid-cols-[repeat(auto-fill,_minmax(100px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(100px,_1fr))]',
          )}
        >
          {/* Dropzone como una imagen más */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() =>
              document.getElementById(props.id || props.name).click()
            }
            className={classNames(
              'relative group flex items-center justify-center rounded-md overflow-hidden shadow-md transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground hover:bg-neutral-50',
              'aspect-square w-full h-full min-w-[100px] min-h-[100px]',
            )}
          >
            <IoMdCloudUpload
              size={28}
              className="text-gray-500 dark:text-gray-400"
            />
          </div>

          <FileInput
            id={props.id || props.name}
            multiple={props.multiple}
            accept={allowedTypes.join(',')}
            className="hidden"
            hidden
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
        // Vista vacía (dropzone ocupa todo el espacio con info)
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() =>
            document.getElementById(props.id || props.name).click()
          }
          className={classNames(
            'mt-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground min-h-[30dvh] w-full cursor-pointer hover:bg-neutral-50 p-6 rounded-md',
          )}
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
          <FileInput
            id={props.id || props.name}
            multiple={props.multiple}
            accept={allowedTypes.join(',')}
            className="hidden"
            hidden
            onChange={handleFileChange}
          />
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
