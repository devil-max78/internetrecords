
import * as dotenv from 'dotenv';
dotenv.config();
import { db, subLabelOperations } from '../src/server/db';

async function main() {
    console.log('Starting label leak reproduction...');

    // 1. Create two test users (if not exist, or just use findFirst and create one more)
    // For simplicity, let's just assume we have users or create dummies.
    // Actually, we can just simulate the query logic directly via subLabelOperations.findMany
    // because that's what the route uses.

    // Fetch real users
    const users = await db.user.findMany();
    if (users.length < 2) {
        console.error('Need at least 2 users to test leak.');
        return;
    }
    const userA_Id = users[0].id;
    const userB_Id = users[1].id;
    console.log(`Testing with User A: ${userA_Id}, User B: ${userB_Id}`);

    // 2. Create a Private Label for User A
    const privateLabelName = `Private Label A ${Date.now()}`;
    console.log(`Creating private label for User A: ${privateLabelName}`);

    // We need to actually insert into DB to test DB logic
    const createdLabel = await subLabelOperations.create({
        name: privateLabelName,
        userId: userA_Id
    });
    console.log('Created label:', createdLabel);

    // 3. Simulate User B fetching labels
    // The route does:
    /*
      const subLabels = await db.subLabel.findMany({
        where: {
          OR: [
            { user_id: null },
            { user_id: userB_Id }
          ]
        }
      });
    */

    console.log('Fetching labels as User B...');
    const labelsForB = await subLabelOperations.findMany({
        where: {
            OR: [
                { user_id: null },
                { user_id: userB_Id }
            ]
        }
    });

    // 4. Check if User B sees User A's label
    const leakedLabel = labelsForB.find((l: any) => l.id === createdLabel.id);

    const fs = require('fs');
    if (leakedLabel) {
        const msg = 'FAIL: User B can see User A\'s private label!';
        console.error(msg);
        console.error('Leaked label:', leakedLabel);
        fs.writeFileSync('leak-test.txt', msg + '\n' + JSON.stringify(leakedLabel));
    } else {
        const msg = 'PASS: User B cannot see User A\'s private label.';
        console.log(msg);
        fs.writeFileSync('leak-test.txt', msg);
    }

    // Cleanup
    await subLabelOperations.delete({ id: createdLabel.id });
}

main()
    .catch(error => {
        console.error(error);
        require('fs').writeFileSync('leak-test.txt', 'ERROR: ' + error.message);
    })
    .finally(() => process.exit(0));
