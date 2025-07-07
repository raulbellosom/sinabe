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

//  <TransitionChild
//             as={Fragment}
//             enter="ease-out duration-200"
//             enterFrom="opacity-0 scale-95"
//             enterTo="opacity-100 scale-100"
//             leave="ease-in duration-150"
//             leaveFrom="opacity-100 scale-100"
//             leaveTo="opacity-0 scale-95"
//           ></TransitionChild>

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
          style={{ margin: 0 }}
          className="fixed inset-0 bg-black/50 z-50 p-3 flex justify-center items-center"
        >
          <motion.div
            key="reusable-modal"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className={classNames(
              'bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh]',
              sizeClasses[size],
              className,
            )}
          >
            {/* Header */}
            <div className="sticky font-bold text-sinabe-primary text-sm md:text-xl top-0 z-10  dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
              {title}
              <button
                onClick={onClose}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-2 md:px-4 py-4 flex-1 min-h-0">
              {children}
            </div>

            {/* Footer */}
            {(footer || actions) && (
              <div className="sticky bottom-0 z-10  dark:bg-gray-800 border-t px-6 py-4">
                <div className="flex justify-end gap-4">
                  {footer ? footer : <ActionButtons extraActions={actions} />}
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
