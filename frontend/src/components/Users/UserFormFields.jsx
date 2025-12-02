import React from 'react';
import { Field } from 'formik';
import TextInput from '../Inputs/TextInput';
import SelectInput from '../Inputs/SelectInput';
import { BiUser } from 'react-icons/bi';
import { FaEnvelope, FaUserTag } from 'react-icons/fa';
import { FaPhoneAlt } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import { MdManageAccounts } from 'react-icons/md';
import FileInput from '../Inputs/FileInput';
import { PiUserCircleCheckBold } from 'react-icons/pi';

const UserFormFields = ({ roles, editMode }) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))]">
      <Field
        name="firstName"
        id="firstName"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={BiUser}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="lastName"
        id="lastName"
        component={TextInput}
        label="Apellido"
        type="text"
        icon={BiUser}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="email"
        id="email"
        component={TextInput}
        label="Correo Electrónico"
        type="email"
        icon={FaEnvelope}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="userName"
        id="userName"
        component={TextInput}
        label="Nombre de Usuario"
        type="text"
        icon={FaUserTag}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="phone"
        id="phone"
        component={TextInput}
        label="Teléfono"
        type="text"
        icon={FaPhoneAlt}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="employeeNumber"
        id="employeeNumber"
        component={TextInput}
        label="Número de Empleado"
        type="text"
        icon={BiUser}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="jobTitle"
        id="jobTitle"
        component={TextInput}
        label="Puesto"
        type="text"
        icon={BiUser}
        className="col-span-2 md:col-span-1"
      />
      <Field
        name="department"
        id="department"
        component={TextInput}
        label="Departamento"
        type="text"
        icon={BiUser}
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
        icon={MdManageAccounts}
        className="col-span-2 md:col-span-1"
      />
      {!editMode && (
        <Field
          name="password"
          id="password"
          component={TextInput}
          label="Contraseña"
          type="password"
          icon={FaLock}
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
          icon={FaLock}
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
          icon={PiUserCircleCheckBold}
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

export default React.memo(UserFormFields);
