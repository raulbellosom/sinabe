import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout, register, loadUser } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import Notifies from '../components/Notifies/Notifies';

export const useAuthData = (dispatch) => {
  const queryClient = useQueryClient();
  const { dispatch: loadingDispatch } = useLoading();

  const setLoading = (loading) => {
    loadingDispatch({ type: 'SET_LOADING', payload: loading });
  };
  
  const loginMutation = useMutation({
    mutationFn: login,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.setQueryData('user', data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
    },
    onError: (error) => {
      dispatch({ type: 'AUTH_ERROR', payload: error });
      Notifies('error', 'Usuario o contraseña incorrectos');
    },
    onSettled: () => setLoading(false),
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.setQueryData('user', data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
    },
    onSettled: () => setLoading(false),
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.removeQueries('user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    },
    onSettled: () => setLoading(false),
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
