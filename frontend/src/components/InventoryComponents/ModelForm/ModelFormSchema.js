import * as Yup from 'yup';

export const ModelFormSchema = Yup.object().shape({
  name: Yup.string().required('El nombre del modelo es requerido'),
  typeId: Yup.number().required('El tipo de modelo es requerido'),
  brandId: Yup.number().required('La marca es requerida'),
  id: Yup.number(),
});
