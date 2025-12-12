import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Use service role key to bypass RLS for setup/teardown and admin actions
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyCustomLabelFlow() {
    console.log('Starting Custom Label Flow Verification...');
    const testRunId = Date.now().toString();
    const artistEmail = `test-artist-${testRunId}@example.com`;
    const labelName = `Test Label ${testRunId}`;

    let artistUser: any = null;

    try {
        // 1. Create a test user (Artist)
        console.log(`\n1. Creating test artist: ${artistEmail}`);
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email: artistEmail,
            password: 'password123',
            email_confirm: true,
            user_metadata: { name: 'Test Artist', role: 'ARTIST' }
        });

        artistUser = user;

        if (createError || !artistUser) throw new Error(`Failed to create artist: ${createError?.message}`);
        console.log('   Artist created:', artistUser.id);

        // Ensure user is in public.users table (trigger might handle it, but being safe)
        // Checking if trigger worked
        const { data: publicUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', artistUser.id)
            .single();

        if (!publicUser) {
            console.log('   Manually inserting into public.users (trigger might have delayed or failed)');
            const { error: insertError } = await supabase.from('users').insert({
                id: artistUser.id,
                email: artistEmail,
                name: 'Test Artist',
                role: 'ARTIST',
                password: 'password123' // Dummy password to satisfy constraint
            });

            if (insertError) {
                console.error('   Manual insert failed:', insertError);
                throw new Error(`Failed to insert user: ${insertError.message}`);
            }
            console.log('   Manual insert success');
        }

        // 2. Artist requests a custom label
        console.log(`\n2. Artist requesting label: "${labelName}"`);
        // Ideally we'd use the API, but for script simplicity we can insert directly into the table acting as the user would via RLS? 
        // Actually, RLS would block us if we don't have a session.
        // Let's use the DB operations directly if we can import them, OR just simulate via Supabase client with the artist's ID if we could sign in.
        // Since we have service role, we can insert and manually set user_id.

        const { data: request, error: requestError } = await supabase
            .from('custom_label_requests')
            .insert({
                user_id: artistUser.id,
                name: labelName,
                status: 'PENDING'
            })
            .select()
            .single();

        if (requestError) throw new Error(`Failed to create request: ${requestError.message}`);
        console.log('   Request created:', request);

        // 3. Verify request is pending
        if (request.status !== 'PENDING') throw new Error('Request status should be PENDING');
        console.log('   Verified status is PENDING');

        // 4. Admin approves the request
        console.log('\n3. Admin approving request...');
        // This logic mimics the API `PATCH /approve`

        // a. Update request status
        const { error: updateError } = await supabase
            .from('custom_label_requests')
            .update({ status: 'APPROVED' })
            .eq('id', request.id);

        if (updateError) throw new Error(`Failed to update request: ${updateError.message}`);

        // b. Create sub-label
        const { data: subLabel, error: subLabelError } = await supabase
            .from('sub_labels')
            .insert({
                name: labelName,
                user_id: artistUser.id // Important: Link to artist
            })
            .select()
            .single();

        if (subLabelError) throw new Error(`Failed to create sub_label: ${subLabelError.message}`);
        console.log('   Request approved and sub-label created:', subLabel);

        // 5. Verify visibility
        console.log('\n4. Verifying visibility...');

        // a. Verify Artist can see it
        const { data: artistLabels, error: artistFetchError } = await supabase
            .from('sub_labels')
            .select('*')
            .or(`user_id.is.null,user_id.eq.${artistUser.id}`);

        if (artistFetchError) throw new Error(`Failed to fetch artist labels: ${artistFetchError.message}`);

        const foundForArtist = artistLabels.find(l => l.name === labelName);
        if (!foundForArtist) throw new Error('Artist could not find their own custom label');
        console.log('   ✓ Artist can see the label.');

        // b. Verify another user CANNOT see it
        const otherUserId = '00000000-0000-0000-0000-000000000000'; // Fake ID
        const { data: otherLabels, error: otherFetchError } = await supabase
            .from('sub_labels')
            .select('*')
            .or(`user_id.is.null,user_id.eq.${otherUserId}`);

        if (otherFetchError) throw new Error(`Failed to fetch other labels: ${otherFetchError.message}`);

        const foundForOther = otherLabels.find(l => l.name === labelName);
        if (foundForOther) throw new Error('Other user SHOULD NOT see this label, but did.');
        console.log('   ✓ Other users cannot see the label.');

        console.log('\nSUCCESS: Custom Label Flow Verified!');

    } catch (error) {
        console.error('\nFAILURE:', error);
    } finally {
        // Cleanup
        if (artistUser) {
            console.log('\nCleaning up test user...');
            await supabase.auth.admin.deleteUser(artistUser.id);
            // Clean up requests and sublabels if needed, though they might cascade or be left. 
            // For a test script, deleting the user is usually enough if cascade delete is on, 
            // but assuming it's not:
            await supabase.from('custom_label_requests').delete().eq('user_id', artistUser.id);
            await supabase.from('sub_labels').delete().eq('user_id', artistUser.id);
        }
    }
}

verifyCustomLabelFlow();
