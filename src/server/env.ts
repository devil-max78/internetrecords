import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment schema with Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('music-distribution'),
  JWT_SECRET: z.string().min(10),
  ADMIN_INITIAL_EMAIL: z.string().email(),
  ADMIN_INITIAL_NAME: z.string(),
  ADMIN_INITIAL_PASSWORD: z.string().min(6),
  
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // Database
  DATABASE_URL: z.string(),
  

});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Export validated environment variables
export default env;