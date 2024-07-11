import * as Yup from 'yup';

export const VehicleFormSchema = Yup.object().shape({
  typeId: Yup.number().required('El tipo de vehículo es requerido'),
  brand: Yup.string().required('La marca es requerida'),
  model: Yup.string().required('El modelo es requerido'),
  acquisitionDate: Yup.date().required('La fecha de adquisición es requerida'),
  cost: Yup.number()
    .required('El costo es requerido')
    .positive('El costo debe ser positivo'),
  mileage: Yup.number()
    .required('El kilometraje es requerido')
    .positive('El kilometraje debe ser positivo'),
  status: Yup.string().required('El estado es requerido'),
});
