import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

/**
 * SwipeNavigationHandler - Maneja gestos de swipe para navegación móvil
 *
 * Este componente envuelve el contenido de la app y permite:
 * - Swipe desde el borde izquierdo para ir hacia atrás
 * - Indicador visual durante el gesto
 * - Funciona en PWA y apps nativas de Android/iOS
 */
const SwipeNavigationHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipingBack, setIsSwipingBack] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // Detectar si es móvil o PWA/app nativa
  useEffect(() => {
    const checkMobile = () => {
      const isNative = Capacitor.isNativePlatform();
      const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isNative || isPWA || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Rutas donde no se debe permitir swipe back (rutas raíz)
  const noSwipeBackRoutes = ['/', '/dashboard', '/login'];
  const canGoBack = !noSwipeBackRoutes.includes(location.pathname);

  // Manejar navegación hacia atrás
  const handleGoBack = useCallback(() => {
    if (canGoBack) {
      // Verificar si hay historial
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Si no hay historial, ir al dashboard
        navigate('/dashboard');
      }
    }
  }, [navigate, canGoBack]);

  // Configuración del gesto de drag con @use-gesture/react
  const bind = useDrag(
    ({ first, last, movement: [mx], xy: [x], initial: [ix], cancel }) => {
      // Solo activar si el gesto comienza desde el borde izquierdo (primeros 40px)
      if (first) {
        if (ix > 40 || !canGoBack) {
          cancel();
          return;
        }
        setIsSwipingBack(true);
      }

      // Solo considerar movimiento hacia la derecha
      if (mx > 0 && isSwipingBack) {
        // Calcular progreso (0-100) basado en el desplazamiento
        const progress = Math.min(100, Math.max(0, (mx / 150) * 100));
        setSwipeProgress(progress);
      }

      // Al terminar el gesto
      if (last) {
        if (swipeProgress > 50 && isSwipingBack) {
          handleGoBack();
        }
        setIsSwipingBack(false);
        setSwipeProgress(0);
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
      threshold: 10,
    },
  );

  // Si no es móvil, solo renderizar children sin handlers
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      {...bind()}
      className="relative h-full w-full touch-pan-y"
      style={{ touchAction: isSwipingBack ? 'none' : 'pan-y' }}
    >
      {/* Indicador visual de swipe back */}
      <AnimatePresence>
        {isSwipingBack && canGoBack && (
          <>
            {/* Overlay semi-transparente */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: swipeProgress / 200 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black pointer-events-none z-[9999]"
            />

            {/* Indicador de flecha/círculo en el borde */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{
                x: Math.min(swipeProgress * 1.5, 80) - 60,
                opacity: Math.min(swipeProgress / 50, 1),
              }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-[10000] pointer-events-none"
            >
              <div
                className={`
                  flex items-center justify-center
                  w-12 h-12 rounded-full
                  ${swipeProgress > 50 ? 'bg-purple-500' : 'bg-gray-600/80'}
                  shadow-lg backdrop-blur-sm
                  transition-colors duration-150
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Barra de progreso en el borde */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: swipeProgress / 100 }}
              exit={{ scaleY: 0 }}
              style={{ transformOrigin: 'center' }}
              className={`
                fixed left-0 top-0 bottom-0 w-1 z-[10000] pointer-events-none
                ${swipeProgress > 50 ? 'bg-purple-500' : 'bg-gray-400'}
                transition-colors duration-150
              `}
            />
          </>
        )}
      </AnimatePresence>

      {/* Zona táctil del borde izquierdo (invisible) */}
      {canGoBack && (
        <div
          className="fixed left-0 top-0 bottom-0 w-5 z-[100]"
          style={{ touchAction: 'pan-x' }}
        />
      )}

      {/* Contenido principal */}
      {children}
    </div>
  );
};

export default SwipeNavigationHandler;
