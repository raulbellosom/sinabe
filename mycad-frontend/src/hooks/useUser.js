import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { useContext } from 'react';
import UserContext from '../context/UserContext';

const useUser = () => {
  const { dispatch } = useContext(UserContext);
  const queryClient = useQueryClient();

  const { data: users, status } = useQuery('users', getUsers, {
    onSuccess: (data) => {
      dispatch({ type: 'SET_USERS', payload: data });
    },
  });

  const createUserMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  const updateUserMutation = useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  const deleteUserMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  return {
    users,
    status,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
  };
};

export default useUser;
