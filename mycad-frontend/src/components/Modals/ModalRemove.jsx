import { Button, Modal } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ModalRemove = ({ removeFunction, isOpenModal }) => {
  const [openModal, setOpenModal] = useState(isOpenModal);

  useEffect(() => {
    setOpenModal(isOpenModal);
  }, [isOpenModal]);

  return (
    <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar este registro?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={removeFunction}>
              Sí, eliminar
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              No, cancelar
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalRemove;
