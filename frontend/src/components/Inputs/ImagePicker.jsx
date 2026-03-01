import React from 'react';
import { ErrorMessage } from 'formik';
import classNames from 'classnames';
import { Label } from 'flowbite-react';

import ImageCaptureField from '../ui/ImageCaptureField';

const EMPTY_FORM_PROPS = {};

const ImagePicker = ({ className, field, form = EMPTY_FORM_PROPS, ...props }) => {
  const { setFieldValue = () => {}, touched = {}, errors = {} } = form;

  const handleChange = (nextFiles) => {
    setFieldValue(field?.name, nextFiles);
  };

  return (
    <div className={classNames('w-full h-fit overflow-hidden', className)}>
      <Label
        htmlFor={props.id || props.name}
        className="block text-sm font-medium"
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        value={props.label}
      />

      <ImageCaptureField
        value={field.value || []}
        onChange={handleChange}
        className="mt-2"
      />

      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default ImagePicker;
