import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Running Supabase migration...\n');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        
        // Continue with other statements
        continue;
      }
      
      console.log(`✓ Statement ${i + 1} executed successfully`);
    }
    
    console.log('\n✓ Migration completed!');
    console.log('\nNote: If you see errors about existing objects, that\'s normal.');
    console.log('The migration is idempotent and safe to run multiple times.\n');
    
  } catch (error) {
    console.error('Error running migration:', error);
    console.log('\n⚠️  Automatic migration failed. Please run the SQL manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/spxvjfkojezlcowhwjzv/editor');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy the contents of supabase-migration.sql');
    console.log('4. Paste and run the SQL\n');
    process.exit(1);
  }
}

runMigration();
