import { memo } from 'react';
import { FormikProvider, useFormik, Form } from 'formik';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Save, X } from 'lucide-react';

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevenir comportamiento por defecto
    event.target.form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
  }
};

const ModalForm = ({
  saveLabel,
  isOpenModal,
  title,
  onClose,
  size,
  initialValues,
  onSubmit,
  formFields,
  schema,
}) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: schema,
    onSubmit: (values, actions) => {
      onSubmit(values, actions);
    },
  });

  return (
    <Modal
      show={isOpenModal}
      onClose={onClose}
      title={title}
      className={
        size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-2xl'
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button variant="primary" onClick={formik.submitForm}>
            <Save className="h-4 w-4 mr-1" />
            {saveLabel || 'Guardar'}
          </Button>
        </div>
      }
    >
      <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit} onKeyDown={handleKeyDown}>
          {formFields}
        </Form>
      </FormikProvider>
    </Modal>
  );
};

export default memo(ModalForm);
