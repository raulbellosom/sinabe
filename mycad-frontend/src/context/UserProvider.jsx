import { useReducer, useEffect } from 'react';
import UserReducer from './UserReducer';
import UserContext from './UserContext';
import useUser from '../hooks/useUser';

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(UserReducer, {
    users: [],
    user: null,
  });

  const { useCreateUser, useDeleteUser, useUpdateUser } = useUser();

  return (
    <UserContext.Provider
      value={{
        ...state,
        dispatch,
        useCreateUser,
        useDeleteUser,
        useUpdateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
