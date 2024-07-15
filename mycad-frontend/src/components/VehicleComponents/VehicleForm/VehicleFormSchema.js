import * as Yup from 'yup';

export const VehicleFormSchema = Yup.object().shape({
  typeId: Yup.number().required('El tipo de vehículo es requerido'),
  brandId: Yup.number().required('La marca es requerida'),
  modelId: Yup.number().required('El modelo es requerido'),
  year: Yup.number()
    .min(1980)
    .max(
      new Date().getFullYear() + 1,
      `El año del modelo no puede ser mayor a ${new Date().getFullYear() + 1}`,
    )
    .integer()
    .typeError('El año del modelo debe ser un número')
    .required('El año del modelo es requerido'),
  acquisitionDate: Yup.date()
    .min('1980-01-01', 'La fecha de adquisición no puede ser menor a 1980')
    .max(
      new Date(),
      'La fecha de adquisición no puede ser mayor a la fecha actual',
    )
    .typeError('La fecha de adquisición debe ser una fecha')
    .required('La fecha de adquisición es requerida'),
  cost: Yup.number()
    .required('El costo es requerido')
    .positive('El costo debe ser positivo'),
  mileage: Yup.number()
    .min(0)
    .integer()
    .typeError('El kilometraje debe ser un número')
    .required('El kilometraje es requerido'),
  status: Yup.string().required('El estado es requerido'),
});
