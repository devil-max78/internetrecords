const API_URL = 'http://localhost:3000/api';

async function testReleaseCreation() {
  console.log('🧪 Testing Release Creation...\n');
  
  try {
    // First login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      console.log('❌ Login failed');
      return;
    }
    console.log('✅ Login successful');
    
    const token = loginData.token;
    
    // Create a release
    console.log('\n2. Creating release...');
    const createResponse = await fetch(`${API_URL}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Album ' + Date.now()
      })
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('❌ Create release failed:', error);
      return;
    }
    
    const release = await createResponse.json();
    console.log('✅ Release created:', release);
    
    // Get all releases
    console.log('\n3. Getting all releases...');
    const getResponse = await fetch(`${API_URL}/releases`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const releases = await getResponse.json();
    console.log('✅ Found', releases.length, 'releases');
    
    // Add a track
    console.log('\n4. Adding track to release...');
    const trackResponse = await fetch(`${API_URL}/releases/${release.id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          title: 'Test Track 1',
          duration: 180,
          genre: 'Pop',
          singer: 'Singer Test',
          lyricist: 'Lyricist Test',
          composer: 'Composer Test'
        })
    });
    
    if (!trackResponse.ok) {
      const error = await trackResponse.json();
      console.log('❌ Add track failed:', error);
      return;
    }
    
    const track = await trackResponse.json();
    if (track.singer && track.lyricist && track.composer) {
      console.log('✅ Track added with credits:', track);
    } else {
      console.error('❌ Track credits missing:', track);
      return;
    }

    // Optionally fetch metadata CSV (admin) to make sure credits show up
    console.log('\n5. Fetching metadata CSV (admin) for this release...');
    const csvResponse = await fetch(`${API_URL}/admin/releases/${release.id}/metadata/csv`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!csvResponse.ok) {
      const error = await csvResponse.json();
      console.error('❌ CSV fetch failed:', error);
      return;
    }

    const csvText = await csvResponse.text();
    if (csvText.includes('Singer') && csvText.includes('Lyricist') && csvText.includes('Composer')) {
      console.log('✅ CSV contains header credits.');
    }
    if (csvText.includes('Singer Test') && csvText.includes('Lyricist Test')) {
      console.log('✅ CSV contains track credit values.');
    } else {
      console.error('❌ CSV does not contain track credit values.');
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReleaseCreation();
