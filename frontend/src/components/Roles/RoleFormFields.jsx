
import { Field } from 'formik';
import TextInput from '../Inputs/TextInput';
import { ShieldCheck } from 'lucide-react';

const RoleFormFields = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre del Rol"
        type="text"
        icon={ShieldCheck}
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

export default RoleFormFields;
