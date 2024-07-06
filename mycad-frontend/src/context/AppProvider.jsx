import React from 'react';
import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import VehicleProvider from './VehicleProvider';
import LoadingProvider from './LoadingProvider';

const AppProvider = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <UserProvider>
          <VehicleProvider>{children}</VehicleProvider>
        </UserProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};

export default AppProvider;
