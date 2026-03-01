import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import cn from './cn';

const Modal = ({
  show = false,
  onClose = () => {},
  title,
  footer,
  children,
  className,
  bodyClassName,
}) => {
  return (
    <Dialog open={show} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            'max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl',
            className,
          )}
        >
          {title ? (
            <div className="sticky top-0 z-10 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4">
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            </div>
          ) : null}

          <div className={cn('max-h-[70vh] overflow-y-auto px-5 py-4', bodyClassName)}>
            {children}
          </div>

          {footer ? (
            <div className="sticky bottom-0 z-10 border-t border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4">
              {footer}
            </div>
          ) : null}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Modal;
