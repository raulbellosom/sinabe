import { useReducer, useEffect } from 'react';
import UserReducer from './UserReducer';
import UserContext from './UserContext';
import { getUsers } from '../services/api';

const initialState = {
  users: [],
};

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(UserReducer, initialState);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        dispatch({ type: 'SET_USERS', payload: users });
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
