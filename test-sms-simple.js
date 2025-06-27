import "dotenv/config";
import { db } from "./server/db.ts";
import { users, notificationSettings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendSms } from "./server/services/sms.ts";

const user1 = {
  email: "cephaschapa@gmail.com",
  phone: "+260975808750",
};

async function testSmsSimple() {
  console.log("📱 Simple SMS Test...\n");

  try {
    // Get the first user
    console.log("1️⃣ Getting a test user...");
    const [testUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user1.email));

    console.log("testUser", testUser);

    if (!testUser) {
      console.log("❌ No users found in database");
      return;
    }

    console.log(`✅ Using user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`   Phone: ${testUser.phone || "none"}`);

    // Check if user has notification settings
    console.log("\n2️⃣ Checking notification settings...");
    const [existingSettings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, testUser.id));

    if (existingSettings) {
      console.log("✅ User has notification settings");
      console.log(`   SMS enabled: ${existingSettings.smsEnabled}`);

      // Enable SMS if not already enabled
      if (!existingSettings.smsEnabled) {
        console.log("   Enabling SMS notifications...");
        await db
          .update(notificationSettings)
          .set({ smsEnabled: true })
          .where(eq(notificationSettings.userId, testUser.id));
        console.log("   ✅ SMS notifications enabled");
      }
    } else {
      console.log("⚠️  User has no notification settings, creating...");
      await db.insert(notificationSettings).values({
        userId: testUser.id,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: true, // Enable SMS for testing
        weatherAlerts: true,
        taskReminders: true,
        marketPriceAlerts: false,
        systemNotifications: true,
        messageNotifications: true,
        socialLikes: true,
        socialComments: true,
        socialFollows: true,
        socialMentions: true,
        socialSaves: true,
        emailFrequency: "instant",
      });
      console.log("   ✅ Notification settings created with SMS enabled");
    }

    // Test SMS sending
    console.log("\n3️⃣ Testing SMS sending...");

    if (!testUser.phone) {
      console.log("⚠️  User has no phone number");
      console.log(
        "   To test SMS, add a phone number to the user in the database"
      );
      console.log(
        "   Example: UPDATE users SET phone = '+1234567890' WHERE id = " +
          testUser.id
      );
      return;
    }

    const testMessage =
      "🌱 Test SMS from Greenupp platform! Your SMS notifications are working correctly.";
    const formattedPhone = testUser.phone.startsWith("+")
      ? testUser.phone
      : `+${testUser.phone}`;

    console.log(`   📤 Sending to ${formattedPhone}...`);

    try {
      const result = await sendSms(formattedPhone, testMessage);

      if (result) {
        console.log("   ✅ SMS sent successfully!");
        console.log(`   SID: ${result.sid}`);
        console.log("\n🎉 SMS test completed successfully!");
        console.log("   Check your phone for the test message");
      } else {
        console.log("   ❌ SMS service returned false");
      }
    } catch (error) {
      console.log(`   ❌ SMS sending failed: ${error.message}`);
      console.log("\n🔧 Common issues:");
      console.log(
        "   1. Check Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)"
      );
      console.log("   2. Verify TWILIO_PHONE_NUMBER is set");
      console.log("   3. Ensure phone number is in correct format");
    }
  } catch (error) {
    console.error("❌ SMS test failed:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the test
testSmsSimple();
