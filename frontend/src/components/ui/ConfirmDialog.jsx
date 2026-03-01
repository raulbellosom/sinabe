import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  open,
  title = 'Confirmar acción',
  description = '¿Deseas continuar?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'danger',
  onConfirm = () => {},
  onCancel = () => {},
  loading = false,
}) => (
  <Modal
    show={open}
    onClose={onCancel}
    title={title}
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    }
  >
    <p className="text-sm text-[color:var(--foreground-muted)]">{description}</p>
  </Modal>
);

export default ConfirmDialog;
