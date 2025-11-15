import * as Yup from 'yup';

export const InventoryFormSchema = Yup.object().shape({
  modelId: Yup.mixed()
    .test('is-required', 'El modelo es requerido', function (value) {
      return (
        value &&
        (typeof value === 'number' ||
          (typeof value === 'string' && value.trim() !== ''))
      );
    })
    .transform((value) => {
      if (typeof value === 'string' && value.trim() !== '') {
        const num = parseInt(value, 10);
        return isNaN(num) ? value : num;
      }
      return value;
    }),
  serialNumber: Yup.string(),
  activeNumber: Yup.string(),
  purchaseOrderId: Yup.string().nullable(),
  invoiceId: Yup.string().nullable(),
  locationId: Yup.string().nullable(),
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
