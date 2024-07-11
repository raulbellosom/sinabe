import React from 'react';
import { Field } from 'formik';
import TextInput from '../Inputs/TextInput';
import SelectInput from '../Inputs/SelectInput';
import DateInput from '../Inputs/DateInput';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { MdOutlineDirectionsCar, MdInfo } from 'react-icons/md';
import { BiCategory, BiDollar } from 'react-icons/bi';
import { IoMdSpeedometer } from 'react-icons/io';

const VehicleFormFields = ({ vehicleTypes }) => (
  // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
  <>
    <Field
      name="typeId"
      id="typeId"
      component={SelectInput}
      label="Tipo de Vehículo"
      icon={BiCategory}
      options={vehicleTypes.map((type) => ({
        label: type.typeName,
        value: type.id,
      }))}
    />
    <Field
      name="brand"
      id="brand"
      component={TextInput}
      icon={PiTrademarkRegisteredBold}
      label="Marca"
    />
    <Field
      name="model"
      id="model"
      component={TextInput}
      icon={MdOutlineDirectionsCar}
      label="Modelo"
    />
    <Field
      name="acquisitionDate"
      id="acquisitionDate"
      component={DateInput}
      label="Fecha de Adquisición"
      title="Fecha de Adquisición"
    />
    <Field
      name="cost"
      id="cost"
      component={TextInput}
      icon={BiDollar}
      label="Costo de Adquisición"
      type="number"
    />
    <Field
      name="mileage"
      id="mileage"
      component={TextInput}
      label="Kilometraje"
      icon={IoMdSpeedometer}
      type="number"
    />
    <Field
      name="status"
      id="status"
      component={TextInput}
      icon={MdInfo}
      label="Estado"
    />
    {/* </div> */}
  </>
);

export default VehicleFormFields;
