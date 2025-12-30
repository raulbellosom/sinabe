import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * HardwareBackButtonHandler - Componente que maneja el botón físico "back" de Android
 *
 * En lugar de cerrar la app, navega hacia atrás en el historial.
 * Si está en una ruta raíz (dashboard), minimiza la app.
 */
const HardwareBackButtonHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Rutas donde presionar back debería salir/minimizar la app
  const exitRoutes = ['/', '/dashboard', '/login'];
  const isExitRoute = exitRoutes.includes(location.pathname);

  const handleBackButton = useCallback(() => {
    if (isExitRoute) {
      // En rutas raíz, minimizar la app (no cerrarla)
      App.minimizeApp();
    } else {
      // En otras rutas, navegar hacia atrás
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate, isExitRoute]);

  useEffect(() => {
    // Solo en plataforma nativa (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listener = null;

    // Listener para el botón back de hardware
    const setupListener = async () => {
      listener = await App.addListener('backButton', ({ canGoBack }) => {
        handleBackButton();
      });
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [handleBackButton]);

  return children;
};

export default HardwareBackButtonHandler;
