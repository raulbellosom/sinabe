import React from 'react';
import { Label } from 'flowbite-react';
import { ErrorMessage } from 'formik';
import classNames from 'classnames';
import PinIcon from '../PinIcon/PinIcon';

const PinnableInputWrapper = ({
  children,
  className,
  field,
  form,
  label,
  id,
  name,
  // Props del sistema de pin
  isPinMode = false,
  isPinned = false,
  onTogglePin,
  ...props
}) => {
  const fieldName = field?.name || name;
  const hasError = form && form.touched[fieldName] && form.errors[fieldName];

  // Clone children and pass only relevant props (field and form)
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Filter out props that shouldn't be passed to DOM elements
      const {
        isPinMode: _,
        isPinned: __,
        onTogglePin: ___,
        ...safeProps
      } = props;
      return React.cloneElement(child, {
        field,
        form,
        ...safeProps,
      });
    }
    return child;
  });
  // TODO: los campos de ubicaicon se borran y no se conserva aun al ser fijado
  return (
    <div className={classNames('relative w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <Label
            htmlFor={id || fieldName}
            className="block text-sm font-medium"
            color={hasError ? 'failure' : ''}
            value={label}
          />
          <PinIcon
            isPinned={isPinned}
            onToggle={onTogglePin}
            isPinMode={isPinMode}
          />
        </div>
      )}

      {childrenWithProps}

      <ErrorMessage
        name={fieldName}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};

export default PinnableInputWrapper;
