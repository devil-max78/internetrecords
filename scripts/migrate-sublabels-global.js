const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running sub-labels global migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase-sublabels-global-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_sql').select(statement);
        if (directError) {
          console.error('❌ Error:', error.message || directError.message);
          throw error || directError;
        }
      }
      console.log('✅ Success\n');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nSub-labels are now global and can be managed by admins.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease run the migration manually in Supabase SQL Editor:');
    console.error('File: supabase-sublabels-global-migration.sql');
    process.exit(1);
  }
}

runMigration();
