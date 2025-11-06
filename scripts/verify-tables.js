const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://spxvjfkojezlcowhwjzv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('Verifying database tables...\n');
  
  try {
    // Check album_categories
    const { data: categories, error: catError } = await supabase
      .from('album_categories')
      .select('*');
    
    console.log('✓ album_categories:', categories?.length || 0, 'rows');
    if (categories && categories.length > 0) {
      console.log('  -', categories.map(c => c.name).join(', '));
    }
    if (catError) console.error('  Error:', catError.message);
    
    // Check content_types
    const { data: types, error: typeError } = await supabase
      .from('content_types')
      .select('*');
    
    console.log('\n✓ content_types:', types?.length || 0, 'rows');
    if (types && types.length > 0) {
      console.log('  -', types.map(t => t.name).join(', '));
    }
    if (typeError) console.error('  Error:', typeError.message);
    
    // Check publishers
    const { data: publishers, error: pubError } = await supabase
      .from('publishers')
      .select('*');
    
    console.log('\n✓ publishers:', publishers?.length || 0, 'rows');
    if (publishers && publishers.length > 0) {
      console.log('  -', publishers.map(p => p.name).join(', '));
    }
    if (pubError) console.error('  Error:', pubError.message);
    
    // Check artists
    const { data: artists, error: artError } = await supabase
      .from('artists')
      .select('*');
    
    console.log('\n✓ artists:', artists?.length || 0, 'rows');
    if (artError) console.error('  Error:', artError.message);
    
    // Check sub_labels
    const { data: subLabels, error: subError } = await supabase
      .from('sub_labels')
      .select('*');
    
    console.log('\n✓ sub_labels:', subLabels?.length || 0, 'rows');
    if (subError) console.error('  Error:', subError.message);
    
    // Check releases columns
    const { data: releases, error: relError } = await supabase
      .from('releases')
      .select('*')
      .limit(1);
    
    console.log('\n✓ releases table exists');
    if (releases && releases.length > 0) {
      const columns = Object.keys(releases[0]);
      console.log('  Columns:', columns.length);
      const newColumns = ['album_category_id', 'content_type_id', 'c_line', 'crbt_start_time', 'crbt_end_time'];
      const hasNew = newColumns.filter(col => columns.includes(col));
      console.log('  New columns present:', hasNew.join(', ') || 'None');
    }
    if (relError) console.error('  Error:', relError.message);
    
    // Check tracks columns
    const { data: tracks, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .limit(1);
    
    console.log('\n✓ tracks table exists');
    if (tracks && tracks.length > 0) {
      const columns = Object.keys(tracks[0]);
      const hasCrbt = columns.includes('crbt_start_time') && columns.includes('crbt_end_time');
      console.log('  CRBT columns:', hasCrbt ? 'Present' : 'Missing');
    }
    if (trackError) console.error('  Error:', trackError.message);
    
    console.log('\n' + '='.repeat(60));
    console.log('Verification complete!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyTables();
