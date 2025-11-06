import { hashPassword } from '../src/server/auth';
import env from '../src/server/env';
import { supabase } from '../src/server/supabase';

async function main() {
  try {
    // Check if admin already exists
    const { data: adminExists, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ADMIN')
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword(env.ADMIN_INITIAL_PASSWORD);

    const { data: admin, error: createError } = await supabase
      .from('users')
      .insert({
        email: env.ADMIN_INITIAL_EMAIL,
        name: env.ADMIN_INITIAL_NAME,
        password: hashedPassword,
        role: 'ADMIN',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

main();
