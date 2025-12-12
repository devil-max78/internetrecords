
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Environment Diagnosis ---');
console.log('SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Present (Length: ' + supabaseServiceRoleKey.length + ')' : 'Missing');

async function diagnose() {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('Cannot proceed without credentials.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('\n--- Database Content Diagnosis ---');
    try {
        // Check requests
        console.log('Querying custom_label_requests...');
        const { data: requests, error } = await supabase
            .from('custom_label_requests')
            .select('*');

        if (error) throw error;

        console.log(`Found ${requests.length} total requests.`);
        if (requests.length > 0) {
            console.log('First 5 requests:', JSON.stringify(requests.slice(0, 5), null, 2));
        } else {
            console.log('Table is empty.');
        }

        // Check users
        const { count: userCount, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;
        console.log(`Found ${userCount} users.`);

    } catch (error) {
        console.error('Database diagnosis failed:', error);
    }
}

diagnose();
