import React, { useContext } from 'react';
import AuthContext from './AuthContext';
import UserProvider from './UserProvider';
import InventoryProvider from './InventoryProvider';
import CatalogProvider from './CatalogProvider';
import RoleProvider from './RoleProvider';
import PermissionProvider from './PermissionProvider';
import { BreadcrumbProvider } from './BreadcrumbContext';
import CustomFieldProvider from './CustomFieldProvider';

/**
 * ConditionalDataProvider - Solo carga los providers de datos cuando el usuario está autenticado
 *
 * Este componente evita que se ejecuten peticiones HTTP innecesarias antes de que
 * el usuario esté completamente autenticado y verificado.
 */
const ConditionalDataProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Mientras está cargando la autenticación, no renderizar providers de datos
  if (loading) {
    return children;
  }

  // Si no hay usuario autenticado, no cargar providers de datos
  if (!user) {
    return children;
  }

  // Solo si hay usuario autenticado, cargar todos los providers de datos
  return (
    <RoleProvider>
      <PermissionProvider>
        <UserProvider>
          <InventoryProvider>
            <CatalogProvider>
              <CustomFieldProvider>
                <BreadcrumbProvider>{children}</BreadcrumbProvider>
              </CustomFieldProvider>
            </CatalogProvider>
          </InventoryProvider>
        </UserProvider>
      </PermissionProvider>
    </RoleProvider>
  );
};

export default ConditionalDataProvider;
