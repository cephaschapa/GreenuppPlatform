import "dotenv/config";
import { db } from "./server/db.ts";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function registerFcmToken() {
  console.log("🔧 Manually registering FCM token...\n");

  try {
    // Get the user
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length === 0) {
      console.log("❌ No users found");
      return;
    }

    const user = allUsers[0];
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // The FCM token from your browser
    const fcmToken =
      "dxXrE8nqC7hlHzUoKZDjfj:APA91bGBo_lXdkOHIfunVRSK9vmgx0kvm5QUXstVM4EipRuAhT3NjBFUo2FnGz9P8T4yvBkf-AH44EGXtQPnwt16Gf3xWy2r37jUKMRHyLcBaMiagywI4wQ";

    console.log("📝 Registering FCM token in database...");

    // Update the user's FCM token
    await db
      .update(users)
      .set({
        fcmToken,
        fcmTokenUpdatedAt: new Date(),
        pushNotificationsEnabled: true,
      })
      .where(eq(users.id, user.id));

    console.log("✅ FCM token registered successfully!");
    console.log(`   Token: ${fcmToken.substring(0, 20)}...`);

    // Verify the update
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    console.log(
      `   User FCM token: ${updatedUser[0].fcmToken ? "✅ Set" : "❌ Not set"}`
    );
    console.log(
      `   Push notifications enabled: ${updatedUser[0].pushNotificationsEnabled}`
    );
  } catch (error) {
    console.error("❌ Failed to register FCM token:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the registration
registerFcmToken().catch(console.error);
