const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://spxvjfkojezlcowhwjzv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadUrl() {
  console.log('Testing upload URL generation...\n');
  
  try {
    const testFilePath = 'test-release-id/audio/test-file.mp3';
    
    console.log('1. Testing createSignedUploadUrl...');
    const { data, error } = await supabase.storage
      .from('music-files')
      .createSignedUploadUrl(testFilePath);
    
    if (error) {
      console.error('   ✗ Error:', error);
      return;
    }
    
    console.log('   ✓ Success!');
    console.log('   Signed URL:', data.signedUrl.substring(0, 100) + '...');
    console.log('   Path:', data.path);
    console.log('   Token:', data.token);
    
    console.log('\n2. Testing if we can upload to this URL...');
    const testContent = Buffer.from('test audio content');
    
    const uploadResponse = await fetch(data.signedUrl, {
      method: 'PUT',
      body: testContent,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
    
    console.log('   Upload status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      console.log('   ✓ Upload successful!');
      
      // Clean up test file
      console.log('\n3. Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from('music-files')
        .remove([testFilePath]);
      
      if (deleteError) {
        console.error('   ✗ Delete error:', deleteError);
      } else {
        console.log('   ✓ Test file deleted');
      }
    } else {
      console.error('   ✗ Upload failed:', await uploadResponse.text());
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ Upload URL generation is working!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUploadUrl();
