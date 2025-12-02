import React, { useReducer, useEffect } from 'react';
import AuthContext from './AuthContext';
import authReducer from './AuthReducer';
import { useAuthData } from '../hooks/useAuth';

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: true,
  });

  const {
    login,
    logout,
    register,
    loadUser,
    updatePassword,
    updateProfile,
    updateProfileImage,
    updateSignature,
  } = useAuthData(dispatch);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
          // Limpiar cualquier dato almacenado y marcar como no autenticado
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR' });
          return;
        }

        // Si hay token, intentar verificar el usuario
        const user = await loadUser();
        if (user) {
          dispatch({ type: 'LOAD_USER', payload: user });
        } else {
          // Token inválido, limpiar datos
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        console.warn('Error during token verification:', error);
        // Error de verificación, limpiar datos
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        dispatch,
        updatePassword,
        updateProfile,
        updateProfileImage,
        updateSignature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
