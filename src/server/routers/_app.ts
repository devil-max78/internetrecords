import { router } from '../trpc';
import { authRouter } from './auth';
import { releaseRouter } from './release';
import { uploadRouter } from './upload';
import { adminRouter } from './admin';

// Create and export the app router with all sub-routers
export const appRouter = router({
  auth: authRouter,
  release: releaseRouter,
  upload: uploadRouter,
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;