import { createContext, useContext } from 'react';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  dispatch: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
