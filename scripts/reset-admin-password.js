const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  console.log('🔧 Resetting admin password...\n');
  
  try {
    // Get admin from Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const authUser = users?.find(u => u.email === adminEmail);
    
    if (!authUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Found admin user');
    console.log('User ID:', authUser.id);
    
    // Update password
    console.log('\n📝 Updating password...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: adminPassword }
    );
    
    if (updateError) {
      throw updateError;
    }
    
    console.log('✅ Password updated successfully!');
    console.log('\n🎉 You can now login with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
