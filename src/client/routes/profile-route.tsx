import { Route } from '@tanstack/react-router';
import { rootRoute } from './root';
import ProfilePage from './profile';

export const profileRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});
