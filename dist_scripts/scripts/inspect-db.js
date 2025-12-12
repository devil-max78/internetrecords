"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
async function inspect() {
    console.log('Fetching all custom label requests...');
    const { data, error } = await supabase
        .from('custom_label_requests')
        .select('*, user:users(id, email, name)')
        .order('created_at', { ascending: false });
    if (error) {
        console.error(error);
        return;
    }
    console.table(data.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        user_email: r.user?.email,
        created_at: r.created_at
    })));
}
inspect();
