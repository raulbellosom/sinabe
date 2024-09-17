import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, deleteUser } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import Notifies from '../components/Notifies/Notifies';

const useUser = () => {
  const queryClient = useQueryClient();
  const { dispatch: loadingDispatch } = useLoading();

  const setLoading = (loading) => {
    loadingDispatch({ type: 'SET_LOADING', payload: loading });
  };

  const useCreateUser = useMutation({
    mutationFn: createUser,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      dispatch({ type: 'CREATE_USER', payload: data });
      Notifies('success', 'User created successfully');
    },
    onError: (error) => {
      console.log('error on createUser', error);
      setLoading(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries('users');
      setLoading(false);
    },
  });

  const useUpdateUser = useMutation({
    mutationFn: updateUser,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      dispatch({ type: 'UPDATE_USER', payload: data });
      Notifies('success', 'User updated successfully');
    },
    onError: (error) => {
      console.log('error on updateUser', error);
      setLoading(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries('users');
      setLoading(false);
    },
  });

  const useDeleteUser = useMutation({
    mutationFn: deleteUser,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      dispatch({ type: 'DELETE_USER', payload: data });
      Notifies('success', 'User deleted successfully');
    },
    onError: (error) => {
      console.log('error on deleteUser', error);
      setLoading(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries('users');
      setLoading(false);
    },
  });

  return {
    useCreateUser: (values) => {
      return useCreateUser.mutateAsync(values);
    },
    useUpdateUser: (values) => {
      return useUpdateUser.mutateAsync(values);
    },
    useDeleteUser: (values) => {
      return useDeleteUser.mutateAsync(values);
    },
  };
};

export default useUser;
