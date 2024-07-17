import React from 'react';
import { Modal } from 'flowbite-react';

const ModalForm = ({ children, isOpenModal, title, onClose }) => {
  return (
    <Modal show={isOpenModal} onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ModalForm;
