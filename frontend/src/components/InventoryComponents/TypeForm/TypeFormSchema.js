import * as Yup from 'yup';

export const TypeFormSchema = Yup.object().shape({
  name: Yup.string().required('El nombre del tipo es requerido'),
  id: Yup.number(),
});
