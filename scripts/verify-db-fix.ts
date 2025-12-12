
import { db } from '../src/server/db';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function verifyDbFix() {
    console.log('Verifying db.subLabel.findMany fix...');

    try {
        // 1. Test clean structure (what existing code might accidentally do or what we want to support)
        // Structure: OR: [{ user_id: 'is.null' }, { user_id: 'some-uuid' }]
        const mockUserId = '00000000-0000-0000-0000-000000000000';

        console.log('\nTest 1: With valid UUID');
        await db.subLabel.findMany({
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
        await db.subLabel.findMany({
            where: {
                OR: [
                    { user_id: null }
                ]
            }
        });
        console.log('✓ Test 2 passed');

    } catch (error: any) {
        console.error('\nFAILURE:', error);
        process.exit(1);
    }
}

verifyDbFix();
