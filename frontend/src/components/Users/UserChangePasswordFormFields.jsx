import { memo } from 'react';
import { Field } from 'formik';
import TextInput from '../Inputs/TextInput';
import { Lock } from 'lucide-react';

const UserFormFields = () => {
  return (
    <div className="grid gap-4 grid-cols-1">
      <Field
        name="password"
        id="password"
        component={TextInput}
        label="Contraseña"
        type="password"
        icon={Lock}
      />
      <Field
        name="repeatPassword"
        id="repeatPassword"
        component={TextInput}
        label="Repetir Contraseña"
        type="password"
        icon={Lock}
      />
      <Field name="id" id="id" component={TextInput} type="hidden" />
    </div>
  );
};

export default memo(UserFormFields);
