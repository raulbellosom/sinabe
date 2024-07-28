import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useField, useFormikContext, ErrorMessage } from 'formik';
import classNames from 'classnames';
import FileIcon from '../FileIcon/FileIcon';
import { Label, TextInput } from 'flowbite-react';

const DropzoneInput = ({ name, label, className }) => {
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
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-flv': ['.flv'],
      'video/webm': ['.webm'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        ['.pptx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-tar': ['.tar'],
      'application/x-7z-compressed': ['.7z'],
    },
  });

  const removeFile = (index) => {
    const currentFiles = field.value || [];
    const newFiles = currentFiles.filter((file, i) => i !== index);
    setFieldValue(name, newFiles);
  };

  return (
    <div className={classNames('w-full h-full bg-red-500', className)}>
      <Label htmlFor="files-input" className="block text-sm font-medium">
        {label}
      </Label>
      <>
        <div
          className={classNames(
            'border-2 border-dashed mt-1 border-gray-400 text-stone-500 rounded-md flex items-center justify-center',
            field.value && field.value.length > 0 ? 'h-20' : 'h-full',
          )}
          {...getRootProps()}
        >
          <TextInput
            id="files-input"
            name="files-input"
            type="file"
            {...getInputProps()}
          />
          {isDragActive ? (
            <p>Suelta los archivos aquí...</p>
          ) : (
            <p className="text-center">
              Arrastra y suelta algunos archivos aquí, o haz clic para
              seleccionar archivos
            </p>
          )}
        </div>
        {field.value && field.value.length > 0 && (
          <div>
            <h4>Archivos seleccionados:</h4>
            <ul className="h-fit max-h-48 md:max-h-fit flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
              {field.value.map((file, index) => (
                <li key={index}>
                  <FileIcon file={file} onRemove={() => removeFile(index)} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default DropzoneInput;
