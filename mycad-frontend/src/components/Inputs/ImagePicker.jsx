import React from 'react';
import { FileInput, Label } from 'flowbite-react';
import { ErrorMessage } from 'formik';
import ImageViewer from '../ImageViewer/ImageViewer';
import classNames from 'classnames';

const ImagePicker = ({
  className,
  field,
  form: { setFieldValue, touched, errors },
  ...props
}) => {
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const currentFiles = field.value || [];
    const combinedFiles = [...currentFiles, ...newFiles];
    setFieldValue(field.name, combinedFiles);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = field.value.filter((_, i) => i !== index);
    setFieldValue(field.name, updatedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newFiles = Array.from(e.dataTransfer.files);
    const currentFiles = field.value || [];
    const files = [...currentFiles, ...newFiles];
    setFieldValue(field.name, files);
  };

  return (
    <div
      className={classNames(
        'w-full h-52 md:h-full lg:max-h-[70vh] xl:max-h-[60vh] 2xl:max-h-[70vh] overflow-hidden',
        className,
      )}
    >
      <Label
        htmlFor={props.id || props.name}
        className={'block text-sm font-medium'}
        color={touched[field.name] && errors[field.name] ? 'failure' : ''}
        value={props.label}
      />
      <div
        className={classNames(
          'mt-1 max-h-48 md:max-h-full grid gap-1 overflow-y-auto',
          field?.value.length > 0
            ? 'grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(7rem,_1fr))]'
            : 'h-full',
        )}
        style={{ maxHeight: '100%' }}
      >
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() =>
            document.getElementById(props.id || props.name).click()
          }
          className={classNames(
            'min-h-16 p-1 border-dashed border-2 border-muted-foreground text-center flex flex-col items-center justify-center',
            field?.value.length > 0
              ? 'w-24 h-24 xl:h-28 xl:w-28 2xl:h-32 2xl:w-32'
              : 'h-full w-full',
          )}
        >
          <svg
            className="h-8 w-8 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p
            className={classNames(
              'text-sm text-muted-foreground dark:text-gray-400 text-center',
              field.value?.length > 0 && 'hidden',
            )}
          >
            <span className="font-semibold">Haz clic aquí</span> o arrastra y
            suelta tus imágenes
          </p>
          <p
            className={classNames(
              'text-xs text-muted-foreground text-center',
              field.value?.length > 2 && 'hidden',
            )}
          >
            SVG, PNG, JPG o GIF (MAX. 800x400px)
          </p>
        </div>
        <FileInput
          id={props.id || props.name}
          multiple={props.multiple}
          className="hidden"
          hidden
          onChange={handleFileChange}
        />
        {field.value && field.value.length > 0 && (
          <ImageViewer images={field.value} onRemove={handleRemoveImage} />
        )}
      </div>
      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default ImagePicker;
