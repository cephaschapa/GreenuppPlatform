import "dotenv/config";
import { db } from "./server/db.ts";
import { users, notificationSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function debugSms() {
  console.log("🔍 Debugging SMS System...\n");

  try {
    // Check if we can connect to the database
    console.log("1️⃣ Testing database connection...");

    // Get all users
    console.log("2️⃣ Getting all users...");
    const allUsers = await db.select().from(users);
    console.log(`✅ Found ${allUsers.length} users in database`);

    if (allUsers.length > 0) {
      console.log("   Sample users:");
      allUsers.slice(0, 3).forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email} (ID: ${user.id}, Phone: ${
            user.phone || "none"
          })`
        );
      });
    }

    // Get all notification settings
    console.log("\n3️⃣ Getting all notification settings...");
    const allSettings = await db.select().from(notificationSettings);
    console.log(`✅ Found ${allSettings.length} notification settings records`);

    if (allSettings.length > 0) {
      console.log("   Sample settings:");
      allSettings.slice(0, 3).forEach((setting, index) => {
        console.log(
          `   ${index + 1}. User ID: ${setting.userId}, SMS: ${
            setting.smsEnabled
          }, Email: ${setting.emailEnabled}`
        );
      });
    }

    // Try the join query step by step
    console.log("\n4️⃣ Testing join query...");

    // First, get users with notification settings
    const usersWithSettings = await db
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        smsEnabled: notificationSettings.smsEnabled,
      })
      .from(users)
      .innerJoin(
        notificationSettings,
        eq(users.id, notificationSettings.userId)
      );

    console.log(
      `✅ Found ${usersWithSettings.length} users with notification settings`
    );

    // Filter for SMS enabled
    const usersWithSms = usersWithSettings.filter(
      (user) => user.smsEnabled === true
    );
    console.log(`✅ Found ${usersWithSms.length} users with SMS enabled`);

    if (usersWithSms.length > 0) {
      console.log("   Users with SMS enabled:");
      usersWithSms.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email} (${user.phone || "no phone"})`
        );
      });
    } else {
      console.log("   ⚠️  No users have SMS enabled");
      console.log("   To enable SMS for testing:");
      console.log("   1. Go to a user's settings page");
      console.log("   2. Enable SMS notifications");
      console.log("   3. Make sure they have a phone number");
    }

    // Test the exact query step by step
    console.log("\n5️⃣ Testing the exact broadcast query...");
    try {
      const broadcastUsers = await db
        .select({
          id: users.id,
          email: users.email,
          phone: users.phone,
          smsEnabled: notificationSettings.smsEnabled,
        })
        .from(users)
        .innerJoin(
          notificationSettings,
          eq(users.id, notificationSettings.userId)
        )
        .where(eq(notificationSettings.smsEnabled, true));

      console.log(
        `✅ Broadcast query successful: ${broadcastUsers.length} users found`
      );
    } catch (error) {
      console.log(`❌ Broadcast query failed: ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    console.log("\n🔧 Common issues:");
    console.log("   1. Database connection problems");
    console.log("   2. Missing environment variables");
    console.log("   3. Schema migration issues");
  } finally {
    process.exit(0);
  }
}

// Run the debug
debugSms();
