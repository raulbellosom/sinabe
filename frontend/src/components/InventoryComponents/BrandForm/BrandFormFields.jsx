
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';

import {
  Tag,
} from 'lucide-react';
const BrandFormFields = ({}) => {
  return (
    <div className="grid grid-cols-1">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={Tag}
        className="col-span-1"
      />
      <Field
        className="hidden"
        name="id"
        label="id"
        component={TextInput}
        type="hidden"
        disabled={true}
      />
    </div>
  );
};

export default BrandFormFields;
