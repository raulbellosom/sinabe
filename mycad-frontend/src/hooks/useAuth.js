import { useMutation, useQueryClient } from 'react-query';
import { login, logout, register, loadUser } from '../services/api';

export const useAuthData = (dispatch) => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation(login, {
    onSuccess: (data) => {
      queryClient.setQueryData('user', data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // Save token to localStorage
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
    },
  });

  const registerMutation = useMutation(register, {
    onSuccess: (data) => {
      queryClient.setQueryData('user', data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // Save token to localStorage
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
    },
  });

  const logoutMutation = useMutation(logout, {
    onSuccess: () => {
      queryClient.removeQueries('user');
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Remove token from localStorage
      dispatch({ type: 'LOGOUT' });
    },
  });

  const loadUserData = async () => {
    const data = await loadUser();
    if (data) {
      queryClient.setQueryData('user', data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    }
    return null;
  };

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loadUser: loadUserData,
  };
};
