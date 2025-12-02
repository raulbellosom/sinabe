import React, { useContext } from 'react';
import AuthProvider from './AuthProvider';
import UserProvider from './UserProvider';
import InventoryProvider from './InventoryProvider';
import InventorySelectionProvider from './InventorySelectionProvider';
import LoadingProvider from './LoadingProvider';
import CatalogProvider from './CatalogProvider';
import RoleProvider from './RoleProvider';
import PermissionProvider from './PermissionProvider';
import { BreadcrumbProvider } from './BreadcrumbContext';
import CustomFieldProvider from './CustomFieldProvider';
import { UserPreferenceProvider } from './UserPreferenceContext';

import AuthContext from './AuthContext';

const SecurityProvider = ({ children }) => (
  <AuthProvider>
    <RoleProvider>
      <PermissionProvider>{children}</PermissionProvider>
    </RoleProvider>
  </AuthProvider>
);

const AuthenticatedDataProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Solo cargar providers de datos si el usuario está autenticado
  if (!user && !loading) {
    return children;
  }

  return (
    <UserProvider>
      <InventoryProvider>
        <CatalogProvider>
          <CustomFieldProvider>
            <UserPreferenceProvider>
              <BreadcrumbProvider>{children}</BreadcrumbProvider>
            </UserPreferenceProvider>
          </CustomFieldProvider>
        </CatalogProvider>
      </InventoryProvider>
    </UserProvider>
  );
};

const AppProvider = ({ children }) => (
  <LoadingProvider>
    <SecurityProvider>
      <InventorySelectionProvider>
        <AuthenticatedDataProvider>{children}</AuthenticatedDataProvider>
      </InventorySelectionProvider>
    </SecurityProvider>
  </LoadingProvider>
);

export default AppProvider;
