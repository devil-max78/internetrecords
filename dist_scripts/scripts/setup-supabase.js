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
const supabaseUrl = 'https://spxvjfkojezlcowhwjzv.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey) {
    console.error('SUPABASE_KEY not found in environment variables');
    process.exit(1);
}
// Create Supabase client (for future use)
(0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function setupDatabase() {
    console.log('Setting up Supabase database...');
    try {
        // Read the enhanced schema SQL file
        const migrationPath = path.join(process.cwd(), 'supabase-enhanced-schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        console.log('Migration SQL loaded. Please run this SQL in your Supabase SQL Editor:');
        console.log('\n' + '='.repeat(80));
        console.log(migrationSQL);
        console.log('='.repeat(80) + '\n');
        console.log('Instructions:');
        console.log('1. Go to your Supabase project: https://supabase.com/dashboard/project/spxvjfkojezlcowhwjzv');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the SQL above');
        console.log('4. Click "Run" to execute the migration');
        console.log('\nAfter running the migration, restart the server with: npm run dev:server');
    }
    catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}
setupDatabase();
