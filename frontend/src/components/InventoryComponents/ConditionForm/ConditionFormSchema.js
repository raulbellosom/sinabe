import * as Yup from 'yup';

export const ConditionFormSchema = Yup.object().shape({
  name: Yup.string().required('El nombre de la condición es requerido'),
  id: Yup.number(),
});
