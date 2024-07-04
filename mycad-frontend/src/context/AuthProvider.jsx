import { useReducer, useEffect } from 'react';
import AuthContext from './AuthContext';
import AuthReducer from './AuthReducer.js';
import axios from 'axios';

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, {
    user: null,
    loading: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        dispatch({ type: 'LOAD_USER', payload: response.data });
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
