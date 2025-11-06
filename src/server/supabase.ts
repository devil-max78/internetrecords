import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Use service role key for backend operations (bypasses RLS)
const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Export anon client for client-side operations if needed
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export default supabase;