import { AlertCircle, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const ModalRemove = ({ removeFunction, isOpenModal, onCloseModal }) => {
  return (
    <Modal
      show={isOpenModal}
      onClose={onCloseModal}
      title={
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[color:var(--danger)]" />
          <span className="text-[color:var(--danger)]">Eliminar</span>
        </div>
      }
      footer={
        <div className="flex justify-center gap-3 w-full">
          <Button variant="secondary" onClick={onCloseModal}>
            No, cancelar
          </Button>
          <Button variant="danger" onClick={removeFunction}>
            Sí, eliminar
          </Button>
        </div>
      }
    >
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--danger-soft)]">
          <Trash2 className="h-10 w-10 text-[color:var(--danger)]" />
        </div>
        <h3 className="text-xl font-medium text-[color:var(--foreground)]">
          ¿Estás seguro de que deseas eliminar este registro?
        </h3>
        <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
          Recuerda que esta acción es{' '}
          <strong className="text-[color:var(--danger)]">definitiva</strong> y{' '}
          <strong className="text-[color:var(--danger)]">NO</strong> se puede
          deshacer.
        </p>
      </div>
    </Modal>
  );
};

export default ModalRemove;
