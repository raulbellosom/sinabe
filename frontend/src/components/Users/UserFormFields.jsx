import { memo } from 'react';
import { Field } from 'formik';
import TextInput from '../Inputs/TextInput';
import SelectInput from '../Inputs/SelectInput';
import { User, Mail, UserCheck, Phone, Lock, UserCog } from 'lucide-react';
import FileInput from '../Inputs/FileInput';

const UserFormFields = ({ roles, editMode }) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))]">
      <Field
        name="firstName"
        id="firstName"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={User}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="lastName"
        id="lastName"
        component={TextInput}
        label="Apellido"
        type="text"
        icon={User}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="email"
        id="email"
        component={TextInput}
        label="Correo Electrónico"
        type="email"
        icon={Mail}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="userName"
        id="userName"
        component={TextInput}
        label="Nombre de Usuario"
        type="text"
        icon={UserCheck}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="phone"
        id="phone"
        component={TextInput}
        label="Teléfono"
        type="text"
        icon={Phone}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="employeeNumber"
        id="employeeNumber"
        component={TextInput}
        label="Número de Empleado"
        type="text"
        icon={User}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="jobTitle"
        id="jobTitle"
        component={TextInput}
        label="Puesto"
        type="text"
        icon={User}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="department"
        id="department"
        component={TextInput}
        label="Departamento"
        type="text"
        icon={User}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="role"
        id="role"
        component={SelectInput}
        label="Rol"
        options={roles?.map((role) => ({
          value: role.id,
          label: role.name,
        }))}
        icon={UserCog}
        className="col-span-2 md:col-span-1"
      />
      {!editMode && (
        <Field
          name="password"
          id="password"
          component={TextInput}
          label="Contraseña"
          type="password"
          icon={Lock}
          className="col-span-2 md:col-span-1"
        />
      )}
      {!editMode && (
        <Field
          name="repeatPassword"
          id="repeatPassword"
          component={TextInput}
          label="Repetir Contraseña"
          type="password"
          icon={Lock}
          className="col-span-2 md:col-span-1"
        />
      )}
      {editMode && (
        <Field
          name="status"
          id="status"
          component={SelectInput}
          label="Estado"
          options={[
            { value: true, label: 'Habilitado' },
            { value: false, label: 'Deshabilitado' },
          ]}
          icon={UserCheck}
          className="col-span-2 md:col-span-1"
        />
      )}
      <Field
        name="photo"
        id="photo"
        component={FileInput}
        label="Imagen de perfil"
        type="file"
        accept="image/*"
        className="col-span-2 md:col-span-1"
      />
      <Field name="id" id="id" component={TextInput} type="hidden" />
    </div>
  );
};

export default memo(UserFormFields);
