"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../src/server/auth");
const env_1 = __importDefault(require("../src/server/env"));
const supabase_1 = require("../src/server/supabase");
async function main() {
    try {
        // Check if admin already exists
        const { data: adminExists, error: findError } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('role', 'ADMIN')
            .maybeSingle();
        if (findError) {
            throw findError;
        }
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }
        // Create admin user
        const hashedPassword = await (0, auth_1.hashPassword)(env_1.default.ADMIN_INITIAL_PASSWORD);
        const { data: admin, error: createError } = await supabase_1.supabase
            .from('users')
            .insert({
            email: env_1.default.ADMIN_INITIAL_EMAIL,
            name: env_1.default.ADMIN_INITIAL_NAME,
            password: hashedPassword,
            role: 'ADMIN',
        })
            .select()
            .single();
        if (createError) {
            throw createError;
        }
        console.log('Admin user created successfully:', admin.email);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}
main();
