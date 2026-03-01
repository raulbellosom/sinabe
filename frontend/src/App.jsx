import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Toaster } from 'sonner';

import SafeAppProvider from './context/SafeAppProvider';
import AppRouter from './router/AppRouter';
import { AIAgentModal } from './components/AIAgent';
import queryClient from './lib/query/queryClient';
import { useTheme } from './providers/theme/useTheme';

const NativeStatusBarSync = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({
          style: resolvedTheme === 'dark' ? Style.Dark : Style.Light,
        });
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (error) {
        console.error('Error configuring status bar', error);
      }
    };

    configureStatusBar();
  }, [resolvedTheme]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAppProvider>
        <NativeStatusBarSync />
        <AppRouter />
        <AIAgentModal />
        <Toaster position="bottom-right" richColors />
      </SafeAppProvider>
    </QueryClientProvider>
  );
}

export default App;
