import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import { LuTextCursorInput } from 'react-icons/lu';
import SelectInput from '../../Inputs/SelectInput';

const CustomFieldFields = ({}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={LuTextCursorInput}
        className="col-span-1"
      />
      <Field
        name="type"
        id="type"
        component={SelectInput}
        label="Tipo"
        options={[
          { label: 'Texto', value: 'text' },
          { label: 'Número', value: 'number' },
          { label: 'Fecha', value: 'date' },
        ]}
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

export default CustomFieldFields;
