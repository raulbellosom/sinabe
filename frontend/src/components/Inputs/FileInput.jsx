import { ErrorMessage } from 'formik';
import { Label } from '../ui/flowbite';
import classNames from 'classnames';
import FileIcon from '../FileIcon/FileIcon';
import { Upload } from 'lucide-react';

const FileInput = ({ className, field, form = {}, ...props }) => {
  // Provide defaults for form properties
  const { setFieldValue = () => {}, touched = {}, errors = {} } = form;
  const hasError = touched[field?.name] && errors[field?.name];

  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const currentFiles = field.value || [];
    const combinedFiles = [...currentFiles, ...newFiles];
    setFieldValue(field?.name, combinedFiles);
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

      {/* Custom file input */}
      <label
        htmlFor={props.id || props.name}
        className={classNames(
          'flex flex-col items-center justify-center w-full p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200',
          'bg-[color:var(--surface)] hover:bg-[color:var(--surface-muted)]',
          hasError
            ? 'border-[color:var(--danger)]'
            : 'border-[color:var(--border)] hover:border-[color:var(--primary)]',
        )}
      >
        <div className="flex flex-col items-center justify-center py-2">
          <Upload className="w-8 h-8 mb-2 text-[color:var(--foreground-muted)]" />
          <p className="text-sm text-[color:var(--foreground)]">
            <span className="font-medium text-[color:var(--primary)]">
              Haz clic para subir
            </span>{' '}
            o arrastra archivos
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

      {/* File list */}
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
