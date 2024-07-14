import * as Yup from 'yup';

export const VehicleFormSchema = Yup.object().shape({
  typeId: Yup.number().required('El tipo de vehículo es requerido'),
  brandId: Yup.number().required('La marca es requerida'),
  modelId: Yup.number().required('El modelo es requerido'),
  year: Yup.number().required('El año del modelo es requerido'),
  acquisitionDate: Yup.date().required('La fecha de adquisición es requerida'),
  cost: Yup.number()
    .required('El costo es requerido')
    .positive('El costo debe ser positivo'),
  mileage: Yup.number().min(0).required('El kilometraje es requerido'),
  status: Yup.string().required('El estado es requerido'),
});
