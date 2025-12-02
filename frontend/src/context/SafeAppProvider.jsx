import React from 'react';
import AuthProvider from './AuthProvider';
import LoadingProvider from './LoadingProvider';
import ConditionalDataProvider from './ConditionalDataProvider';
import { AIAgentProvider } from './AIAgentContext.jsx';
import { UserPreferenceProvider } from './UserPreferenceContext';

/**
 * SafeAppProvider - Proveedor principal que maneja la carga segura de la aplicación
 *
 * Orden de carga:
 * 1. LoadingProvider - Manejo de estados de carga globales
 * 2. AuthProvider - Autenticación y verificación de usuario
 * 3. UserPreferenceProvider - Preferencias de usuario (siempre disponible, maneja su propia carga)
 * 4. ConditionalDataProvider - Solo carga providers de datos si el usuario está autenticado
 */
const SafeAppProvider = ({ children }) => (
  <LoadingProvider>
    <AIAgentProvider>
      <AuthProvider>
        <UserPreferenceProvider>
          <ConditionalDataProvider>{children}</ConditionalDataProvider>
        </UserPreferenceProvider>
      </AuthProvider>
    </AIAgentProvider>
  </LoadingProvider>
);

export default SafeAppProvider;
