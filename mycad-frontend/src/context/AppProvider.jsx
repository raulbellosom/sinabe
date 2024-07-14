import React from 'react';
import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import VehicleProvider from './VehicleProvider';
import LoadingProvider from './LoadingProvider';
import { BreadcrumbProvider } from './BreadcrumbContext';

const AppProvider = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <UserProvider>
          <VehicleProvider>
            <BreadcrumbProvider>{children}</BreadcrumbProvider>
          </VehicleProvider>
        </UserProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};

export default AppProvider;
