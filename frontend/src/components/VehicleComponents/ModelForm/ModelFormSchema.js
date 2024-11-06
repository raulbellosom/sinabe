import * as Yup from 'yup';

export const ModelFormSchema = Yup.object().shape({
  name: Yup.string().required('El nombre del modelo es requerido'),
  year: Yup.number()
    .min(1980)
    .max(
      new Date().getFullYear() + 1,
      `El año del modelo no puede ser mayor a ${new Date().getFullYear() + 1}`,
    )
    .integer()
    .typeError('El año del modelo debe ser un número')
    .required('El año del modelo es requerido'),
  typeId: Yup.number().required('El tipo de vehículo es requerido'),
  brandId: Yup.number().required('La marca es requerida'),
  id: Yup.number(),
});
