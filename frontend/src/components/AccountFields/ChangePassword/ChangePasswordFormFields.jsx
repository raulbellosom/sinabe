
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';

import {
  KeyRound,
} from 'lucide-react';
const ChangePasswordFormFields = () => {
  return (
    <div className="flex flex-col gap-4">
      <Field
        name="currentPassword"
        id="currentPassword"
        label="Contraseña actual"
        component={TextInput}
        icon={KeyRound}
        type="password"
      />
      <Field
        name="newPassword"
        id="newPassword"
        label="Nueva contraseña"
        component={TextInput}
        icon={KeyRound}
        type="password"
      />
      <Field
        name="confirmNewPassword"
        id="confirmNewPassword"
        label="Confirmar nueva contraseña"
        component={TextInput}
        icon={KeyRound}
        type="password"
      />
    </div>
  );
};

export default ChangePasswordFormFields;
