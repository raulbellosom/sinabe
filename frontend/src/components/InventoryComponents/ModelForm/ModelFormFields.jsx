import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SelectInput from '../../Inputs/SelectInput';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { MdOutlineDirectionsCar } from 'react-icons/md';
import { FaCalendar } from 'react-icons/fa';

const ModelFormFields = ({ inventoryBrands, inventoryTypes }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={MdOutlineDirectionsCar}
      />
      <Field
        name="brandId"
        id="brandId"
        component={SelectInput}
        label="Marca del inventario"
        options={inventoryBrands.map((brand) => ({
          label: brand.name,
          value: brand.id,
        }))}
        icon={PiTrademarkRegisteredBold}
      />
      <Field
        name="typeId"
        id="typeId"
        component={SelectInput}
        label="Tipo de inventario"
        options={inventoryTypes.map((type) => ({
          label: type.name,
          value: type.id,
        }))}
        icon={BiCategory}
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

export default ModelFormFields;
