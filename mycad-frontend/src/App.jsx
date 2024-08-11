import React from 'react';
const AppProvider = React.lazy(() => import('./context/AppProvider'));
const AppRouter = React.lazy(() => import('./router/AppRouter'));
import { Toaster } from 'react-hot-toast';
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
