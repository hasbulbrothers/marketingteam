import { config } from "dotenv";
config({ path: ".env.local" });
import { createClerkClient } from "@clerk/backend";
import { execFileSync } from "child_process";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function syncAllUsers() {
  const { data: users } = await clerk.users.getUserList({ limit: 100 });
  console.log(`Found ${users.length} users in Clerk\n`);

  for (const user of users) {
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.log(`⏭ Skipping ${user.id} — no email`);
      continue;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "HB Marketing User";
    const args = JSON.stringify({ clerkId: user.id, name, email, avatarUrl: user.imageUrl || undefined });

    try {
      execFileSync("npx", ["convex", "run", "--no-push", "users/mutations:upsertUserFromWebhook", args], { stdio: "pipe" });
      console.log(`✓ Synced: ${name} (${email})`);
    } catch (err) {
      const msg = (err as { stderr?: Buffer }).stderr?.toString() || (err as Error).message;
      console.log(`✗ Failed: ${name} (${email}) —`, msg.trim());
    }
  }

  console.log("\nDone!");
}

syncAllUsers();
