import React from 'react';
import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import VehicleProvider from './VehicleProvider';
import LoadingProvider from './LoadingProvider';
import { BreadcrumbProvider } from './BreadcrumbContext';
import CatalogProvider from './CatalogProvider';

const AppProvider = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <UserProvider>
          <VehicleProvider>
            <CatalogProvider>
              <BreadcrumbProvider>{children}</BreadcrumbProvider>
            </CatalogProvider>
          </VehicleProvider>
        </UserProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};

export default AppProvider;
