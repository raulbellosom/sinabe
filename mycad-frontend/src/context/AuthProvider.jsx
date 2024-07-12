import React, { useReducer, useEffect } from 'react';
import AuthContext from './AuthContext';
import authReducer from './AuthReducer';
import { useAuthData } from '../hooks/useAuth';

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: true,
  });

  const { login, logout, register, loadUser } = useAuthData(dispatch);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          dispatch({ type: 'AUTH_ERROR' });
          return;
        }
        const user = await loadUser();
        if (user) {
          dispatch({ type: 'LOAD_USER', payload: user });
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    if (!state.user) {
      console.log('No user');
      loadUserData();
    } else {
      dispatch({ type: 'LOAD_USER', payload: state.user });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, register, dispatch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
