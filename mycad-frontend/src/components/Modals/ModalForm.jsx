// ModalForm.jsx
import { Button, Modal, TextInput, Select, Label } from 'flowbite-react';
import { useState, useEffect } from 'react';

const ModalForm = ({ title, inputs, isOpenModal, onClose, onSubmit }) => {
  const [openModal, setOpenModal] = useState(isOpenModal);

  useEffect(() => {
    setOpenModal(isOpenModal);
  }, [isOpenModal]);

  const renderInput = (input, key) => {
    switch (input.inputType) {
      case 'select':
        return (
          <div key={key} className="col-span-6">
            <Label htmlFor={key} value={input.label} />
            <Select icon={input?.icon && input?.icon} id={key} required>
              {input.values.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </div>
        );
      default:
        return (
          <div key={key} className="col-span-6">
            <Label htmlFor={key} value={input.label} />
            <TextInput
              icon={input?.icon && input?.icon}
              id={key}
              type={input.inputType}
              required
            />
          </div>
        );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    console.log(form);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    onSubmit(data);
  };

  return (
    <Modal show={openModal} onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-4">
            {inputs.map((input, index) => renderInput(input, index))}
          </div>
          <div className="flex items-center justify-end gap-4 mt-4">
            <Button type="submit">Guardar</Button>
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalForm;
