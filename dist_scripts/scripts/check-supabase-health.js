"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Load env vars
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});
async function checkHealth() {
    console.log(`Checking connection to: ${supabaseUrl}`);
    console.log('Running 10 sequential health checks...');
    let successCount = 0;
    let failCount = 0;
    for (let i = 1; i <= 10; i++) {
        const start = Date.now();
        try {
            // Simple lightweight query
            const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
            const duration = Date.now() - start;
            if (error) {
                console.error(`[${i}/10] FAILED (${duration}ms):`, error.message);
                failCount++;
            }
            else {
                console.log(`[${i}/10] OK (${duration}ms)`);
                successCount++;
            }
        }
        catch (err) {
            console.error(`[${i}/10] EXCEPTION:`, err.message);
            failCount++;
        }
    }
    console.log('\n--- Summary ---');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    if (failCount > 0) {
        console.error('Connection unstable.');
        process.exit(1);
    }
    else {
        console.log('Connection stable.');
        process.exit(0);
    }
}
checkHealth();
