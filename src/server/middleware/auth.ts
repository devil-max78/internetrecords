import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import { db } from '../db';

// User type
type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'ARTIST' | 'LABEL' | 'ADMIN';
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Authentication middleware using Supabase Auth
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      console.error('Auth verification error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user details from database
    const user = await db.user.findUnique({ where: { id: authUser.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ARTIST' | 'LABEL' | 'ADMIN',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin middleware (must be used after authMiddleware)
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
