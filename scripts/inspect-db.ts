
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
