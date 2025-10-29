import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdInventory } from 'react-icons/md';
import { useInventorySelection } from '../../context/InventorySelectionProvider';
import classNames from 'classnames';

const FloatingInventoryCart = () => {
  const { count, toggleCart, selectedInventories } = useInventorySelection();

  // No mostrar si no hay inventarios seleccionados
  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleCart}
        className={classNames(
          'fixed bottom-6 right-6 z-40',
          'bg-purple-600 hover:bg-purple-700',
          'text-white rounded-full shadow-2xl',
          'flex items-center gap-3 px-5 py-4',
          'transition-all duration-300',
          'border-2 border-purple-400',
        )}
      >
        <div className="relative">
          <MdInventory className="text-2xl" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={classNames(
              'absolute -top-2 -right-2',
              'bg-red-500 text-white text-xs font-bold',
              'rounded-full w-5 h-5',
              'flex items-center justify-center',
              'border-2 border-white',
            )}
          >
            {count}
          </motion.span>
        </div>
        <span className="font-semibold hidden md:block">
          {count} {count === 1 ? 'Inventario' : 'Inventarios'}
        </span>
      </motion.button>
    </AnimatePresence>
  );
};

export default FloatingInventoryCart;
