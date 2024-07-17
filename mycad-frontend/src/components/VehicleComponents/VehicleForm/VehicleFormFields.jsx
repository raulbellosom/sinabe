import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SelectInput from '../../Inputs/SelectInput';
import DateInput from '../../Inputs/DateInput';
import TextArea from '../../Inputs/TextArea';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
} from 'react-icons/md';
import { BiDollar } from 'react-icons/bi';
import { IoMdSpeedometer } from 'react-icons/io';

const VehicleFormFields = ({ vehicleModels, onOtherSelected }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
    <Field
      name="modelId"
      id="modelId"
      component={SelectInput}
      icon={MdOutlineDirectionsCar}
      label="Modelo"
      options={vehicleModels.map((model) => ({
        label: model.name,
        value: model.id,
      }))}
      isOtherOption={true}
      onOtherSelected={onOtherSelected}
      className="col-span-1 sm:col-span-2"
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
    <Field
      name="comments"
      id="comments"
      component={TextArea}
      label="Observaciones"
      className="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4"
    />
  </div>
);

export default VehicleFormFields;
