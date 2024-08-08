import React from 'react';
import AppProvider from './context/AppProvider';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppRouter />
        <Toaster position="bottom-right" />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
