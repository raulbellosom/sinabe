import { motion, AnimatePresence } from 'framer-motion';
import { Save } from 'lucide-react';

/**
 * Floating Action Button for saving an inventory form on mobile.
 * Only visible on small screens (md:hidden equivalent via inline media check is
 * handled by the parent — caller passes `visible` only when dirty).
 */
const InventoryFAB = ({ visible, onSave }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        key="inventory-fab"
        initial={{ scale: 0, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        whileTap={{ scale: 0.92 }}
        onClick={onSave}
        aria-label="Guardar inventario"
        className="md:hidden fixed right-4 z-50 flex items-center gap-2 rounded-full px-5 py-3.5 text-white font-semibold text-sm shadow-xl active:brightness-90"
        style={{
          bottom: 'calc(5.75rem + env(safe-area-inset-bottom) + 0.75rem)',
          background: 'var(--primary)',
          boxShadow:
            '0 6px 24px color-mix(in srgb, var(--primary) 50%, transparent)',
        }}
      >
        <Save className="h-4 w-4 shrink-0" />
        Guardar
      </motion.button>
    )}
  </AnimatePresence>
);

export default InventoryFAB;
