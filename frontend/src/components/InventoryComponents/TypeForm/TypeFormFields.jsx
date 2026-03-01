
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';

import {
  Layers,
  Network,
} from 'lucide-react';
const TypeFormFields = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={Layers}
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

export default TypeFormFields;
