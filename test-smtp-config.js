// SMTP Configuration Test Script
// Run this with: node test-smtp-config.js

import dotenv from "dotenv";
dotenv.config();

console.log("🔍 SMTP Configuration Diagnostic\n");

// Check if environment variables are set
const requiredVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
];
let allVarsSet = true;

console.log("📋 Environment Variables:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive information
    if (varName === "SMTP_PASS") {
      console.log(
        `✅ ${varName}: ${value.substring(0, 8)}...${value.substring(
          value.length - 4
        )} (${value.length} chars)`
      );
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allVarsSet = false;
  }
});

console.log("\n🔍 Configuration Analysis:");

// Check SMTP_HOST
const host = process.env.SMTP_HOST;
if (host === "smtp.sendgrid.net") {
  console.log("✅ SMTP_HOST: Correct for SendGrid");
} else if (host === "smtp.gmail.com") {
  console.log("✅ SMTP_HOST: Correct for Gmail");
} else if (host) {
  console.log(`⚠️  SMTP_HOST: Custom host (${host})`);
} else {
  console.log("❌ SMTP_HOST: Not set");
}

// Check SMTP_PORT
const port = process.env.SMTP_PORT;
if (port === "587") {
  console.log("✅ SMTP_PORT: 587 (TLS) - Recommended");
} else if (port === "465") {
  console.log("✅ SMTP_PORT: 465 (SSL) - Alternative");
} else if (port) {
  console.log(`⚠️  SMTP_PORT: ${port} - Make sure this is correct`);
} else {
  console.log("❌ SMTP_PORT: Not set (will default to 587)");
}

// Check SMTP_USER for SendGrid
const user = process.env.SMTP_USER;
if (host === "smtp.sendgrid.net") {
  if (user === "apikey") {
    console.log('✅ SMTP_USER: Correct for SendGrid (must be "apikey")');
  } else {
    console.log('❌ SMTP_USER: For SendGrid, this must be exactly "apikey"');
  }
} else if (host === "smtp.gmail.com") {
  if (user && user.includes("@gmail.com")) {
    console.log("✅ SMTP_USER: Looks like a Gmail address");
  } else {
    console.log("⚠️  SMTP_USER: Should be your Gmail address for Gmail SMTP");
  }
}

// Check SMTP_PASS
const pass = process.env.SMTP_PASS;
if (host === "smtp.sendgrid.net") {
  if (pass && pass.startsWith("SG.")) {
    console.log("✅ SMTP_PASS: Looks like a SendGrid API key");
  } else if (pass) {
    console.log('❌ SMTP_PASS: SendGrid API keys should start with "SG."');
  }
} else if (host === "smtp.gmail.com") {
  if (pass && pass.length === 16 && !pass.includes(" ")) {
    console.log("✅ SMTP_PASS: Looks like a Gmail App Password");
  } else if (pass) {
    console.log(
      "⚠️  SMTP_PASS: Gmail requires App Password (16 chars, no spaces)"
    );
  }
}

// Check SMTP_FROM
const from = process.env.SMTP_FROM;
if (from && from.includes("@")) {
  console.log(`✅ SMTP_FROM: ${from}`);
} else {
  console.log("❌ SMTP_FROM: Should be a valid email address");
}

console.log("\n📝 Recommendations:");

if (!allVarsSet) {
  console.log("❌ Set all required environment variables in your .env file");
}

if (host === "smtp.sendgrid.net" && user !== "apikey") {
  console.log("❌ For SendGrid: Set SMTP_USER=apikey");
}

if (host === "smtp.sendgrid.net" && (!pass || !pass.startsWith("SG."))) {
  console.log("❌ For SendGrid: Get an API key from SendGrid dashboard");
  console.log("   Go to Settings → API Keys → Create API Key");
}

if (host === "smtp.gmail.com" && (!pass || pass.length !== 16)) {
  console.log("❌ For Gmail: Generate an App Password");
  console.log("   Go to Google Account → Security → App Passwords");
}

console.log("\n🧪 Next Steps:");
console.log("1. Fix any issues shown above");
console.log("2. Restart your server");
console.log("3. Test the alert system");
console.log("4. Check server logs for authentication success");

if (
  allVarsSet &&
  ((host === "smtp.sendgrid.net" &&
    user === "apikey" &&
    pass &&
    pass.startsWith("SG.")) ||
    (host === "smtp.gmail.com" &&
      user &&
      user.includes("@gmail.com") &&
      pass &&
      pass.length === 16))
) {
  console.log("\n🎉 Configuration looks good! Try sending a test email.");
} else {
  console.log("\n⚠️  Configuration needs fixes before testing.");
}
