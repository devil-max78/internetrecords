"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/server/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function verifyDbFix() {
    console.log('Verifying db.subLabel.findMany fix...');
    try {
        // 1. Test clean structure (what existing code might accidentally do or what we want to support)
        // Structure: OR: [{ user_id: 'is.null' }, { user_id: 'some-uuid' }]
        const mockUserId = '00000000-0000-0000-0000-000000000000';
        console.log('\nTest 1: With valid UUID');
        await db_1.db.subLabel.findMany({
            where: {
                OR: [
                    { user_id: null },
                    { user_id: mockUserId }
                ]
            }
        });
        console.log('✓ Test 1 passed (no 22P02 error)');
        // 2. Test with undefined userId (simulating logged out or no user)
        // Structure: OR: [{ user_id: 'is.null' }]
        console.log('\nTest 2: With only global condition');
        await db_1.db.subLabel.findMany({
            where: {
                OR: [
                    { user_id: null }
                ]
            }
        });
        console.log('✓ Test 2 passed');
    }
    catch (error) {
        console.error('\nFAILURE:', error);
        process.exit(1);
    }
}
verifyDbFix();
