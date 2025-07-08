// File: frontend/src/components/Modals/ReusableModal.jsx
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

const ReusableModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  actions,
  size = 'md',
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center modal-root"
          style={{ margin: 0 }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className={classNames(
              'relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] overflow-hidden',
              sizeClasses[size],
              className,
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 relative font-bold text-sinabe-primary text-sm md:text-xl dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
              {title}
              <button onClick={onClose} className="…">
                <IoMdClose className="text-2xl" />
              </button>
            </div>

            {/* Contenido con momentum scroll en iOS */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-2 md:px-4 py-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
            </div>

            {/* Footer */}
            {(footer || actions) && (
              <div className="flex-shrink-0 relative dark:bg-gray-800 border-t px-6 py-4">
                <div className="flex justify-end gap-4">
                  {footer || <ActionButtons extraActions={actions} />}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReusableModal;
