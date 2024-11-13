import * as Yup from 'yup';

export const InventoryFormSchema = Yup.object().shape({
  modelId: Yup.number().required('El modelo es requerido'),
  serialNumber: Yup.string(),
  activeNumber: Yup.string(),
  images: Yup.array().of(Yup.mixed()),
  receptionDate: Yup.date()
    .min('1980-01-01', 'La fecha de adquisición no puede ser menor a 1980')
    .max(
      new Date(),
      'La fecha de adquisición no puede ser mayor a la fecha actual',
    )
    .typeError('La fecha de adquisición debe ser una fecha'),
  status: Yup.string().required('El estado del inventario es requerido'),
  comments: Yup.string().nullable(),
  conditions: Yup.array()
    .of(Yup.number())
    .required('Al menos una condición es requerida'),
  customFields: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required('El campo personalizado es requerido'),
      value: Yup.string().required(
        'El valor del campo personalizado es requerido',
      ),
    }),
  ),
});
