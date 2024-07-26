import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useField, useFormikContext } from 'formik';
import ImageViewer from '../ImageViewer/ImageViewer';
import classNames from 'classnames';

const DropzoneInput = ({ name }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  console.log(field);
  const onDrop = useCallback(
    (acceptedFiles) => {
      const currentFiles = field.value || [];
      setFieldValue(name, [...currentFiles, ...acceptedFiles]);
    },
    [setFieldValue, field.value, name],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div className="h-full bg-stone-100 p-2 rounded-md">
      <div
        className={classNames(
          field.value && field.value.length > 0 ? 'h-10' : 'h-full',
          'border-2 border-dashed border-gray-300 text-stone-400 rounded-md flex items-center justify-center p-2',
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta los archivos aquí...</p>
        ) : (
          <p className="text-center">
            Arrastra y suelta algunos archivos aquí, o haz clic para seleccionar
            archivos
          </p>
        )}
      </div>
      {field.value && field.value.length > 0 && (
        <div className="h-full">
          <div>
            <h4>Archivos seleccionados:</h4>
            <ImageViewer images={field.value} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DropzoneInput;
