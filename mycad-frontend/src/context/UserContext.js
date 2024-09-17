import { createContext, useContext } from 'react';

const UserContext = createContext({
  users: [],
  user: null,
  dispatch: () => {},
  createUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export default UserContext;
