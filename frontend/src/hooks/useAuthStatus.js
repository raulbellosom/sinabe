import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Hook personalizado para verificar autenticación de forma segura
 *
 * @returns {Object} Estado de autenticación con propiedades:
 * - isAuthenticated: boolean - Si el usuario está autenticado
 * - isLoading: boolean - Si está verificando la autenticación
 * - user: Object|null - Datos del usuario autenticado
 */
export const useAuthStatus = () => {
  const { user, loading, token } = useContext(AuthContext);

  const isAuthenticated = Boolean(user && token);
  const isLoading = loading;

  // Log para debugging (remover en producción)
  useEffect(() => {
    console.log('Auth Status:', {
      isAuthenticated,
      isLoading,
      hasUser: Boolean(user),
      hasToken: Boolean(token),
    });
  }, [isAuthenticated, isLoading, user, token]);

  return {
    isAuthenticated,
    isLoading,
    user,
  };
};

/**
 * Hook para proteger componentes que requieren autenticación
 *
 * @returns {Object} Estado de autenticación con método de verificación
 */
export const useRequireAuth = () => {
  const authStatus = useAuthStatus();

  const requireAuth = (callback) => {
    if (authStatus.isLoading) {
      return null; // Aún cargando
    }

    if (!authStatus.isAuthenticated) {
      return null; // No autenticado
    }

    return callback(); // Ejecutar callback si está autenticado
  };

  return {
    ...authStatus,
    requireAuth,
  };
};
