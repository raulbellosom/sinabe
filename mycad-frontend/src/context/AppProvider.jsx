import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import VehicleProvider from './VehicleProvider';

const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <VehicleProvider>{children}</VehicleProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default AppProvider;
