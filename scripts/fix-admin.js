const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@example.com';
const adminName = process.env.ADMIN_INITIAL_NAME || 'Admin User';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdmin() {
  console.log('🔧 Fixing admin user...\n');
  
  try {
    // Get admin from Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const authUser = users?.find(u => u.email === adminEmail);
    
    if (!authUser) {
      console.log('❌ Admin user not found in Supabase Auth');
      console.log('Run: node scripts/create-supabase-admin.js');
      return;
    }
    
    console.log('✅ Found admin in Supabase Auth');
    console.log('Auth ID:', authUser.id);
    
    // Delete old admin from database
    console.log('\n📝 Removing old admin profile...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', adminEmail);
    
    if (deleteError) {
      console.log('Note:', deleteError.message);
    }
    
    // Insert new admin with correct ID
    console.log('📝 Creating new admin profile with correct ID...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: adminEmail,
        name: adminName,
        password: '',
        role: 'ADMIN',
      });
    
    if (insertError) {
      throw insertError;
    }
    
    console.log('✅ Admin profile fixed!');
    console.log('\n🎉 You can now login with:');
    console.log('Email:', adminEmail);
    console.log('Password:', process.env.ADMIN_INITIAL_PASSWORD || 'admin123');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

fixAdmin();
