import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyToken, type AuthUser } from './auth';

// Context type
export interface Context {
  user: AuthUser | null;
}

// Create context for each request
export const createContext = ({ req }: CreateExpressContextOptions): Context => {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  // Verify token
  const user = verifyToken(token);
  
  return { user };
};

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Admin procedure (requires admin role)
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  return next({ ctx: { ...ctx, user: ctx.user } });
});