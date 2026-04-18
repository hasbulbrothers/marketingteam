import { config } from "dotenv";
config({ path: ".env.local" });
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function check() {
  const { data: users, totalCount } = await clerk.users.getUserList({ limit: 100, orderBy: "-created_at" });
  console.log(`Total users in Clerk: ${totalCount}\n`);

  for (const user of users) {
    const email = user.emailAddresses.map((e) => e.emailAddress).join(", ");
    console.log(`- ${user.id}`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${email}`);
    console.log(`  Created: ${new Date(user.createdAt).toLocaleString()}`);
    console.log(`  Banned: ${user.banned}, Locked: ${user.locked}`);
    console.log();
  }
}

check();
