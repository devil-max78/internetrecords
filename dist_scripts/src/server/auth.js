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
exports.createInitialAdmin = exports.comparePassword = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./db");
const env_1 = __importDefault(require("./env"));
// Generate JWT token
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    }, env_1.default.JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
// Verify JWT token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// Hash password
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
// Compare password
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
// Create initial admin user using Supabase Auth
const createInitialAdmin = async () => {
    try {
        const { supabase } = await Promise.resolve().then(() => __importStar(require('./supabase')));
        // Check if admin already exists in database
        const adminExists = await db_1.db.user.findFirst({
            where: { role: 'ADMIN' },
        });
        if (!adminExists) {
            console.log('Creating initial admin user...');
            // Create admin user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: env_1.default.ADMIN_INITIAL_EMAIL,
                password: env_1.default.ADMIN_INITIAL_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: env_1.default.ADMIN_INITIAL_NAME,
                    role: 'ADMIN',
                },
            });
            if (authError) {
                console.error('Error creating admin in Supabase Auth:', authError);
                // If user already exists in auth, try to find them
                const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
                if (!listError && users) {
                    const existingAuthUser = users.find(u => u.email === env_1.default.ADMIN_INITIAL_EMAIL);
                    if (existingAuthUser) {
                        // Create profile in database
                        await db_1.db.user.create({
                            data: {
                                id: existingAuthUser.id,
                                email: env_1.default.ADMIN_INITIAL_EMAIL,
                                name: env_1.default.ADMIN_INITIAL_NAME,
                                password: '',
                                role: 'ADMIN',
                            },
                        });
                        console.log('Admin user profile created in database');
                        return;
                    }
                }
                throw authError;
            }
            if (!authData.user) {
                throw new Error('Failed to create admin user');
            }
            // Create admin profile in database
            await db_1.db.user.create({
                data: {
                    id: authData.user.id,
                    email: env_1.default.ADMIN_INITIAL_EMAIL,
                    name: env_1.default.ADMIN_INITIAL_NAME,
                    password: '', // Password is managed by Supabase Auth
                    role: 'ADMIN',
                },
            });
            console.log('Initial admin user created successfully');
        }
        else {
            console.log('Admin user already exists');
        }
    }
    catch (error) {
        console.error('Error creating initial admin user:', error);
        // Don't throw - allow server to start even if admin creation fails
        console.warn('Server will continue without initial admin. You can create one manually.');
    }
};
exports.createInitialAdmin = createInitialAdmin;
