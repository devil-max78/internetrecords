"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../supabase");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Login endpoint using Supabase Auth
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase_1.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (authError) {
            console.error('Supabase auth error:', authError);
            return res.status(401).json({ error: authError.message || 'Invalid credentials' });
        }
        if (!authData.user || !authData.session) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        // Get user details from database
        const user = await db_1.db.user.findUnique({ where: { id: authData.user.id } });
        if (!user) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        res.json({
            token: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Signup endpoint using Supabase Auth
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (!['ARTIST', 'LABEL'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        // Check if user already exists in our database
        const existingUser = await db_1.db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        // Sign up with Supabase Auth
        console.log('Attempting signup with:', { email, name, role });
        const { data: authData, error: authError } = await supabase_1.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                },
                emailRedirectTo: undefined, // Disable email confirmation redirect
            },
        });
        if (authError) {
            console.error('Supabase signup error:', {
                message: authError.message,
                status: authError.status,
                code: authError.code,
                details: authError
            });
            return res.status(400).json({ error: authError.message || 'Signup failed' });
        }
        if (!authData.user) {
            return res.status(400).json({ error: 'Failed to create user' });
        }
        // Create user profile in our database
        const user = await db_1.db.user.create({
            data: {
                id: authData.user.id,
                email,
                password: '', // Password is managed by Supabase Auth
                name,
                role,
            },
        });
        // If email confirmation is disabled, we'll have a session
        const token = authData.session?.access_token || '';
        const refreshToken = authData.session?.refresh_token || '';
        res.status(201).json({
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            message: authData.session ? 'Account created successfully' : 'Please check your email to confirm your account',
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
            await supabase_1.supabase.auth.signOut();
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const { data, error } = await supabase_1.supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        if (!data.session) {
            return res.status(401).json({ error: 'Failed to refresh session' });
        }
        res.json({
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get current user endpoint
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const { data: { user: authUser }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !authUser) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const user = await db_1.db.user.findUnique({ where: { id: authUser.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
