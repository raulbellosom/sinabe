import { useState } from 'react';
import { ErrorMessage } from 'formik';
import { Label } from '../ui/flowbite';
import classNames from 'classnames';
import FileIcon from '../FileIcon/FileIcon';
import { Upload } from 'lucide-react';

const FileInput = ({ className, field, form = {}, ...props }) => {
  // Provide defaults for form properties
  const { setFieldValue = () => {}, touched = {}, errors = {} } = form;
  const hasError = touched[field?.name] && errors[field?.name];
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (newFiles) => {
    const currentFiles = field.value || [];
    setFieldValue(field?.name, [...currentFiles, ...newFiles]);
  };

  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length) addFiles(newFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files || []);
    if (newFiles.length) addFiles(newFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = field.value.filter((_, i) => i !== index);
    setFieldValue(field?.name, updatedFiles);
  };

  return (
    <div className={classNames('w-full', className)}>
      {props.label && (
        <Label
          htmlFor={props.id || props.name}
          className={classNames('block text-sm font-medium mb-1.5', {
            'text-[color:var(--danger)]': hasError,
          })}
          value={props.label}
        />
      )}

      {/* Custom file input with drag-and-drop */}
      <label
        htmlFor={props.id || props.name}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={classNames(
          'flex flex-col items-center justify-center w-full p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-[color:var(--primary)] bg-[color:var(--primary)]/5'
            : hasError
              ? 'border-[color:var(--danger)] bg-[color:var(--surface)]'
              : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--primary)]',
        )}
      >
        <div className="flex flex-col items-center justify-center py-2">
          <Upload className="w-8 h-8 mb-2 text-[color:var(--foreground-muted)]" />
          <p className="text-sm text-[color:var(--foreground)]">
            {isDragging ? (
              <span className="font-medium text-[color:var(--primary)]">
                Suelta los archivos aquí
              </span>
            ) : (
              <>
                <span className="font-medium text-[color:var(--primary)]">
                  Haz clic para subir
                </span>{' '}
                o arrastra archivos
              </>
            )}
          </p>
          {props.helperText && (
            <p className="text-xs text-[color:var(--foreground-muted)] mt-1">
              {props.helperText}
            </p>
          )}
        </div>
        <input
          id={props.id || props.name}
          type="file"
          className="hidden"
          multiple={props.multiple}
          accept={props.accept || ''}
          onChange={handleChange}
        />
      </label>

      {/* File list - always shown below the dropzone */}
      {field.value && field.value.length > 0 && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {field.value.map((file, index) => (
            <FileIcon
              key={index}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-[color:var(--danger)] text-xs mt-1"
      />
    </div>
  );
};

export default FileInput;
