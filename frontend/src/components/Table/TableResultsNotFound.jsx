import { memo } from 'react';
import { motion } from 'framer-motion';
import { Search, FileX, Sparkles } from 'lucide-react';

/* Tiny floating orb */
const Orb = ({ x, y, delay, size, color }) => (
  <motion.div
    className="absolute rounded-full opacity-30 dark:opacity-20 blur-sm"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: color,
    }}
    animate={{ y: [0, -14, 0], scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
    transition={{
      duration: 3.5 + delay,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
  />
);

const ORBS = [
  { x: 10, y: 20, delay: 0, size: 14, color: '#a78bfa' },
  { x: 80, y: 15, delay: 0.8, size: 10, color: '#818cf8' },
  { x: 65, y: 70, delay: 1.4, size: 18, color: '#c084fc' },
  { x: 25, y: 75, delay: 0.5, size: 12, color: '#6366f1' },
  { x: 50, y: 10, delay: 1.9, size: 8, color: '#e879f9' },
  { x: 88, y: 55, delay: 1.1, size: 16, color: '#a78bfa' },
];

const TableResultsNotFound = ({
  title = 'No se encontraron resultados',
  description = 'Intenta ajustar los filtros o términos de búsqueda',
}) => {
  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-center gap-3 overflow-hidden py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Floating background orbs */}
      {ORBS.map((orb, i) => (
        <Orb key={i} {...orb} />
      ))}

      {/* Main icon group */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute rounded-full border-2 border-violet-400/30 dark:border-violet-500/25"
          style={{ width: 96, height: 96 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        />
        {/* Inner pulsing ring */}
        <motion.div
          className="absolute rounded-full border border-violet-400/20 dark:border-violet-500/20"
          style={{ width: 72, height: 72 }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.4,
          }}
        />

        {/* Icon container */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 dark:from-violet-500/20 dark:to-indigo-500/20 border border-violet-300/30 dark:border-violet-600/30 shadow-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <Search
              className="w-7 h-7 text-violet-500 dark:text-violet-400"
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Small sparkle badges */}
          <motion.div
            className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700 shadow-sm"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900/60 border border-violet-200 dark:border-violet-700 shadow-sm"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.6,
            }}
          >
            <FileX className="w-2 h-2 text-violet-500 dark:text-violet-400" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="flex flex-col items-center gap-1 text-center"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
          {description}
        </p>
      </motion.div>

      {/* Animated dots indicator */}
      <motion.div
        className="flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-400/60 dark:bg-violet-500/50"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default memo(TableResultsNotFound);
