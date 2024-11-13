import { BiCategory } from 'react-icons/bi';
import { FaClipboardList } from 'react-icons/fa';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';

const NewModelFields = async ({ inventoryTypes, inventoryBrands }) => {
  const valuesNewModel = [
    {
      name: 'name',
      label: 'Ingrese el nombre del modelo',
      inputType: 'text',
      icon: FaClipboardList,
    },
    {
      name: 'typeId',
      label: 'Seleccione el tipo de inventario',
      values: inventoryTypes,
      inputType: 'select',
      icon: BiCategory,
    },
    {
      name: 'brandId',
      label: 'Seleccione la marca del inventario',
      values: inventoryBrands,
      inputType: 'select',
      icon: PiTrademarkRegisteredBold,
    },
  ];
  return valuesNewModel;
};

export default NewModelFields;
