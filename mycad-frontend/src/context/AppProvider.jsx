import React from 'react';
import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import VehicleProvider from './VehicleProvider';
import LoadingProvider from './LoadingProvider';
import CatalogProvider from './CatalogProvider';
import RoleProvider from './RoleProvider';
import PermissionProvider from './PermissionProvider';
import { BreadcrumbProvider } from './BreadcrumbContext';

const AppProvider = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <UserProvider>
          <VehicleProvider>
            <CatalogProvider>
              <PermissionProvider>
                <RoleProvider>
                  <BreadcrumbProvider>{children}</BreadcrumbProvider>
                </RoleProvider>
              </PermissionProvider>
            </CatalogProvider>
          </VehicleProvider>
        </UserProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};

export default AppProvider;
