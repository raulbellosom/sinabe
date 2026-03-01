import { LayoutGrid, ClipboardList, BadgeCheck } from 'lucide-react';

const NewModelFields = async ({ inventoryTypes, inventoryBrands }) => {
  const valuesNewModel = [
    {
      name: 'name',
      label: 'Ingrese el nombre del modelo',
      inputType: 'text',
      icon: ClipboardList,
    },
    {
      name: 'typeId',
      label: 'Seleccione el tipo de inventario',
      values: inventoryTypes,
      inputType: 'select',
      icon: LayoutGrid,
    },
    {
      name: 'brandId',
      label: 'Seleccione la marca del inventario',
      values: inventoryBrands,
      inputType: 'select',
      icon: BadgeCheck,
    },
  ];
  return valuesNewModel;
};

export default NewModelFields;
