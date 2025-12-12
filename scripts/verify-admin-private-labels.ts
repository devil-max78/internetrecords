
import * as dotenv from 'dotenv';
dotenv.config();
import { db, subLabelOperations } from '../src/server/db';
import { createInitialAdmin } from '../src/server/auth';

async function main() {
    console.log('Starting verification of Admin Private Sub-Labels...');

    // 1. Ensure we have a user to assign to
    const user = await db.user.findFirst({});
    if (!user) {
        console.error('No users found. Cannot verify private label creation.');
        return;
    }
    console.log(`Using user: ${user.email} (${user.id})`);

    // 2. Create a Global Label (using db directly to simulate API behavior logic)
    const globalName = `Test Global Label ${Date.now()}`;
    console.log(`Creating global label: ${globalName}`);
    // Simulate what the route handler does: passing null for userId
    const globalLabel = await subLabelOperations.create({
        name: globalName,
        userId: null
    });
    console.log('Global label created:', globalLabel);

    if (globalLabel.userId) {
        console.error('FAIL: Global label has a userId!');
    } else {
        console.log('PASS: Global label has no userId.');
    }

    // 3. Create a Private Label
    const privateName = `Test Private Label ${Date.now()}`;
    console.log(`Creating private label: ${privateName} for user ${user.id}`);

    // Simulate what the route handler does: passing userId
    const privateLabel = await subLabelOperations.create({
        name: privateName,
        userId: user.id
    });
    console.log('Private label created:', privateLabel);

    if (privateLabel.userId !== user.id) {
        console.error(`FAIL: Private label userId mismatch. Expected ${user.id}, got ${privateLabel.userId}`);
    } else {
        console.log('PASS: Private label has correct userId.');
    }

    // 4. Verify uniqueness constraint (optional but good to know)
    // Theoretically, a global label 'X' and a private label 'X' for user 'Y' might conflict if constraint is just on name.
    // Let's check the DB constraint definition if we can, or just try it.
    // But for now, the primary goal is that we CAN create a private label.

    // Clean up
    console.log('Cleaning up...');
    await subLabelOperations.delete({ id: globalLabel.id });
    await subLabelOperations.delete({ id: privateLabel.id });
    console.log('Cleanup complete.');
}

main()
    .catch(console.error)
    .finally(async () => {
        // Force exit because db connection might hang
        process.exit(0);
    });
