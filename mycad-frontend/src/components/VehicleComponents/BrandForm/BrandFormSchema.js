import * as Yup from 'yup';

export const BrandFormSchema = Yup.object().shape({
  name: Yup.string().required('El nombre de la marca es requerido'),
  id: Yup.number(),
});
