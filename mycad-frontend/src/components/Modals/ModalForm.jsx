import React from 'react';
import { Modal } from 'flowbite-react';

const ModalForm = ({
  children,
  isOpenModal,
  title,
  onClose,
  size,
  position,
}) => {
  return (
    <Modal
      position={position ?? 'center'}
      size={size || '2xl'}
      show={isOpenModal}
      onClose={onClose}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ModalForm;
