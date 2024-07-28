import React from 'react';
import { Label, TextInput } from 'flowbite-react';
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
    const files = Array.from(event.target.files);
    setFieldValue('images', files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    setFieldValue(files);
  };
  return (
    <div className={classNames('w-full', className)}>
      <Label
        htmlFor={props.id || props.name}
        className={'block text-sm font-medium'}
        color={touched[field.name] && errors[field.name] ? 'failure' : ''}
      >
        {props.label}
      </Label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mt-1 flex flex-col w-full items-center justify-center"
      >
        <Label
          htmlFor="images"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <svg
              className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
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
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
        </Label>
        <TextInput
          type="file"
          multiple={true}
          {...field}
          {...props}
          color={touched[field.name] && errors[field.name] ? 'failure' : ''}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-full h-full">
          {field.value && field.value.length > 0 && (
            <>
              <p>Imagenes selecionadas</p>
              <ImageViewer images={field.value} />
            </>
          )}
        </div>
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
