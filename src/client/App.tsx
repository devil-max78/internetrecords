import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Import routes
import { rootRoute } from './routes/root';
import { indexRoute } from './routes/index';
import { loginRoute } from './routes/login';
import { signupRoute } from './routes/signup';
import { dashboardRoute } from './routes/dashboard';
import { uploadEnhancedRoute as uploadRoute } from './routes/upload-enhanced';
import { releaseDetailRoute } from './routes/release-detail';
import { adminRoute } from './routes/admin';

// Create query client outside component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  dashboardRoute,
  uploadRoute,
  releaseDetailRoute,
  adminRoute,
]);

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  context: {
    queryClient,
  },
});

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// App component
const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;