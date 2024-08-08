import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SelectInput from '../../Inputs/SelectInput';
import DateInput from '../../Inputs/DateInput';
import TextArea from '../../Inputs/TextArea';
import FileInput from '../../Inputs/FileInput';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
  MdOutlineNumbers,
} from 'react-icons/md';
import { BiDollar } from 'react-icons/bi';
import { IoLogoModelS, IoMdSpeedometer } from 'react-icons/io';
import MultiSelectInput from '../../Inputs/MultiSelectInput';
import ImagePicker from '../../Inputs/ImagePicker';
import { FaTachometerAlt } from 'react-icons/fa';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { TbNumber123 } from 'react-icons/tb';

const VehicleFormFields = ({
  vehicleModels,
  vehicleConditions,
  onOtherSelected,
}) => (
  <div className="grid grid-cols-12 gap-4 lg:gap-0">
    <div className="col-span-12 lg:col-span-8 lg:w-[97%]">
      <div className="grid grid-cols-12 gap-2">
        <Field
          name="modelId"
          id="modelId"
          component={SelectInput}
          icon={IoLogoModelS}
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
          name="economicNumber"
          id="economicNumber"
          component={TextInput}
          icon={MdOutlineNumbers}
          label="Número Económico"
          className="col-span-6 md:col-span-4"
        />
        <Field
          name="serialNumber"
          id="serialNumber"
          component={TextInput}
          icon={TbNumber123}
          label="Número de Serie"
          className="col-span-6 md:col-span-4"
        />
        <Field
          name="plateNumber"
          id="plateNumber"
          component={TextInput}
          icon={AiOutlineFieldNumber}
          label="Número de Placa"
          className="col-span-6 md:col-span-4"
        />
        <Field
          name="mileage"
          id="mileage"
          component={TextInput}
          label="Kilometraje"
          icon={FaTachometerAlt}
          type="number"
          min={0}
          className="col-span-6 md:col-span-4"
        />
        <Field
          name="acquisitionDate"
          id="acquisitionDate"
          component={DateInput}
          label="Fecha de Adquisición"
          title="Fecha de Adquisición"
          icon={MdCalendarToday}
          max={new Date().toISOString().split('T')[0]}
          className="col-span-6 md:col-span-4"
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
        <Field
          name="files"
          id="files"
          component={FileInput}
          label="Archivos"
          className="col-span-12"
          multiple
          helperText="PDF, Word, Excel, Imagenes, Rar, Zip"
        />
      </div>
    </div>
    <div className="col-span-12 lg:col-span-4 h-full">
      <div className="w-full h-full">
        <Field
          name="images"
          id="images"
          component={ImagePicker}
          label="Imagenes"
          multiple
        />
      </div>
    </div>
  </div>
);

export default VehicleFormFields;
