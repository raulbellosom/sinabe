import * as Yup from 'yup';

export const CustomFieldFormSchema = Yup.object().shape({
  name: Yup.string().required('El nombre del campo personalizado es requerido'),
  type: Yup.string().required('El tipo del campo personalizado es requerido'),
  id: Yup.number(),
});
