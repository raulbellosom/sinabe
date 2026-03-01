import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import classNames from 'classnames';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  '3xl': 'max-w-7xl',
  full: 'max-w-full',
};

const ModalViewer = ({
  isOpenModal,
  onCloseModal,
  children,
  size = '3xl',
  title = '',
  contentPosition = 'center',
  dismissible = true,
}) => {
  return (
    <Dialog
      open={isOpenModal}
      onClose={dismissible ? onCloseModal : () => {}}
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <DialogPanel
        className={classNames(
          'relative bg-[color:var(--surface)] rounded-xl shadow-2xl w-full flex flex-col max-h-[90dvh] overflow-hidden border border-[color:var(--border)] mx-2 my-4 sm:mx-4 sm:my-6',
          sizeClasses[size] || sizeClasses['3xl'],
        )}
      >
        <DialogTitle
          as="div"
          className="flex-shrink-0 font-bold text-[color:var(--primary)] text-sm md:text-xl bg-[color:var(--surface)] border-b border-[color:var(--border)] px-6 py-4 flex justify-between items-center"
        >
          <span className="truncate">{title}</span>
          <button
            onClick={onCloseModal}
            className="text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] p-1.5 rounded-lg hover:text-[color:var(--foreground)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogTitle>
        <div
          className={classNames(
            'flex-1 min-h-0 overflow-y-auto px-2 md:px-4 py-4 flex items-start',
            `justify-${contentPosition}`,
          )}
        >
          {children}
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default ModalViewer;
