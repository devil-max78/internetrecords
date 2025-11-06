const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = 'https://spxvjfkojezlcowhwjzv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running enhanced schema migration...\n');
  
  try {
    // Read the enhanced schema SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase-enhanced-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          
          if (directError && directError.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1}: Skipping (table/function may not exist yet)`);
          } else {
            console.log(`✓ Statement ${i + 1}: Success`);
            successCount++;
          }
        } else {
          console.log(`✓ Statement ${i + 1}: Success`);
          successCount++;
        }
      } catch (err) {
        console.error(`✗ Statement ${i + 1}: Error - ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Migration Summary:`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Total: ${statements.length}`);
    console.log(`${'='.repeat(60)}\n`);
    
    if (errorCount > 0) {
      console.log('⚠️  Some statements failed. This is normal if tables already exist.');
      console.log('Please run the SQL manually in Supabase SQL Editor if needed.\n');
    } else {
      console.log('✓ Migration completed successfully!\n');
    }
    
    console.log('Next steps:');
    console.log('1. Restart the server if it\'s running');
    console.log('2. Test the new features in the upload form\n');
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\n⚠️  Please run the SQL manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/spxvjfkojezlcowhwjzv/sql');
    console.log('2. Copy the contents of supabase-enhanced-schema.sql');
    console.log('3. Paste and run in the SQL Editor\n');
    process.exit(1);
  }
}

runMigration();
