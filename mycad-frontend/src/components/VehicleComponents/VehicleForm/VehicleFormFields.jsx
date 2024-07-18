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
import MultiSelectInput from '../../Inputs/MultiSelectInput';

const VehicleFormFields = ({
  vehicleModels,
  vehicleConditions,
  onOtherSelected,
}) => (
  <div className="grid grid-cols-12 gap-3">
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
      className="col-span-12 md:col-span-8"
    />
    <Field
      name="acquisitionDate"
      id="acquisitionDate"
      component={DateInput}
      label="Fecha de Adquisición"
      title="Fecha de Adquisición"
      icon={MdCalendarToday}
      className="col-span-12 md:col-span-4"
    />
    <Field
      name="cost"
      id="cost"
      component={TextInput}
      icon={BiDollar}
      label="Costo de Adquisición"
      type="number"
      className="col-span-6 md:col-span-4"
      min={0}
    />
    <Field
      name="mileage"
      id="mileage"
      component={TextInput}
      label="Kilometraje"
      icon={IoMdSpeedometer}
      type="number"
      min={0}
      className="col-span-6 md:col-span-4"
    />
    <Field
      name="status"
      id="status"
      component={SelectInput}
      icon={MdInfo}
      label="Estado"
      options={[
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false },
      ]}
      className="col-span-12 md:col-span-4"
    />
    <Field
      name="conditions"
      id="conditions"
      component={MultiSelectInput}
      icon={MdInfo}
      label="Condición del Vehículo"
      options={vehicleConditions.map((condition) => ({
        label: condition.name,
        value: condition.id,
      }))}
      className="col-span-12"
    />
    <Field
      name="comments"
      id="comments"
      component={TextArea}
      label="Observaciones"
      className="col-span-12"
    />
  </div>
);

export default VehicleFormFields;
