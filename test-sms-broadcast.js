import "dotenv/config";
import { db } from "./server/db.ts";
import { users, notificationSettings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendSms } from "./server/services/sms.ts";

async function testSmsBroadcast() {
  console.log("📱 Testing SMS Broadcast System...\n");

  try {
    // Get all users with SMS enabled
    console.log("1️⃣ Getting users with SMS notifications enabled...");
    const usersWithSms = await db
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        firstName: users.firstName,
        lastName: users.lastName,
        smsEnabled: notificationSettings.smsEnabled,
      })
      .from(users)
      .innerJoin(
        notificationSettings,
        eq(users.id, notificationSettings.userId)
      )
      .where(eq(notificationSettings.smsEnabled, true));

    console.log(`✅ Found ${usersWithSms.length} users with SMS enabled`);

    if (usersWithSms.length === 0) {
      console.log("\n⚠️  No users have SMS notifications enabled");
      console.log("   To enable SMS for a user:");
      console.log("   1. Go to the user's settings page");
      console.log("   2. Enable SMS notifications");
      console.log("   3. Make sure they have a phone number");
      console.log("   4. Run this test again");
      return;
    }

    // Display users who will receive SMS
    console.log("\n2️⃣ Users who will receive SMS:");
    usersWithSms.forEach((user, index) => {
      const name =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email;
      console.log(`   ${index + 1}. ${name} (${user.phone})`);
    });

    // Test message
    const testTitle = "🌱 Greenupp Test Alert";
    const testMessage =
      "This is a test SMS from your Greenupp platform! Your SMS notifications are working correctly.";
    const fullMessage = `${testTitle}: ${testMessage}`;

    console.log(`\n3️⃣ Broadcasting SMS message:`);
    console.log(`   Title: ${testTitle}`);
    console.log(`   Message: ${testMessage}`);

    // Send SMS to each user
    console.log("\n4️⃣ Sending SMS messages...");
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const user of usersWithSms) {
      try {
        if (user.phone) {
          const formattedPhone = user.phone.startsWith("+")
            ? user.phone
            : `+${user.phone}`;
          console.log(`   📤 Sending to ${user.email} (${formattedPhone})...`);

          const result = await sendSms(formattedPhone, fullMessage);

          if (result) {
            sent++;
            console.log(`   ✅ Sent successfully (SID: ${result.sid})`);
            results.push({
              userId: user.id,
              email: user.email,
              phone: formattedPhone,
              status: "sent",
              sid: result.sid,
            });
          } else {
            failed++;
            console.log(`   ❌ Failed to send`);
            results.push({
              userId: user.id,
              email: user.email,
              phone: formattedPhone,
              status: "failed",
              error: "SMS service returned false",
            });
          }
        } else {
          failed++;
          console.log(`   ❌ No phone number for ${user.email}`);
          results.push({
            userId: user.id,
            email: user.email,
            phone: null,
            status: "failed",
            error: "No phone number",
          });
        }
      } catch (error) {
        failed++;
        console.log(`   ❌ Error sending to ${user.email}: ${error.message}`);
        results.push({
          userId: user.id,
          email: user.email,
          phone: user.phone,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Summary
    console.log("\n🎉 SMS Broadcast Test Completed!");
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully sent: ${sent}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📱 Total users with SMS enabled: ${usersWithSms.length}`);

    if (sent > 0) {
      console.log(`\n✅ SMS broadcast working correctly!`);
      console.log(`   Check your phone(s) for the test message`);
    }

    if (failed > 0) {
      console.log(`\n⚠️  Some SMS failed to send:`);
      results
        .filter((r) => r.status === "failed")
        .forEach((result) => {
          console.log(`   - ${result.email}: ${result.error}`);
        });
    }

    console.log(`\n🔧 To test via API:`);
    console.log(`   curl -X POST http://localhost:5000/api/broadcast-sms \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"title": "Test Alert", "message": "Test message"}'`);
  } catch (error) {
    console.error("❌ SMS broadcast test failed:", error.message);
    console.log("\n🔧 Common issues:");
    console.log(
      "   1. Check Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)"
    );
    console.log("   2. Verify TWILIO_PHONE_NUMBER is set");
    console.log("   3. Ensure database connection is working");
    console.log("   4. Check if users have valid phone numbers");
  } finally {
    process.exit(0);
  }
}

// Run the test
testSmsBroadcast();
