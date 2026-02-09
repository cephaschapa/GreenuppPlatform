/**
 * Test the email service (SMTP).
 * Loads .env from platform root, then sends a test email.
 *
 * Usage (from platform/):
 *   npx tsx scripts/test-email.ts
 *   npx tsx scripts/test-email.ts your-email@example.com
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure .env is loaded from platform root
import { config } from "dotenv";
config({ path: path.resolve(__dirname, "..", ".env") });

async function main() {
  const to = process.argv[2] || process.env.SMTP_USER || "test@example.com";

  console.log("\n--- Email service test ---");
  console.log("SMTP_HOST:", process.env.SMTP_HOST ? process.env.SMTP_HOST : "(not set, will use default if applicable)");
  console.log("SMTP_PORT:", process.env.SMTP_PORT || "587");
  console.log("SMTP_USER:", process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***` : "(not set)");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***" : "(not set)");
  console.log("SMTP_FROM:", process.env.SMTP_FROM || "(not set)");
  console.log("Send test email to:", to);
  console.log("");

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP_USER and SMTP_PASS are required to send real email. Skipping send.");
    console.log("Set them in .env (and SMTP_HOST=smtp.gmail.com for Gmail) then run again.");
    process.exit(0);
  }

  const { testEmail } = await import("../server/services/email.js");

  const timeoutMs = 20000;
  const result = await Promise.race([
    testEmail(to),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`SMTP timeout after ${timeoutMs / 1000}s`)), timeoutMs)
    ),
  ]).catch((err) => ({ success: false as const, error: err.message }));

  if (result.success) {
    console.log("Result: SUCCESS");
    if (result.error) console.log("Note:", result.error);
  } else {
    console.log("Result: FAILED");
    console.log("Error:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
