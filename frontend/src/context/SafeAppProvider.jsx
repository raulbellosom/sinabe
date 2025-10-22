import React from 'react';
import AuthProvider from './AuthProvider';
import LoadingProvider from './LoadingProvider';
import ConditionalDataProvider from './ConditionalDataProvider';

/**
 * SafeAppProvider - Proveedor principal que maneja la carga segura de la aplicación
 *
 * Orden de carga:
 * 1. LoadingProvider - Manejo de estados de carga globales
 * 2. AuthProvider - Autenticación y verificación de usuario
 * 3. ConditionalDataProvider - Solo carga providers de datos si el usuario está autenticado
 */
const SafeAppProvider = ({ children }) => (
  <LoadingProvider>
    <AuthProvider>
      <ConditionalDataProvider>{children}</ConditionalDataProvider>
    </AuthProvider>
  </LoadingProvider>
);

export default SafeAppProvider;
