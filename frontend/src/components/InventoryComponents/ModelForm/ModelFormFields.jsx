import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { HiCubeTransparent } from 'react-icons/hi';
import SimpleSearchSelectInput from '../../Inputs/SimpleSearchSelectInput';

const ModelFormFields = ({
  inventoryBrands,
  inventoryTypes,
  createBrand,
  createType,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 pb-28">
      <Field
        name="name"
        id="name"
        component={TextInput}
        label="Nombre"
        type="text"
        icon={HiCubeTransparent}
      />
      <Field
        name="brandId"
        id="brandId"
        component={SimpleSearchSelectInput}
        label="Marca del inventario"
        options={inventoryBrands.map((brand) => ({
          label: brand.name,
          value: brand.id,
        }))}
        icon={PiTrademarkRegisteredBold}
        isClearable
        createOption={createBrand}
      />
      <Field
        name="typeId"
        id="typeId"
        component={SimpleSearchSelectInput}
        label="Tipo de inventario"
        options={inventoryTypes.map((type) => ({
          label: type.name,
          value: type.id,
        }))}
        icon={BiCategory}
        isClearable
        createOption={createType}
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
