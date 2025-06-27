import "dotenv/config";
import { db } from "./server/db.ts";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updatePhone() {
  console.log("📱 Updating phone number for cephaschapa@gmail.com...\n");

  // Replace this with the actual phone number
  const phoneNumber = "+26097XXXXXXX"; // Replace with real number

  try {
    const result = await db
      .update(users)
      .set({ phone: phoneNumber })
      .where(eq(users.email, "cephaschapa@gmail.com"))
      .returning();

    if (result.length > 0) {
      console.log("✅ Phone number updated successfully!");
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Phone: ${result[0].phone}`);
      console.log("\n🎉 Ready to test SMS!");
      console.log("\n📋 Test options:");
      console.log(
        "   1. Web UI: http://localhost:3001/public-email-test (SMS tab)"
      );
      console.log("   2. API: POST /api/test-sms");
      console.log("   3. Script: npx tsx test-sms-simple.js");
    } else {
      console.log("❌ User not found");
    }
  } catch (error) {
    console.error("❌ Failed to update phone number:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the update
updatePhone();
