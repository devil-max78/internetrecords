"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAnon = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
// Use service role key for backend operations (bypasses RLS)
const supabaseUrl = env_1.env.SUPABASE_URL;
const supabaseServiceRoleKey = env_1.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Export anon client for client-side operations if needed
exports.supabaseAnon = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY);
exports.default = exports.supabase;
