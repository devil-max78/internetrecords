// Test Supabase Auth integration
const API_URL = 'http://localhost:3000/api';

async function testSignup() {
  console.log('\n🧪 Testing Signup...');
  
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        role: 'ARTIST'
      })
    });
    
    const data = await response.json();
    console.log('Signup response:', data);
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      return data.token;
    } else {
      console.log('❌ Signup failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Signup error:', error);
    return null;
  }
}

async function testLogin() {
  console.log('\n🧪 Testing Login...');
  
  try {
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
    
    if (response.ok && data.token) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token.substring(0, 50) + '...');
      return data.token;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

async function testGetUser(token) {
  console.log('\n🧪 Testing Get Current User...');
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    console.log('Get user response:', data);
    
    if (response.ok) {
      console.log('✅ Get user successful!');
      return true;
    } else {
      console.log('❌ Get user failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Get user error:', error);
    return false;
  }
}

async function testProtectedRoute(token) {
  console.log('\n🧪 Testing Protected Route (Get Releases)...');
  
  try {
    const response = await fetch(`${API_URL}/releases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    console.log('Get releases response:', data);
    
    if (response.ok) {
      console.log('✅ Protected route access successful!');
      return true;
    } else {
      console.log('❌ Protected route access failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Protected route error:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Supabase Auth Tests...\n');
  
  try {
    // Test login with admin
    const token = await testLogin();
    
    if (token) {
      await testGetUser(token);
      await testProtectedRoute(token);
    }
    
    // Test signup (optional - creates a new user each time)
    // await testSignup();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

runTests();
