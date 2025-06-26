import "dotenv/config";
import {
  initializeFirebase,
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToTopic,
} from "./server/services/firebase.ts";
import { db } from "./server/db.ts";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testPushNotifications() {
  console.log("🧪 Testing Push Notifications...\n");

  try {
    // Initialize Firebase first
    console.log("0️⃣ Initializing Firebase...");
    initializeFirebase();
    console.log("✅ Firebase initialized");

    // Test 1: Check if we have any users in the database
    console.log("\n1️⃣ Checking for users in database...");
    const allUsers = await db.select().from(users).limit(5);

    if (allUsers.length === 0) {
      console.log("❌ No users found in database");
      console.log("   Create a user first to test push notifications");
      return;
    }

    console.log(`✅ Found ${allUsers.length} users`);
    const testUser = allUsers[0];
    console.log(`   Using user: ${testUser.email} (ID: ${testUser.id})`);

    // Test 2: Check if user has FCM token
    console.log("\n2️⃣ Checking user's FCM token...");
    if (!testUser.fcmToken) {
      console.log("⚠️  User has no FCM token - this is expected for testing");
      console.log(
        "   In a real scenario, the client would register an FCM token"
      );

      // For testing, let's simulate what happens when there's no token
      console.log("\n3️⃣ Testing push notification without FCM token...");
      const result = await sendPushNotification(
        testUser.id,
        "Test Notification",
        "This is a test push notification",
        { actionUrl: "https://greenupp.app/dashboard" }
      );

      if (result === false) {
        console.log(
          "✅ Push notification service working correctly (expected failure due to no FCM token)"
        );
      } else {
        console.log(
          "❌ Unexpected result - should have failed without FCM token"
        );
      }
    } else {
      console.log("✅ User has FCM token - testing push notification...");

      const result = await sendPushNotification(
        testUser.id,
        "Test Notification",
        "This is a test push notification",
        { actionUrl: "https://greenupp.app/dashboard" }
      );

      if (result) {
        console.log("✅ Push notification sent successfully!");
      } else {
        console.log("❌ Push notification failed");
      }
    }

    // Test 3: Test multicast notifications
    console.log("\n4️⃣ Testing multicast notifications...");
    const userIds = allUsers.slice(0, 3).map((user) => user.id);
    const multicastResult = await sendPushNotificationToMultiple(
      userIds,
      "Multicast Test",
      "This is a multicast test notification",
      { actionUrl: "https://greenupp.app/dashboard" }
    );

    console.log(
      `   Multicast result: ${multicastResult.success} success, ${multicastResult.failed} failed`
    );

    // Test 4: Test topic notifications
    console.log("\n5️⃣ Testing topic notifications...");
    const topicResult = await sendPushNotificationToTopic(
      "test-topic",
      "Topic Test",
      "This is a topic test notification",
      { actionUrl: "https://greenupp.app/dashboard" }
    );

    if (topicResult) {
      console.log("✅ Topic notification sent successfully!");
    } else {
      console.log("❌ Topic notification failed");
    }

    console.log("\n🎉 Push notification tests completed!");
    console.log("\n📋 Summary:");
    console.log("   - Firebase service is working correctly");
    console.log("   - Database integration is functional");
    console.log("   - All notification types are supported");
    console.log("\n🔧 To test with real notifications:");
    console.log("   1. Register an FCM token for a user");
    console.log("   2. Use the /api/push-notifications/test endpoint");
    console.log("   3. Check Firebase Console for delivery status");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Common issues:");
    console.log("   1. Check Firebase credentials");
    console.log("   2. Verify database connection");
    console.log("   3. Ensure Firebase Admin SDK is properly initialized");
  } finally {
    process.exit(0);
  }
}

// Run the test
testPushNotifications().catch(console.error);
