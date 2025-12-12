"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/server/db");
const env_1 = require("../src/server/env");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function diagnose() {
    console.log('--- Environment Diagnosis ---');
    console.log('SUPABASE_URL:', env_1.env.SUPABASE_URL ? 'Present' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', env_1.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present (Length: ' + env_1.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    console.log('\n--- Database Content Diagnosis ---');
    try {
        // Direct DB query via the same mechanism the server uses
        console.log('Querying custom_label_requests...');
        const allRequests = await db_1.db.customLabelRequest.findMany({});
        console.log(`Found ${allRequests.length} total requests.`);
        if (allRequests.length > 0) {
            console.log('First 5 requests:', JSON.stringify(allRequests.slice(0, 5), null, 2));
        }
        else {
            console.log('Table is empty.');
        }
        // Check users table to ensure users exist
        const users = await db_1.db.user.findMany({});
        console.log(`Found ${users.length} users.`);
    }
    catch (error) {
        console.error('Database diagnosis failed:', error);
    }
}
diagnose();
