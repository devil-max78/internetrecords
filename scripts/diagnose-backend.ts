
import { db } from '../src/server/db';
import { env } from '../src/server/env';
import dotenv from 'dotenv';
dotenv.config();

async function diagnose() {
    console.log('--- Environment Diagnosis ---');
    console.log('SUPABASE_URL:', env.SUPABASE_URL ? 'Present' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? 'Present (Length: ' + env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

    console.log('\n--- Database Content Diagnosis ---');
    try {
        // Direct DB query via the same mechanism the server uses
        console.log('Querying custom_label_requests...');
        const allRequests = await db.customLabelRequest.findMany({});
        console.log(`Found ${allRequests.length} total requests.`);

        if (allRequests.length > 0) {
            console.log('First 5 requests:', JSON.stringify(allRequests.slice(0, 5), null, 2));
        } else {
            console.log('Table is empty.');
        }

        // Check users table to ensure users exist
        const users = await db.user.findMany({});
        console.log(`Found ${users.length} users.`);

    } catch (error) {
        console.error('Database diagnosis failed:', error);
    }
}

diagnose();
