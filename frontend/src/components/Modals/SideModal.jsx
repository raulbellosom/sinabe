import { AnimatePresence, motion } from 'framer-motion';
import { FaXmark } from 'react-icons/fa6';
import classNames from 'classnames';
import { useEffect } from 'react';

const slideVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.3 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
};

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-full',
};

const SideModal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  size = 'md',
  children,
  className = '',
}) => {
  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{ margin: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
        >
          <motion.div
            key="side-modal"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className={classNames(
              'w-full h-full bg-white dark:bg-gray-900 shadow-lg pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] overflow-y-auto rounded-tl-3xl relative',
              sizeClasses[size],
              className,
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-[calc(1rem+env(safe-area-inset-right))] text-gray-500 hover:text-red-500"
            >
              <FaXmark />
            </button>

            {/* Title */}
            {title && (
              <h2 className="text-xl font-bold mb-4 text-sinabe-primary flex items-center gap-2">
                {Icon && <Icon />} {title}
              </h2>
            )}

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SideModal;
