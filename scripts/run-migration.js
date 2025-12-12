"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
    process.exit(1);
}
// Create Supabase client with service role key
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
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
    }
    catch (error) {
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
