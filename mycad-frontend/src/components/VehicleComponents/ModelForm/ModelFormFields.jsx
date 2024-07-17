import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SelectInput from '../../Inputs/SelectInput';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { MdOutlineDirectionsCar } from 'react-icons/md';
import { FaCalendar } from 'react-icons/fa';

const ModelFormFields = ({ vehicleBrands, vehicleTypes }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={MdOutlineDirectionsCar}
      />
      <Field
        name="year"
        id="year"
        component={TextInput}
        label="Año del modelo"
        type="number"
        icon={FaCalendar}
      />
      <Field
        name="brandId"
        id="brandId"
        component={SelectInput}
        label="Marca"
        options={vehicleBrands.map((brand) => ({
          label: brand.name,
          value: brand.id,
        }))}
        icon={PiTrademarkRegisteredBold}
      />
      <Field
        name="typeId"
        id="typeId"
        component={SelectInput}
        label="Tipo de Vehículo"
        options={vehicleTypes.map((type) => ({
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
