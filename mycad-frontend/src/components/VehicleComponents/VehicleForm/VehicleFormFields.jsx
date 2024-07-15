import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SelectInput from '../../Inputs/SelectInput';
import DateInput from '../../Inputs/DateInput';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
} from 'react-icons/md';
import { BiCategory, BiDollar } from 'react-icons/bi';
import { IoMdSpeedometer } from 'react-icons/io';
import { MdGarage } from 'react-icons/md';

const VehicleFormFields = ({
  vehicleTypes,
  vehicleModels,
  vehicleBrands,
  onOtherModelSelected,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
    <Field
      name="modelId"
      id="modelId"
      component={SelectInput}
      icon={MdOutlineDirectionsCar}
      label="Modelo"
      options={[
        ...vehicleModels.map((model) => ({
          label: model.name,
          value: model.id,
        })),
        { label: 'Otro', value: 0 },
      ]}
      onChange={(e) => {
        const value = e.target.value;
        if (value === '0') {
          onOtherModelSelected();
        }
      }}
    />
    <Field
      name="typeId"
      id="typeId"
      component={SelectInput}
      label="Tipo de Vehículo"
      icon={BiCategory}
      options={vehicleTypes.map((type) => ({
        label: type.name,
        value: type.id,
      }))}
    />
    <Field
      name="brandId"
      id="brandId"
      component={SelectInput}
      icon={PiTrademarkRegisteredBold}
      label="Marca"
      options={vehicleBrands.map((brand) => ({
        label: brand.name,
        value: brand.id,
      }))}
    />
    <Field
      name="year"
      id="year"
      component={TextInput}
      icon={MdGarage}
      label="Año del modelo"
      type="number"
    />
    <Field
      name="acquisitionDate"
      id="acquisitionDate"
      component={DateInput}
      label="Fecha de Adquisición"
      title="Fecha de Adquisición"
      icon={MdCalendarToday}
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
      min={0}
    />
    <Field
      name="status"
      id="status"
      component={TextInput}
      icon={MdInfo}
      label="Estado"
    />
  </div>
);

export default VehicleFormFields;
