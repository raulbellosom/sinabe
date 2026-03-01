import { memo } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import ActionButtons from '../ActionButtons/ActionButtons';

const panelVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
};

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-full',
};

const ModalForm = ({
  children,
  isOpenModal,
  title,
  onClose,
  size = '2xl',
  _position,
  dismissible = true,
  actions = [],
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpenModal && (
        <Dialog
          open
          onClose={dismissible ? onClose : () => {}}
          className="fixed inset-0 z-50 flex items-center justify-center p-3"
          style={{
            paddingTop: 'env(safe-area-inset-top, 1rem)',
            paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
          }}
        >
          {/* Backdrop que captura todos los clicks */}
          <DialogBackdrop className="fixed inset-0 bg-black/50" />

          {/* Panel animado */}
          <DialogPanel
            as={motion.div}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className={classNames(
              'relative bg-[color:var(--surface)] rounded-xl shadow-2xl w-full flex flex-col max-h-[90dvh] overflow-hidden border border-[color:var(--border)]',
              sizeClasses[size] || sizeClasses['2xl'],
              className,
              // margen responsivo: 0.5rem en móvil, 1rem en pantallas ≥ sm
              'mx-2 my-4 sm:mx-4 sm:my-6',
            )}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Header */}
            <DialogTitle
              as="div"
              className="flex-shrink-0 font-bold text-[color:var(--primary)] text-sm md:text-xl bg-[color:var(--surface)] border-b border-[color:var(--border)] px-6 py-4 flex justify-between items-center"
            >
              <span>{title}</span>
              <button
                onClick={onClose}
                className="text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] p-1.5 rounded-lg hover:text-[color:var(--foreground)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>

            {/* Contenido desplazable */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-2 md:px-4 py-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
            </div>

            {/* Footer */}
            {actions && actions.length > 0 && (
              <div className="flex-shrink-0 bg-[color:var(--surface)] border-t border-[color:var(--border)] px-6 py-4">
                <div className="flex justify-end gap-3">
                  <ActionButtons extraActions={actions} />
                </div>
              </div>
            )}
          </DialogPanel>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default memo(ModalForm);
