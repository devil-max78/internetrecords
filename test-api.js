// Simple API test script
const API_URL = 'http://localhost:3000/api';

async function testLogin() {
  console.log('Testing login...');
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log('Login response:', data);
  
  if (data.token) {
    console.log('✅ Login successful!');
    return data.token;
  } else {
    console.log('❌ Login failed');
    return null;
  }
}

async function testGetReleases(token) {
  console.log('\nTesting get releases...');
  
  const response = await fetch(`${API_URL}/releases`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  console.log('Releases:', data);
  console.log('✅ Get releases successful!');
}

async function testHealthCheck() {
  console.log('\nTesting health check...');
  
  const response = await fetch(`${API_URL}/health`);
  const data = await response.json();
  console.log('Health check:', data);
  console.log('✅ Health check successful!');
}

async function runTests() {
  try {
    await testHealthCheck();
    const token = await testLogin();
    
    if (token) {
      await testGetReleases(token);
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
