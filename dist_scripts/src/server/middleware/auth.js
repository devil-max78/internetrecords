"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const supabase_1 = require("../supabase");
const db_1 = require("../db");
// Authentication middleware using Supabase Auth
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        // Verify token with Supabase
        const { data: { user: authUser }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !authUser) {
            console.error('Auth verification error:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Get user details from database
        const user = await db_1.db.user.findUnique({ where: { id: authUser.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};
exports.authMiddleware = authMiddleware;
// Admin middleware (must be used after authMiddleware)
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
