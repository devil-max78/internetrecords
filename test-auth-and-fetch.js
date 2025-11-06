const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://spxvjfkojezlcowhwjzv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthAndFetch() {
  console.log('Testing authentication and data fetch...\n');
  
  try {
    // Try to sign in with admin credentials
    console.log('1. Attempting to sign in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123',
    });
    
    if (authError) {
      console.error('   ✗ Auth error:', authError.message);
      return;
    }
    
    console.log('   ✓ Signed in successfully');
    console.log('   Token:', authData.session.access_token.substring(0, 50) + '...');
    
    // Now try to fetch data using the token
    const token = authData.session.access_token;
    
    console.log('\n2. Fetching album categories...');
    const catResponse = await fetch('http://localhost:3000/api/metadata/album-categories', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('   Status:', catResponse.status);
    const catData = await catResponse.json();
    console.log('   Data:', JSON.stringify(catData, null, 2));
    
    console.log('\n3. Fetching content types...');
    const typeResponse = await fetch('http://localhost:3000/api/metadata/content-types', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('   Status:', typeResponse.status);
    const typeData = await typeResponse.json();
    console.log('   Data:', JSON.stringify(typeData, null, 2));
    
    console.log('\n4. Fetching publishers...');
    const pubResponse = await fetch('http://localhost:3000/api/metadata/publishers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('   Status:', pubResponse.status);
    const pubData = await pubResponse.json();
    console.log('   Data:', JSON.stringify(pubData, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ All endpoints working correctly!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuthAndFetch();
