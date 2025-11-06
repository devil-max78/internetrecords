import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import env from './env';

// Using db from './db.ts' instead of Prisma

// User type for authentication
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'ARTIST' | 'LABEL' | 'ADMIN';
};

// Generate JWT token
export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Create initial admin user using Supabase Auth
export const createInitialAdmin = async (): Promise<void> => {
  try {
    const { supabase } = await import('./supabase');
    
    // Check if admin already exists in database
    const adminExists = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminExists) {
      console.log('Creating initial admin user...');
      
      // Create admin user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: env.ADMIN_INITIAL_EMAIL,
        password: env.ADMIN_INITIAL_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: env.ADMIN_INITIAL_NAME,
          role: 'ADMIN',
        },
      });

      if (authError) {
        console.error('Error creating admin in Supabase Auth:', authError);
        // If user already exists in auth, try to find them
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (!listError && users) {
          const existingAuthUser = users.find(u => u.email === env.ADMIN_INITIAL_EMAIL);
          
          if (existingAuthUser) {
            // Create profile in database
            await db.user.create({
              data: {
                id: existingAuthUser.id,
                email: env.ADMIN_INITIAL_EMAIL,
                name: env.ADMIN_INITIAL_NAME,
                password: '',
                role: 'ADMIN',
              },
            });
            console.log('Admin user profile created in database');
            return;
          }
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create admin user');
      }

      // Create admin profile in database
      await db.user.create({
        data: {
          id: authData.user.id,
          email: env.ADMIN_INITIAL_EMAIL,
          name: env.ADMIN_INITIAL_NAME,
          password: '', // Password is managed by Supabase Auth
          role: 'ADMIN',
        },
      });
      
      console.log('Initial admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error: any) {
    console.error('Error creating initial admin user:', error);
    // Don't throw - allow server to start even if admin creation fails
    console.warn('Server will continue without initial admin. You can create one manually.');
  }
};