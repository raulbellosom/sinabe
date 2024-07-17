import { BiCategory } from 'react-icons/bi';
import { FaCar } from 'react-icons/fa';
import { MdGarage } from 'react-icons/md';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';

const NewModelFields = async ({ vehicleTypes, vehicleBrands }) => {
  const valuesNewModel = [
    {
      name: 'name',
      label: 'Ingrese el nombre del modelo',
      inputType: 'text',
      icon: FaCar,
    },
    {
      name: 'year',
      label: 'Ingrese el año del modelo',
      inputType: 'number',
      icon: MdGarage,
    },
    {
      name: 'typeId',
      label: 'Seleccione el tipo de vehículo',
      values: vehicleTypes,
      inputType: 'select',
      icon: BiCategory,
    },
    {
      name: 'brandId',
      label: 'Seleccione la marca de vehículo',
      values: vehicleBrands,
      inputType: 'select',
      icon: PiTrademarkRegisteredBold,
    },
  ];
  return valuesNewModel;
};

export default NewModelFields;
