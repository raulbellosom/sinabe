import { Button, Modal } from 'flowbite-react';
import { useState, useEffect, useRef } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ModalRemove = ({ removeFunction, isOpenModal, onCloseModal }) => {

  return (
    <Modal
      show={isOpenModal}
      size="lg"
      onClose={onCloseModal}
      dismissible
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar este registro?
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-300 mb-5">
            Recuerda que esta acción es{' '}
            <strong className="text-red-600">definitiva</strong> y{' '}
            <strong className="text-red-600">NO</strong> se puede deshacer.
          </p>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={removeFunction}>
              Sí, eliminar
            </Button>
            <Button color="gray" onClick={onCloseModal}>
              No, cancelar
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalRemove;
