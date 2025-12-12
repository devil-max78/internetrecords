"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminProcedure = exports.protectedProcedure = exports.publicProcedure = exports.router = exports.createContext = void 0;
const server_1 = require("@trpc/server");
const auth_1 = require("./auth");
// Create context for each request
const createContext = ({ req }) => {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null };
    }
    // Extract token
    const token = authHeader.split(' ')[1];
    // Verify token
    const user = (0, auth_1.verifyToken)(token);
    return { user };
};
exports.createContext = createContext;
// Initialize tRPC
const t = server_1.initTRPC.context().create();
// Base router and procedure
exports.router = t.router;
exports.publicProcedure = t.procedure;
// Protected procedure (requires authentication)
exports.protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user) {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
});
// Admin procedure (requires admin role)
exports.adminProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user) {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    if (ctx.user.role !== 'ADMIN') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be an admin to access this resource',
        });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
});
