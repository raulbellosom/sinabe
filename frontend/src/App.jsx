import React, { useEffect } from 'react';
import SafeAppProvider from './context/SafeAppProvider';
import AppRouter from './router/AppRouter';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIAgentModal } from './components/AIAgent';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: (failureCount, error) => {
        // No reintentar si es error de autenticación
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const configureStatusBar = async () => {
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch (e) {
          console.error('Error configuring status bar', e);
        }
      };
      configureStatusBar();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAppProvider>
        <AppRouter />
        <AIAgentModal />
        <Toaster position="bottom-right" />
      </SafeAppProvider>
    </QueryClientProvider>
  );
}

export default App;
