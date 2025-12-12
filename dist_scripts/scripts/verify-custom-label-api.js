"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import fetch from 'node-fetch'; // Use global fetch
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const API_URL = 'http://localhost:3000/api';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
    console.error('Missing env vars:', {
        url: !!supabaseUrl,
        anonKey: !!supabaseKey,
        serviceKey: !!serviceRoleKey,
        SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'missing',
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'set' : 'missing'
    });
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
async function verifyApi() {
    console.log('Verifying Custom Label API...');
    // 1. Try to Login as Admin (from env)
    // Common defaults for local dev or configured envs
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
    console.log(`Attempting login as Admin (${adminEmail})...`);
    let session = null;
    let createdUser = null;
    const { data: adminAuth, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
    });
    if (!loginError && adminAuth.session) {
        console.log('Logged in as Admin');
        session = adminAuth.session;
    }
    else {
        console.log('Admin login failed, trying to create temp user...');
        // Fallback to creating user
        const email = `api-test-${Date.now()}@example.com`;
        const password = 'password123';
        const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name: 'Api Tester', role: 'ARTIST' }
        });
        if (createError || !user) {
            console.error('User creation failed:', createError);
            process.exit(1);
        }
        console.log('User created:', user.id);
        createdUser = user;
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (sessionError || !sessionData.session) {
            console.error('Login failed for new user:', sessionError);
            // If login fails despite creation, it's likely confirming issue or server config.
            process.exit(1);
        }
        session = sessionData.session;
    }
    const token = session.access_token;
    console.log('Got auth token');
    // 2. Request a label via API
    const labelName = `API Label ${Date.now()}`;
    console.log(`Requesting label "${labelName}" via POST /api/custom-labels...`);
    const response = await fetch(`${API_URL}/custom-labels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: labelName })
    });
    if (!response.ok) {
        const text = await response.text();
        console.error(`API Request Failed: ${response.status} ${response.statusText}`);
        console.error('Response:', text);
        process.exit(1);
    }
    const data = await response.json();
    console.log('API Request Success:', data);
    if (data.name !== labelName || data.status !== 'PENDING') {
        console.error('Unexpected response data');
        process.exit(1);
    }
    console.log('SUCCESS: API works works correctly.');
    // Cleanup
    if (createdUser) {
        await supabaseAdmin.auth.admin.deleteUser(createdUser.id);
        console.log('Cleanup successful');
    }
}
verifyApi();
