import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
  beforeLoad: ({ context }) => {
    const token = localStorage.getItem('token');
    if (token) {
      throw redirect({ to: '/dashboard' });
    } else {
      throw redirect({ to: '/login' });
    }
  },
});

function IndexComponent() {
  return null;
}