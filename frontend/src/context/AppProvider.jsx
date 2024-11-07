import React from 'react';
import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import InventoryProvider from './InventoryProvider';
import LoadingProvider from './LoadingProvider';
import CatalogProvider from './CatalogProvider';
import RoleProvider from './RoleProvider';
import PermissionProvider from './PermissionProvider';
import { BreadcrumbProvider } from './BreadcrumbContext';

const SecurityProvider = ({ children }) => (
  <AuthProvider>
    <RoleProvider>
      <PermissionProvider>{children}</PermissionProvider>
    </RoleProvider>
  </AuthProvider>
);

const DataProvider = ({ children }) => (
  <UserProvider>
    <InventoryProvider>
      <CatalogProvider>{children}</CatalogProvider>
    </InventoryProvider>
  </UserProvider>
);

const AppProvider = ({ children }) => (
  <LoadingProvider>
    <SecurityProvider>
      <DataProvider>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </DataProvider>
    </SecurityProvider>
  </LoadingProvider>
);

export default AppProvider;
