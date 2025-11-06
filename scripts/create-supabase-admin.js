const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
const adminName = process.env.ADMIN_INITIAL_NAME || 'Admin User';

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('🔧 Creating admin user in Supabase Auth...\n');
  
  try {
    // Check if user already exists in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }
    
    const existingAuthUser = users?.find(u => u.email === adminEmail);
    
    if (existingAuthUser) {
      console.log('✅ Admin user already exists in Supabase Auth');
      console.log('User ID:', existingAuthUser.id);
      console.log('Email:', existingAuthUser.email);
      
      // Check if profile exists in database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingAuthUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
      }
      
      if (!profile) {
        console.log('\n📝 Creating user profile in database...');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: existingAuthUser.id,
            email: adminEmail,
            name: adminName,
            password: '',
            role: 'ADMIN',
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
        
        console.log('✅ Admin profile created in database');
      } else {
        console.log('✅ Admin profile already exists in database');
      }
      
      return;
    }
    
    // Create new admin user
    console.log('📝 Creating new admin user...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName,
        role: 'ADMIN',
      },
    });
    
    if (authError) {
      console.error('Error creating admin in Supabase Auth:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('Failed to create admin user');
    }
    
    console.log('✅ Admin user created in Supabase Auth');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    
    // Create admin profile in database
    console.log('\n📝 Creating admin profile in database...');
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        name: adminName,
        password: '',
        role: 'ADMIN',
      });
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      throw insertError;
    }
    
    console.log('✅ Admin profile created in database');
    
    console.log('\n🎉 Admin user setup complete!');
    console.log('\nLogin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
