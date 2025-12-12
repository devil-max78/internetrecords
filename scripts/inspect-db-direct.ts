
import * as dotenv from 'dotenv';
dotenv.config();
import { db } from '../src/server/db';
import { supabase } from '../src/server/supabase';

async function main() {
    console.log('Inspecting sub_labels table definition...');

    // We can't easily get table definition via supabase client, but we can verify insert behavior.
    console.log('Inserting test row directly with Supabase client...');

    const testName = `Test-${Date.now()}`;
    const user = await db.user.findFirst({});

    if (!user) {
        console.error('No user found');
        return;
    }

    console.log(`Using user: ${user.id}`);

    const { data, error } = await supabase
        .from('sub_labels')
        .insert({
            name: testName,
            user_id: user.id
        })
        .select()
        .single();

    if (error) {
        console.error('Error inserting:', error);
    } else {
        console.log('Inserted:', data);
        if (data.user_id !== user.id) {
            console.error('FAIL: user_id mismatch in DB! Got:', data.user_id);
        } else {
            console.log('PASS: user_id persisted correctly.');
        }

        // Cleanup
        await supabase.from('sub_labels').delete().eq('id', data.id);
    }
}

main().catch(console.error);
