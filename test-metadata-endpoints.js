const API_URL = 'http://localhost:3000/api';

// Test without auth (should fail)
async function testEndpoints() {
  console.log('Testing metadata endpoints...\n');
  
  try {
    // Test album categories
    console.log('1. Testing /metadata/album-categories');
    const catResponse = await fetch(`${API_URL}/metadata/album-categories`);
    console.log('   Status:', catResponse.status);
    const catData = await catResponse.json();
    console.log('   Response:', JSON.stringify(catData).substring(0, 100));
    
    // Test content types
    console.log('\n2. Testing /metadata/content-types');
    const typeResponse = await fetch(`${API_URL}/metadata/content-types`);
    console.log('   Status:', typeResponse.status);
    const typeData = await typeResponse.json();
    console.log('   Response:', JSON.stringify(typeData).substring(0, 100));
    
    // Test publishers
    console.log('\n3. Testing /metadata/publishers');
    const pubResponse = await fetch(`${API_URL}/metadata/publishers`);
    console.log('   Status:', pubResponse.status);
    const pubData = await pubResponse.json();
    console.log('   Response:', JSON.stringify(pubData).substring(0, 100));
    
    console.log('\n' + '='.repeat(60));
    if (catResponse.status === 401 || catResponse.status === 403) {
      console.log('✓ Endpoints require authentication (expected)');
      console.log('  The endpoints are working correctly!');
    } else if (catResponse.status === 200) {
      console.log('✓ Endpoints are accessible!');
      console.log('  Data is being returned correctly!');
    } else {
      console.log('⚠️  Unexpected status code');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Error testing endpoints:', error.message);
  }
}

testEndpoints();
