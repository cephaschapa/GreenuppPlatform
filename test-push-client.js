import "dotenv/config";
import {
  initializeFirebase,
  sendPushNotification,
} from "./server/services/firebase.ts";
import { db } from "./server/db.ts";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testClientPushNotification() {
  console.log("🧪 Testing Client Push Notification Integration...\n");

  try {
    // Initialize Firebase
    console.log("1️⃣ Initializing Firebase...");
    initializeFirebase();
    console.log("✅ Firebase initialized");

    // Get cephas@gmail.com user
    console.log("\n2️⃣ Getting test user (cephas@gmail.com)...");
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, "cephas@gmail.com"));

    if (userRows.length === 0) {
      console.log("❌ User cephas@gmail.com not found");
      return;
    }

    const testUser = userRows[0];
    console.log(`✅ Using user: ${testUser.email} (ID: ${testUser.id})`);

    // Check if user has FCM token
    console.log("\n3️⃣ Checking FCM token...");
    if (!testUser.fcmToken) {
      console.log("⚠️  User has no FCM token yet");
      console.log(
        "   This means the client hasn't registered for push notifications yet"
      );
      console.log("\n📋 To get an FCM token:");
      console.log("   1. Open your client app in a browser");
      console.log("   2. Accept notification permission when prompted");
      console.log(
        "   3. Check the PushNotificationDebug component for the FCM token"
      );
      console.log("   4. Run this test again");
      return;
    }

    console.log("✅ User has FCM token - sending test notification...");

    // Send a test notification
    const result = await sendPushNotification(
      testUser.id,
      "🎉 Push Notification Test!",
      "This is a test notification from your Greenupp platform!",
      {
        actionUrl: "https://greenupp.app/dashboard",
        testType: "client-integration-test",
      }
    );

    if (result) {
      console.log("✅ Push notification sent successfully!");
      console.log("\n📱 Check your browser/device for the notification");
      console.log(
        "   If you don't see it, check the browser's notification settings"
      );
    } else {
      console.log("❌ Push notification failed");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the test
testClientPushNotification().catch(console.error);
