"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Define environment schema with Zod
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    APP_NAME: zod_1.z.string().default('music-distribution'),
    JWT_SECRET: zod_1.z.string().min(10),
    ADMIN_INITIAL_EMAIL: zod_1.z.string().email(),
    ADMIN_INITIAL_NAME: zod_1.z.string(),
    ADMIN_INITIAL_PASSWORD: zod_1.z.string().min(6),
    // Supabase
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_ANON_KEY: zod_1.z.string(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string(),
    // Database
    DATABASE_URL: zod_1.z.string(),
    // EmailJS (optional for email notifications)
    EMAILJS_SERVICE_ID: zod_1.z.string().optional(),
    EMAILJS_TEMPLATE_ID: zod_1.z.string().optional(),
    EMAILJS_PRIVATE_KEY: zod_1.z.string().optional(),
});
// Parse and validate environment variables
exports.env = envSchema.parse(process.env);
// Export validated environment variables
exports.default = exports.env;
