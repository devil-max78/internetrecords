import React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {isAuthenticated && <Navbar />}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}