import "dotenv/config";
import { db } from "./server/db.ts";
import { sql } from "drizzle-orm";

async function addPhoneMigration() {
  console.log("📱 Adding phone column to users table...\n");

  try {
    // Add phone column to users table
    console.log("1️⃣ Adding phone column to users table...");
    await db.execute(
      sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text`
    );
    console.log("✅ Phone column added successfully");

    // Update cephaschapa@gmail.com with a phone number
    console.log("\n2️⃣ Updating cephaschapa@gmail.com with phone number...");
    const result = await db.execute(
      sql`UPDATE "users" SET "phone" = '+26097XXXXXXX' WHERE "email" = 'cephaschapa@gmail.com'`
    );
    console.log("✅ Phone number updated for cephaschapa@gmail.com");
    console.log("   Note: Replace +26097XXXXXXX with the actual phone number");

    // Enable SMS notifications for this user
    console.log("\n3️⃣ Enabling SMS notifications for cephaschapa@gmail.com...");
    await db.execute(
      sql`UPDATE "notification_settings" SET "sms_enabled" = true WHERE "user_id" = (
        SELECT "id" FROM "users" WHERE "email" = 'cephaschapa@gmail.com'
      )`
    );
    console.log("✅ SMS notifications enabled");

    // Verify the changes
    console.log("\n4️⃣ Verifying changes...");
    const user = await db.execute(
      sql`SELECT "id", "email", "phone" FROM "users" WHERE "email" = 'cephaschapa@gmail.com'`
    );

    if (user.rows.length > 0) {
      console.log("✅ User found:");
      console.log(`   ID: ${user.rows[0].id}`);
      console.log(`   Email: ${user.rows[0].email}`);
      console.log(`   Phone: ${user.rows[0].phone}`);
    }

    const settings = await db.execute(
      sql`SELECT "sms_enabled" FROM "notification_settings" WHERE "user_id" = (
        SELECT "id" FROM "users" WHERE "email" = 'cephaschapa@gmail.com'
      )`
    );

    if (settings.rows.length > 0) {
      console.log(`   SMS Enabled: ${settings.rows[0].sms_enabled}`);
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Replace +26097XXXXXXX with the actual phone number");
    console.log("   2. Test SMS using the web UI at /public-email-test");
    console.log("   3. Or run: npx tsx test-sms-simple.js");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the migration
addPhoneMigration();
