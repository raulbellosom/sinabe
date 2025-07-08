// frontend/src/components/Modals/ReusableModal.jsx
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from '@headlessui/react';
import { IoMdClose } from 'react-icons/io';
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
  full: 'max-w-full',
};

export default function ReusableModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  actions,
  size = 'md',
  className = '',
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open
          onClose={onClose}
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
              'relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] overflow-hidden',
              sizeClasses[size],
              className,
              // margen responsivo: 0.5rem en móvil, 1rem en pantallas ≥ sm
              'mx-2 my-4 sm:mx-4 sm:my-6',
            )}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Header */}
            <DialogTitle
              as="div"
              className="flex-shrink-0 font-bold text-sinabe-primary text-sm md:text-xl dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center"
            >
              <span>{title}</span>
              <button
                onClick={onClose}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                <IoMdClose className="text-2xl" />
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
            {(footer || actions) && (
              <div className="flex-shrink-0 dark:bg-gray-800 border-t px-6 py-4">
                <div className="flex justify-end gap-4">
                  {footer || <ActionButtons extraActions={actions} />}
                </div>
              </div>
            )}
          </DialogPanel>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
