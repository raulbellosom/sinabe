
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SimpleSearchSelectInput from '../../Inputs/SimpleSearchSelectInput';

import {
  Box,
  Layers,
  Tag,
} from 'lucide-react';

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
        icon={Box}
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
        icon={Tag}
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
        icon={Layers}
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
