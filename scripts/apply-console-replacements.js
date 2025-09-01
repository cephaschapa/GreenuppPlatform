#!/usr/bin/env node

/**
 * Auto-generated console.log replacement script
 * Generated on: 2025-08-17T16:52:41.438Z
 * 
 * This script will replace console statements with proper logger calls.
 * Review before running!
 */

import { readFile, writeFile } from 'fs/promises';

const replacements = [
  {
    file: "verify-env.js",
    line: 3,
    original: "console.log(\"🔍 Verifying Firebase Environment Variables...\\n\");",
    replacement: "logger.info(\"🔍 Verifying Firebase Environment Variables...\\n\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 9,
    original: "console.log(\"✅ Running in Vite environment\");",
    replacement: "logger.info(\"✅ Running in Vite environment\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 10,
    original: "console.log(\"📋 Firebase Config Variables:\");",
    replacement: "logger.info(\"📋 Firebase Config Variables:\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 11,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 16,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 21,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 26,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 31,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 38,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 43,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 48,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 54,
    original: "console.log(\"⚠️  Not running in Vite environment\");",
    replacement: "logger.info(\"⚠️  Not running in Vite environment\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 55,
    original: "console.log(\"📋 Node.js Environment Variables:\");",
    replacement: "logger.info(\"📋 Node.js Environment Variables:\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 56,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 59,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 64,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 69,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 74,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 79,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 82,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 87,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 94,
    original: "console.log(\"\\n🎯 To test in the browser:\");",
    replacement: "logger.info(\"\\n🎯 To test in the browser:\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 95,
    original: "console.log(\"1. Open your client app\");",
    replacement: "logger.info(\"1. Open your client app\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 96,
    original: "console.log(\"2. Open browser dev tools\");",
    replacement: "logger.info(\"2. Open browser dev tools\");",
    category: "DEVELOPMENT"
  },
  {
    file: "verify-env.js",
    line: 97,
    original: "console.log(\"3. Check console for any Firebase errors\");",
    replacement: "logger.info(\"3. Check console for any Firebase errors\");",
    category: "INFO"
  },
  {
    file: "verify-env.js",
    line: 98,
    original: "console.log(\"4. Look for the PushNotificationDebug component\");",
    replacement: "logger.debug(\"4. Look for the PushNotificationDebug component\");",
    category: "DEBUG"
  },
  {
    file: "update-phone.js",
    line: 7,
    original: "console.log(\"📱 Updating phone number for cephaschapa@gmail.com...\\n\");",
    replacement: "logger.info(\"📱 Updating phone number for cephaschapa@gmail.com...\\n\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 20,
    original: "console.log(\"✅ Phone number updated successfully!\");",
    replacement: "logger.info(\"✅ Phone number updated successfully!\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 21,
    original: "console.log(`   Email: ${result[0].email}`);",
    replacement: "logger.info(`   Email: ${result[0].email}`);",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 22,
    original: "console.log(`   Phone: ${result[0].phone}`);",
    replacement: "logger.info(`   Phone: ${result[0].phone}`);",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 23,
    original: "console.log(\"\\n🎉 Ready to test SMS!\");",
    replacement: "logger.info(\"\\n🎉 Ready to test SMS!\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 24,
    original: "console.log(\"\\n📋 Test options:\");",
    replacement: "logger.info(\"\\n📋 Test options:\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 25,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 28,
    original: "console.log(\"   2. API: POST /api/test-sms\");",
    replacement: "logger.info(\"   2. API: POST /api/test-sms\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 29,
    original: "console.log(\"   3. Script: npx tsx test-sms-simple.js\");",
    replacement: "logger.info(\"   3. Script: npx tsx test-sms-simple.js\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 31,
    original: "console.log(\"❌ User not found\");",
    replacement: "logger.info(\"❌ User not found\");",
    category: "INFO"
  },
  {
    file: "update-phone.js",
    line: 34,
    original: "console.error(\"❌ Failed to update phone number:\", error.message);",
    replacement: "logger.error(\"❌ Failed to update phone number:\", error.message);",
    category: "ERROR"
  },
  {
    file: "test-smtp-config.js",
    line: 7,
    original: "console.log(\"🔍 SMTP Configuration Diagnostic\\n\");",
    replacement: "logger.info(\"🔍 SMTP Configuration Diagnostic\\n\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 19,
    original: "console.log(\"📋 Environment Variables:\");",
    replacement: "logger.info(\"📋 Environment Variables:\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 25,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 31,
    original: "console.log(`✅ ${varName}: ${value}`);",
    replacement: "logger.info(`✅ ${varName}: ${value}`);",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 34,
    original: "console.log(`❌ ${varName}: NOT SET`);",
    replacement: "logger.info(`❌ ${varName}: NOT SET`);",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 39,
    original: "console.log(\"\\n🔍 Configuration Analysis:\");",
    replacement: "logger.info(\"\\n🔍 Configuration Analysis:\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 44,
    original: "console.log(\"✅ SMTP_HOST: Correct for SendGrid\");",
    replacement: "logger.info(\"✅ SMTP_HOST: Correct for SendGrid\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 46,
    original: "console.log(\"✅ SMTP_HOST: Correct for Gmail\");",
    replacement: "logger.info(\"✅ SMTP_HOST: Correct for Gmail\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 48,
    original: "console.log(`⚠️  SMTP_HOST: Custom host (${host})`);",
    replacement: "logger.info(`⚠️  SMTP_HOST: Custom host (${host})`);",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 50,
    original: "console.log(\"❌ SMTP_HOST: Not set\");",
    replacement: "logger.info(\"❌ SMTP_HOST: Not set\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 56,
    original: "console.log(\"✅ SMTP_PORT: 587 (TLS) - Recommended\");",
    replacement: "logger.info(\"✅ SMTP_PORT: 587 (TLS) - Recommended\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 58,
    original: "console.log(\"✅ SMTP_PORT: 465 (SSL) - Alternative\");",
    replacement: "logger.info(\"✅ SMTP_PORT: 465 (SSL) - Alternative\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 60,
    original: "console.log(`⚠️  SMTP_PORT: ${port} - Make sure this is correct`);",
    replacement: "logger.info(`⚠️  SMTP_PORT: ${port} - Make sure this is correct`);",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 62,
    original: "console.log(\"❌ SMTP_PORT: Not set (will default to 587)\");",
    replacement: "logger.info(\"❌ SMTP_PORT: Not set (will default to 587)\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 69,
    original: "console.log('✅ SMTP_USER: Correct for SendGrid (must be \"apikey\")');",
    replacement: "logger.info('✅ SMTP_USER: Correct for SendGrid (must be \"apikey\")');",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 71,
    original: "console.log('❌ SMTP_USER: For SendGrid, this must be exactly \"apikey\"');",
    replacement: "logger.info('❌ SMTP_USER: For SendGrid, this must be exactly \"apikey\"');",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 75,
    original: "console.log(\"✅ SMTP_USER: Looks like a Gmail address\");",
    replacement: "logger.info(\"✅ SMTP_USER: Looks like a Gmail address\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 77,
    original: "console.log(\"⚠️  SMTP_USER: Should be your Gmail address for Gmail SMTP\");",
    replacement: "logger.info(\"⚠️  SMTP_USER: Should be your Gmail address for Gmail SMTP\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 85,
    original: "console.log(\"✅ SMTP_PASS: Looks like a SendGrid API key\");",
    replacement: "logger.info(\"✅ SMTP_PASS: Looks like a SendGrid API key\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 87,
    original: "console.log('❌ SMTP_PASS: SendGrid API keys should start with \"SG.\"');",
    replacement: "logger.info('❌ SMTP_PASS: SendGrid API keys should start with \"SG.\"');",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 91,
    original: "console.log(\"✅ SMTP_PASS: Looks like a Gmail App Password\");",
    replacement: "logger.info(\"✅ SMTP_PASS: Looks like a Gmail App Password\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 93,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 102,
    original: "console.log(`✅ SMTP_FROM: ${from}`);",
    replacement: "logger.info(`✅ SMTP_FROM: ${from}`);",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 104,
    original: "console.log(\"❌ SMTP_FROM: Should be a valid email address\");",
    replacement: "logger.info(\"❌ SMTP_FROM: Should be a valid email address\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 107,
    original: "console.log(\"\\n📝 Recommendations:\");",
    replacement: "logger.info(\"\\n📝 Recommendations:\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 110,
    original: "console.log(\"❌ Set all required environment variables in your .env file\");",
    replacement: "logger.info(\"❌ Set all required environment variables in your .env file\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 114,
    original: "console.log(\"❌ For SendGrid: Set SMTP_USER=apikey\");",
    replacement: "logger.info(\"❌ For SendGrid: Set SMTP_USER=apikey\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 118,
    original: "console.log(\"❌ For SendGrid: Get an API key from SendGrid dashboard\");",
    replacement: "logger.info(\"❌ For SendGrid: Get an API key from SendGrid dashboard\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 119,
    original: "console.log(\"   Go to Settings → API Keys → Create API Key\");",
    replacement: "logger.info(\"   Go to Settings → API Keys → Create API Key\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 123,
    original: "console.log(\"❌ For Gmail: Generate an App Password\");",
    replacement: "logger.info(\"❌ For Gmail: Generate an App Password\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 124,
    original: "console.log(\"   Go to Google Account → Security → App Passwords\");",
    replacement: "logger.info(\"   Go to Google Account → Security → App Passwords\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 127,
    original: "console.log(\"\\n🧪 Next Steps:\");",
    replacement: "logger.info(\"\\n🧪 Next Steps:\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 128,
    original: "console.log(\"1. Fix any issues shown above\");",
    replacement: "logger.info(\"1. Fix any issues shown above\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 129,
    original: "console.log(\"2. Restart your server\");",
    replacement: "logger.info(\"2. Restart your server\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 130,
    original: "console.log(\"3. Test the alert system\");",
    replacement: "logger.info(\"3. Test the alert system\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 131,
    original: "console.log(\"4. Check server logs for authentication success\");",
    replacement: "logger.info(\"4. Check server logs for authentication success\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 145,
    original: "console.log(\"\\n🎉 Configuration looks good! Try sending a test email.\");",
    replacement: "logger.info(\"\\n🎉 Configuration looks good! Try sending a test email.\");",
    category: "INFO"
  },
  {
    file: "test-smtp-config.js",
    line: 147,
    original: "console.log(\"\\n⚠️  Configuration needs fixes before testing.\");",
    replacement: "logger.info(\"\\n⚠️  Configuration needs fixes before testing.\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 5,
    original: "console.log(\"=== Testing AI Treatment Generation ===\");",
    replacement: "logger.info(\"=== Testing AI Treatment Generation ===\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 35,
    original: "console.log(`Status: ${res.statusCode}`);",
    replacement: "logger.info(`Status: ${res.statusCode}`);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 36,
    original: "console.log(`Headers:`, res.headers);",
    replacement: "logger.info(`Headers:`, res.headers);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 41,
    original: "console.log(\"✅ AI treatment generation test passed!\");",
    replacement: "logger.info(\"✅ AI treatment generation test passed!\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 42,
    original: "console.log(`Generated plan: ${response.title}`);",
    replacement: "logger.info(`Generated plan: ${response.title}`);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 43,
    original: "console.log(`AI Generated: ${response.aiGenerated}`);",
    replacement: "logger.info(`AI Generated: ${response.aiGenerated}`);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 44,
    original: "console.log(`Steps: ${response.steps?.length || 0}`);",
    replacement: "logger.info(`Steps: ${response.steps?.length || 0}`);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 47,
    original: "console.log(\"🎉 AI generation was successful!\");",
    replacement: "logger.info(\"🎉 AI generation was successful!\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 49,
    original: "console.log(\"AI Recommendations:\", response.recommendations);",
    replacement: "logger.info(\"AI Recommendations:\", response.recommendations);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 52,
    original: "console.log(\"AI Warnings:\", response.warnings);",
    replacement: "logger.info(\"AI Warnings:\", response.warnings);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 55,
    original: "console.log(\"⚠️ AI generation failed, fell back to rule-based\");",
    replacement: "logger.info(\"⚠️ AI generation failed, fell back to rule-based\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 60,
    original: "console.error(\"❌ Error parsing response:\", error);",
    replacement: "logger.error(\"❌ Error parsing response:\", error);",
    category: "ERROR"
  },
  {
    file: "test-ai-treatment.js",
    line: 61,
    original: "console.log(\"Raw response:\", data);",
    replacement: "logger.info(\"Raw response:\", data);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 65,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "test-ai-treatment.js",
    line: 70,
    original: "console.log(\"ℹ️ Treatment plan already exists for this analysis\");",
    replacement: "logger.info(\"ℹ️ Treatment plan already exists for this analysis\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 73,
    original: "console.error(`❌ API test failed with status ${res.statusCode}`);",
    replacement: "logger.error(`❌ API test failed with status ${res.statusCode}`);",
    category: "ERROR"
  },
  {
    file: "test-ai-treatment.js",
    line: 74,
    original: "console.log(\"Response:\", data);",
    replacement: "logger.info(\"Response:\", data);",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 81,
    original: "console.error(\"❌ Request failed:\", error.message);",
    replacement: "logger.error(\"❌ Request failed:\", error.message);",
    category: "ERROR"
  },
  {
    file: "test-ai-treatment.js",
    line: 82,
    original: "console.log(\"Make sure the server is running on localhost:3000\");",
    replacement: "logger.info(\"Make sure the server is running on localhost:3000\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 87,
    original: "console.error(\"❌ Request timed out (30s)\");",
    replacement: "logger.error(\"❌ Request timed out (30s)\");",
    category: "ERROR"
  },
  {
    file: "test-ai-treatment.js",
    line: 100,
    original: "console.log(\"\\n🎉 AI treatment generation test completed!\");",
    replacement: "logger.info(\"\\n🎉 AI treatment generation test completed!\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 104,
    original: "console.error(\"\\n💥 AI treatment generation test failed:\", error.message);",
    replacement: "logger.error(\"\\n💥 AI treatment generation test failed:\", error.message);",
    category: "ERROR"
  },
  {
    file: "test-ai-treatment.js",
    line: 107,
    original: "console.log(\"\\n🔧 To fix this issue:\");",
    replacement: "logger.info(\"\\n🔧 To fix this issue:\");",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 108,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 111,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "test-ai-treatment.js",
    line: 114,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 7,
    original: "console.log(\"🔧 Manually registering FCM token...\\n\");",
    replacement: "logger.info(\"🔧 Manually registering FCM token...\\n\");",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 13,
    original: "console.log(\"❌ No users found\");",
    replacement: "logger.info(\"❌ No users found\");",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 18,
    original: "console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);",
    replacement: "logger.info(`✅ Found user: ${user.email} (ID: ${user.id})`);",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 24,
    original: "console.log(\"📝 Registering FCM token in database...\");",
    replacement: "logger.info(\"📝 Registering FCM token in database...\");",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 36,
    original: "console.log(\"✅ FCM token registered successfully!\");",
    replacement: "logger.info(\"✅ FCM token registered successfully!\");",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 37,
    original: "console.log(`   Token: ${fcmToken.substring(0, 20)}...`);",
    replacement: "logger.info(`   Token: ${fcmToken.substring(0, 20)}...`);",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 44,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 47,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "register-fcm-token.js",
    line: 51,
    original: "console.error(\"❌ Failed to register FCM token:\", error.message);",
    replacement: "logger.error(\"❌ Failed to register FCM token:\", error.message);",
    category: "ERROR"
  },
  {
    file: "register-fcm-token.js",
    line: 58,
    original: "registerFcmToken().catch(console.error);",
    replacement: "registerFcmToken().catch(logger.error);",
    category: "ERROR"
  },
  {
    file: "create-admin-user.js",
    line: 12,
    original: "console.log(`🔍 Checking if user already exists: ${email}`);",
    replacement: "logger.info(`🔍 Checking if user already exists: ${email}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 18,
    original: "console.log(\"✅ User already exists, updating to admin role...\");",
    replacement: "logger.info(\"✅ User already exists, updating to admin role...\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 21,
    original: "console.log(\"ℹ️  User is already an admin\");",
    replacement: "logger.info(\"ℹ️  User is already an admin\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 22,
    original: "console.log(\"\\n🎉 You can now access the admin dashboard at:\");",
    replacement: "logger.info(\"\\n🎉 You can now access the admin dashboard at:\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 23,
    original: "console.log(\"   - /admin (on both domains)\");",
    replacement: "logger.info(\"   - /admin (on both domains)\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 33,
    original: "console.log(\"✅ Successfully updated existing user to admin role\");",
    replacement: "logger.info(\"✅ Successfully updated existing user to admin role\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 34,
    original: "console.log(`   Email: ${updatedUser.email}`);",
    replacement: "logger.info(`   Email: ${updatedUser.email}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 35,
    original: "console.log(`   Role: ${updatedUser.role}`);",
    replacement: "logger.info(`   Role: ${updatedUser.role}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 36,
    original: "console.log(\"\\n🎉 You can now access the admin dashboard at:\");",
    replacement: "logger.info(\"\\n🎉 You can now access the admin dashboard at:\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 37,
    original: "console.log(\"   - /admin (on both domains)\");",
    replacement: "logger.info(\"   - /admin (on both domains)\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 39,
    original: "console.log(\"❌ Failed to update user role\");",
    replacement: "logger.info(\"❌ Failed to update user role\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 46,
    original: "console.log(\"📝 Creating new admin user...\");",
    replacement: "logger.info(\"📝 Creating new admin user...\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 62,
    original: "console.log(\"✅ Successfully created new admin user\");",
    replacement: "logger.info(\"✅ Successfully created new admin user\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 63,
    original: "console.log(`   Email: ${newUser.email}`);",
    replacement: "logger.info(`   Email: ${newUser.email}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 64,
    original: "console.log(`   Username: ${newUser.username}`);",
    replacement: "logger.info(`   Username: ${newUser.username}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 65,
    original: "console.log(`   Role: ${newUser.role}`);",
    replacement: "logger.info(`   Role: ${newUser.role}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 66,
    original: "console.log(`   Password: ${password}`);",
    replacement: "logger.info(`   Password: ${password}`);",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 67,
    original: "console.log(\"\\n🎉 You can now log in and access the admin dashboard at:\");",
    replacement: "logger.info(\"\\n🎉 You can now log in and access the admin dashboard at:\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 68,
    original: "console.log(\"   - /admin (on both domains)\");",
    replacement: "logger.info(\"   - /admin (on both domains)\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 70,
    original: "console.log(\"❌ Failed to create user\");",
    replacement: "logger.info(\"❌ Failed to create user\");",
    category: "INFO"
  },
  {
    file: "create-admin-user.js",
    line: 74,
    original: "console.error(\"❌ Error:\", error.message);",
    replacement: "logger.error(\"❌ Error:\", error.message);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 244,
    original: "console.error(\"Error reverse geocoding coordinates:\", error);",
    replacement: "logger.error(\"Error reverse geocoding coordinates:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 295,
    original: "console.error(\"Error geocoding location:\", error);",
    replacement: "logger.error(\"Error geocoding location:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 396,
    original: "console.error(\"Error fetching weather data:\", error);",
    replacement: "logger.error(\"Error fetching weather data:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 400,
    original: "console.error(\"API response error:\", error.response.data);",
    replacement: "logger.error(\"API response error:\", error.response.data);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 523,
    original: "console.error(\"Error fetching historical weather data:\", error);",
    replacement: "logger.error(\"Error fetching historical weather data:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 527,
    original: "console.error(\"API response error:\", error.response.data);",
    replacement: "logger.error(\"API response error:\", error.response.data);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 625,
    original: "console.error(`Error fetching climate data for ${month}:`, error);",
    replacement: "logger.error(`Error fetching climate data for ${month}:`, error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 765,
    original: "console.error(\"Error generating climate data:\", error);",
    replacement: "logger.error(\"Error generating climate data:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 1123,
    original: "console.error(\"Error generating crop recommendations:\", error);",
    replacement: "logger.error(\"Error generating crop recommendations:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 1201,
    original: "console.error(\"Error generating crop yield prediction:\", error);",
    replacement: "logger.error(\"Error generating crop yield prediction:\", error);",
    category: "ERROR"
  },
  {
    file: "server\weather.ts",
    line: 1219,
    original: "console.error(\"Error saving crop yield prediction:\", error);",
    replacement: "logger.error(\"Error saving crop yield prediction:\", error);",
    category: "ERROR"
  },
  {
    file: "server\vite.ts",
    line: 18,
    original: "console.log(`${formattedTime} [${source}] ${message}`);",
    replacement: "logger.info(`${formattedTime} [${source}] ${message}`);",
    category: "INFO"
  },
  {
    file: "server\storage.ts",
    line: 588,
    original: "console.error(\"Error deleting field:\", error);",
    replacement: "logger.error(\"Error deleting field:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 650,
    original: "console.error(\"Error deleting crop:\", error);",
    replacement: "logger.error(\"Error deleting crop:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 710,
    original: "console.error(\"Error deleting crop activity:\", error);",
    replacement: "logger.error(\"Error deleting crop activity:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 892,
    original: "console.error(\"Error deleting task:\", error);",
    replacement: "logger.error(\"Error deleting task:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 962,
    original: "console.error(\"Storage: Error in getPlantAnalyses:\", error);",
    replacement: "logger.error(\"Storage: Error in getPlantAnalyses:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1081,
    original: "console.error(\"Error deleting location:\", error);",
    replacement: "logger.error(\"Error deleting location:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1370,
    original: "console.error(\"Error deleting marketplace listing:\", error);",
    replacement: "logger.error(\"Error deleting marketplace listing:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1393,
    original: "console.error(\"Error incrementing listing views:\", error);",
    replacement: "logger.error(\"Error incrementing listing views:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1472,
    original: "console.error(\"Error deleting marketplace review:\", error);",
    replacement: "logger.error(\"Error deleting marketplace review:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1522,
    original: "console.error(\"Error incrementing favorite count:\", error);",
    replacement: "logger.error(\"Error incrementing favorite count:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1561,
    original: "console.error(\"Error deleting marketplace favorite:\", error);",
    replacement: "logger.error(\"Error deleting marketplace favorite:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1633,
    original: "console.error(\"Error marking message as read:\", error);",
    replacement: "logger.error(\"Error marking message as read:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1646,
    original: "console.error(\"Error deleting marketplace message:\", error);",
    replacement: "logger.error(\"Error deleting marketplace message:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1665,
    original: "console.error(\"Error getting unread message count:\", error);",
    replacement: "logger.error(\"Error getting unread message count:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1713,
    original: "console.error(\"Error deleting plant analysis:\", error);",
    replacement: "logger.error(\"Error deleting plant analysis:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1729,
    original: "console.error(\"Error fetching treatment plan by analysis:\", error);",
    replacement: "logger.error(\"Error fetching treatment plan by analysis:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1742,
    original: "console.error(\"Error fetching treatment plan:\", error);",
    replacement: "logger.error(\"Error fetching treatment plan:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1758,
    original: "console.error(\"Error creating treatment plan:\", error);",
    replacement: "logger.error(\"Error creating treatment plan:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1778,
    original: "console.error(\"Error updating treatment plan:\", error);",
    replacement: "logger.error(\"Error updating treatment plan:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1788,
    original: "console.error(\"Error deleting treatment plan:\", error);",
    replacement: "logger.error(\"Error deleting treatment plan:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1801,
    original: "console.error(\"Error fetching treatment steps:\", error);",
    replacement: "logger.error(\"Error fetching treatment steps:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1814,
    original: "console.error(\"Error fetching treatment step:\", error);",
    replacement: "logger.error(\"Error fetching treatment step:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1829,
    original: "console.error(\"Error creating treatment step:\", error);",
    replacement: "logger.error(\"Error creating treatment step:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1849,
    original: "console.error(\"Error updating treatment step:\", error);",
    replacement: "logger.error(\"Error updating treatment step:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1859,
    original: "console.error(\"Error deleting treatment step:\", error);",
    replacement: "logger.error(\"Error deleting treatment step:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1872,
    original: "console.error(\"Error fetching treatment progress:\", error);",
    replacement: "logger.error(\"Error fetching treatment progress:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1887,
    original: "console.error(\"Error creating treatment progress:\", error);",
    replacement: "logger.error(\"Error creating treatment progress:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1916,
    original: "console.error(\"Error fetching treatment products:\", error);",
    replacement: "logger.error(\"Error fetching treatment products:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1930,
    original: "console.error(\"Error fetching treatment product:\", error);",
    replacement: "logger.error(\"Error fetching treatment product:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1945,
    original: "console.error(\"Error creating treatment product:\", error);",
    replacement: "logger.error(\"Error creating treatment product:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1965,
    original: "console.error(\"Error updating treatment product:\", error);",
    replacement: "logger.error(\"Error updating treatment product:\", error);",
    category: "ERROR"
  },
  {
    file: "server\storage.ts",
    line: 1975,
    original: "console.error(\"Error deleting treatment product:\", error);",
    replacement: "logger.error(\"Error deleting treatment product:\", error);",
    category: "ERROR"
  },
  {
    file: "server\index.ts",
    line: 56,
    original: "console.log(`Subdomain auth redirect: ${path} -> /auth`);",
    replacement: "logger.info(`Subdomain auth redirect: ${path} -> /auth`);",
    category: "INFO"
  },
  {
    file: "server\ai.ts",
    line: 104,
    original: "console.error(\"Error generating AI crop yield prediction:\", error);",
    replacement: "logger.error(\"Error generating AI crop yield prediction:\", error);",
    category: "ERROR"
  },
  {
    file: "server\ai.ts",
    line: 186,
    original: "console.error(\"Error in farming assistant chat:\", error);",
    replacement: "logger.error(\"Error in farming assistant chat:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\test-health-production.js",
    line: 69,
    original: "console.log(\"🧪 Testing Production Health Check Endpoints\");",
    replacement: "logger.info(\"🧪 Testing Production Health Check Endpoints\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 70,
    original: "console.log(\"=============================================\");",
    replacement: "logger.info(\"=============================================\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 71,
    original: "console.log(`Base URL: ${baseUrl}`);",
    replacement: "logger.info(`Base URL: ${baseUrl}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 72,
    original: "console.log(`Environment: ${process.env.NODE_ENV || \"development\"}`);",
    replacement: "logger.info(`Environment: ${process.env.NODE_ENV || \"development\"}`);",
    category: "DEVELOPMENT"
  },
  {
    file: "scripts\test-health-production.js",
    line: 73,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 80,
    original: "console.log(`Testing: ${endpoint}`);",
    replacement: "logger.info(`Testing: ${endpoint}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 86,
    original: "console.log(`  ✅ Status: ${result.status}`);",
    replacement: "logger.info(`  ✅ Status: ${result.status}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 87,
    original: "console.log(`  ⏱️  Response Time: ${result.responseTime}ms`);",
    replacement: "logger.info(`  ⏱️  Response Time: ${result.responseTime}ms`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 90,
    original: "console.log(`  📊 Health Status: ${result.data.status}`);",
    replacement: "logger.info(`  📊 Health Status: ${result.data.status}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 94,
    original: "console.log(`  📊 Server Response Time: ${result.data.responseTime}ms`);",
    replacement: "logger.info(`  📊 Server Response Time: ${result.data.responseTime}ms`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 98,
    original: "console.log(`  🆔 Request ID: ${result.data.requestId}`);",
    replacement: "logger.info(`  🆔 Request ID: ${result.data.requestId}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 104,
    original: "console.log(`  🚂 Railway Health Check: PASSED`);",
    replacement: "logger.info(`  🚂 Railway Health Check: PASSED`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 106,
    original: "console.log(`  🚂 Railway Health Check: FAILED`);",
    replacement: "logger.info(`  🚂 Railway Health Check: FAILED`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 112,
    original: "console.log(`  ❌ Error: ${error.message}`);",
    replacement: "logger.info(`  ❌ Error: ${error.message}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 116,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 120,
    original: "console.log(\"📋 Summary\");",
    replacement: "logger.info(\"📋 Summary\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 121,
    original: "console.log(\"==========\");",
    replacement: "logger.info(\"==========\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 126,
    original: "console.log(`✅ Successful: ${successful}/${ENDPOINTS.length}`);",
    replacement: "logger.info(`✅ Successful: ${successful}/${ENDPOINTS.length}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 127,
    original: "console.log(`❌ Failed: ${failed}/${ENDPOINTS.length}`);",
    replacement: "logger.info(`❌ Failed: ${failed}/${ENDPOINTS.length}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 130,
    original: "console.log(\"\\n❌ Failed endpoints:\");",
    replacement: "logger.info(\"\\n❌ Failed endpoints:\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 134,
    original: "console.log(`  - ${r.endpoint}: ${r.error}`);",
    replacement: "logger.info(`  - ${r.endpoint}: ${r.error}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 145,
    original: "console.log(\"\\n✅ Railway health check endpoint is working correctly!\");",
    replacement: "logger.info(\"\\n✅ Railway health check endpoint is working correctly!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 146,
    original: "console.log(\"   This should resolve CI deployment issues.\");",
    replacement: "logger.info(\"   This should resolve CI deployment issues.\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 148,
    original: "console.log(\"\\n❌ Railway health check endpoint is not working!\");",
    replacement: "logger.info(\"\\n❌ Railway health check endpoint is not working!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 149,
    original: "console.log(\"   This will cause deployment failures on Railway.\");",
    replacement: "logger.info(\"   This will cause deployment failures on Railway.\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 158,
    original: "console.log(\"\\n⚠️  Slow endpoints (>5s):\");",
    replacement: "logger.info(\"\\n⚠️  Slow endpoints (>5s):\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 160,
    original: "console.log(`  - ${r.endpoint}: ${r.result.responseTime}ms`);",
    replacement: "logger.info(`  - ${r.endpoint}: ${r.result.responseTime}ms`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 171,
    original: "console.log(\"\\n✅ Database connectivity is working!\");",
    replacement: "logger.info(\"\\n✅ Database connectivity is working!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 173,
    original: "console.log(\"\\n❌ Database connectivity issues detected!\");",
    replacement: "logger.info(\"\\n❌ Database connectivity issues detected!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 174,
    original: "console.log(\"   This may cause problems in production.\");",
    replacement: "logger.info(\"   This may cause problems in production.\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 184,
    original: "console.log(\"\\n🎯 Health check testing completed!\");",
    replacement: "logger.info(\"\\n🎯 Health check testing completed!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 187,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 190,
    original: "console.log(\"\\n🔧 Troubleshooting tips:\");",
    replacement: "logger.info(\"\\n🔧 Troubleshooting tips:\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 191,
    original: "console.log(\"1. Check if the server is running: npm start\");",
    replacement: "logger.info(\"1. Check if the server is running: npm start\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 192,
    original: "console.log(\"2. Verify environment variables are set correctly\");",
    replacement: "logger.info(\"2. Verify environment variables are set correctly\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 193,
    original: "console.log(\"3. Check database connectivity\");",
    replacement: "logger.info(\"3. Check database connectivity\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 194,
    original: "console.log(\"4. Review server logs for errors\");",
    replacement: "logger.info(\"4. Review server logs for errors\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 197,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\test-health-production.js",
    line: 204,
    original: "console.error(\"\\n💥 Testing failed:\", error);",
    replacement: "logger.error(\"\\n💥 Testing failed:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 68,
    original: "console.log(\"🧪 Testing Health Check Endpoints\");",
    replacement: "logger.info(\"🧪 Testing Health Check Endpoints\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 69,
    original: "console.log(\"================================\");",
    replacement: "logger.info(\"================================\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 70,
    original: "console.log(`Base URL: ${baseUrl}`);",
    replacement: "logger.info(`Base URL: ${baseUrl}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 71,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 77,
    original: "console.log(`Testing: ${endpoint}`);",
    replacement: "logger.info(`Testing: ${endpoint}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 83,
    original: "console.log(`  ✅ Status: ${result.status}`);",
    replacement: "logger.info(`  ✅ Status: ${result.status}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 84,
    original: "console.log(`  ⏱️  Response Time: ${result.responseTime}ms`);",
    replacement: "logger.info(`  ⏱️  Response Time: ${result.responseTime}ms`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 87,
    original: "console.log(`  📊 Status: ${result.data.status}`);",
    replacement: "logger.info(`  📊 Status: ${result.data.status}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 91,
    original: "console.log(`  📊 Server Response Time: ${result.data.responseTime}ms`);",
    replacement: "logger.info(`  📊 Server Response Time: ${result.data.responseTime}ms`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 95,
    original: "console.log(`  🆔 Request ID: ${result.data.requestId}`);",
    replacement: "logger.info(`  🆔 Request ID: ${result.data.requestId}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 99,
    original: "console.log(`  ❌ Error: ${error.message}`);",
    replacement: "logger.info(`  ❌ Error: ${error.message}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 102,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 106,
    original: "console.log(\"📋 Summary\");",
    replacement: "logger.info(\"📋 Summary\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 107,
    original: "console.log(\"==========\");",
    replacement: "logger.info(\"==========\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 112,
    original: "console.log(`✅ Successful: ${successful}/${ENDPOINTS.length}`);",
    replacement: "logger.info(`✅ Successful: ${successful}/${ENDPOINTS.length}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 113,
    original: "console.log(`❌ Failed: ${failed}/${ENDPOINTS.length}`);",
    replacement: "logger.info(`❌ Failed: ${failed}/${ENDPOINTS.length}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 116,
    original: "console.log(\"\\n❌ Failed endpoints:\");",
    replacement: "logger.info(\"\\n❌ Failed endpoints:\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 120,
    original: "console.log(`  - ${r.endpoint}: ${r.error}`);",
    replacement: "logger.info(`  - ${r.endpoint}: ${r.error}`);",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 127,
    original: "console.log(\"\\n✅ Railway health check endpoint is working correctly!\");",
    replacement: "logger.info(\"\\n✅ Railway health check endpoint is working correctly!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 129,
    original: "console.log(\"\\n❌ Railway health check endpoint is not working!\");",
    replacement: "logger.info(\"\\n❌ Railway health check endpoint is not working!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 130,
    original: "console.log(\"   This will cause deployment issues on Railway.\");",
    replacement: "logger.info(\"   This will cause deployment issues on Railway.\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 139,
    original: "console.log(\"\\n🎯 Health check testing completed!\");",
    replacement: "logger.info(\"\\n🎯 Health check testing completed!\");",
    category: "INFO"
  },
  {
    file: "scripts\test-health-checks.js",
    line: 143,
    original: "console.error(\"\\n💥 Testing failed:\", error);",
    replacement: "logger.error(\"\\n💥 Testing failed:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 16,
    original: "console.log(\"🔍 Introspecting database...\");",
    replacement: "logger.info(\"🔍 Introspecting database...\");",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 28,
    original: "console.log(\"📋 Existing tables:\", existingTables);",
    replacement: "logger.info(\"📋 Existing tables:\", existingTables);",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 48,
    original: "console.log(\"📁 Migration files:\", migrationFiles);",
    replacement: "logger.info(\"📁 Migration files:\", migrationFiles);",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 72,
    original: "console.log(\"✅ Migration journal synced!\");",
    replacement: "logger.info(\"✅ Migration journal synced!\");",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 73,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 81,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 85,
    original: "console.log(\"✅ Trust features already applied.\");",
    replacement: "logger.info(\"✅ Trust features already applied.\");",
    category: "INFO"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 88,
    original: "console.error(\"❌ Error syncing migrations:\", error);",
    replacement: "logger.error(\"❌ Error syncing migrations:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\sync-migrations.js",
    line: 105,
    original: "console.error(\"Error checking trust columns:\", error);",
    replacement: "logger.error(\"Error checking trust columns:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 278,
    original: "console.log(\"🌱 Starting pest/disease database seeding...\");",
    replacement: "logger.info(\"🌱 Starting pest/disease database seeding...\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 284,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 287,
    original: "console.log(\"Skipping seeding to avoid duplicates.\");",
    replacement: "logger.info(\"Skipping seeding to avoid duplicates.\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 297,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 311,
    original: "console.log(`   ${emoji} ${record.name} (${record.riskLevel} risk)`);",
    replacement: "logger.info(`   ${emoji} ${record.name} (${record.riskLevel} risk)`);",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 314,
    original: "console.log(\"\\n🎯 High-risk pests that will trigger automatic alerts:\");",
    replacement: "logger.info(\"\\n🎯 High-risk pests that will trigger automatic alerts:\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 320,
    original: "console.log(`   • ${pest.name}: ${pest.alertThreshold} reports = alert`);",
    replacement: "logger.info(`   • ${pest.name}: ${pest.alertThreshold} reports = alert`);",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 323,
    original: "console.log(\"\\n🚀 Pest monitoring system is now active!\");",
    replacement: "logger.info(\"\\n🚀 Pest monitoring system is now active!\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 324,
    original: "console.log(\"   • Plant diagnosis will automatically detect these threats\");",
    replacement: "logger.info(\"   • Plant diagnosis will automatically detect these threats\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 325,
    original: "console.log(\"   • Admin alerts will be sent when thresholds are exceeded\");",
    replacement: "logger.info(\"   • Admin alerts will be sent when thresholds are exceeded\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 326,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 330,
    original: "console.error(\"❌ Error seeding pest database:\", error);",
    replacement: "logger.error(\"❌ Error seeding pest database:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 338,
    original: "console.log(\"\\n✨ Pest database seeding completed successfully!\");",
    replacement: "logger.info(\"\\n✨ Pest database seeding completed successfully!\");",
    category: "INFO"
  },
  {
    file: "scripts\seed-pest-database.js",
    line: 342,
    original: "console.error(\"❌ Seeding failed:\", error);",
    replacement: "logger.error(\"❌ Seeding failed:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\reset-db.js",
    line: 10,
    original: "console.log(\"🗑️  Dropping all tables...\");",
    replacement: "logger.info(\"🗑️  Dropping all tables...\");",
    category: "INFO"
  },
  {
    file: "scripts\reset-db.js",
    line: 20,
    original: "console.log(\"✅ Database dropped successfully\");",
    replacement: "logger.info(\"✅ Database dropped successfully\");",
    category: "INFO"
  },
  {
    file: "scripts\reset-db.js",
    line: 22,
    original: "console.log(\"🔄 Running migrations...\");",
    replacement: "logger.info(\"🔄 Running migrations...\");",
    category: "INFO"
  },
  {
    file: "scripts\reset-db.js",
    line: 28,
    original: "console.log(\"✅ Database reset complete!\");",
    replacement: "logger.info(\"✅ Database reset complete!\");",
    category: "INFO"
  },
  {
    file: "scripts\reset-db.js",
    line: 29,
    original: "console.log(\"🎉 All migrations applied successfully\");",
    replacement: "logger.info(\"🎉 All migrations applied successfully\");",
    category: "INFO"
  },
  {
    file: "scripts\reset-db.js",
    line: 31,
    original: "console.error(\"❌ Error resetting database:\", error);",
    replacement: "logger.error(\"❌ Error resetting database:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 8,
    original: "console.log(\"🔍 Finding crops with existing QR codes...\");",
    replacement: "logger.info(\"🔍 Finding crops with existing QR codes...\");",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 16,
    original: "console.log(`📊 Found ${cropsWithQR.length} crops with existing QR codes`);",
    replacement: "logger.info(`📊 Found ${cropsWithQR.length} crops with existing QR codes`);",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 19,
    original: "console.log(\"✅ No crops with QR codes found!\");",
    replacement: "logger.info(\"✅ No crops with QR codes found!\");",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 28,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 46,
    original: "console.log(`✅ Successfully regenerated QR code for ${crop.name}`);",
    replacement: "logger.info(`✅ Successfully regenerated QR code for ${crop.name}`);",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 49,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 57,
    original: "console.log(\"\\n📈 Summary:\");",
    replacement: "logger.info(\"\\n📈 Summary:\");",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 58,
    original: "console.log(`✅ Successfully regenerated: ${successCount} QR codes`);",
    replacement: "logger.info(`✅ Successfully regenerated: ${successCount} QR codes`);",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 59,
    original: "console.log(`❌ Failed to regenerate: ${errorCount} QR codes`);",
    replacement: "logger.info(`❌ Failed to regenerate: ${errorCount} QR codes`);",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 60,
    original: "console.log(`📊 Total processed: ${cropsWithQR.length} crops`);",
    replacement: "logger.info(`📊 Total processed: ${cropsWithQR.length} crops`);",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 63,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 66,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\regenerate-qr-codes.js",
    line: 71,
    original: "console.error(\"❌ Script failed:\", error);",
    replacement: "logger.error(\"❌ Script failed:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 22,
    original: "console.log(\"🚀 Starting Performance Optimizations for Greenupp Platform\");",
    replacement: "logger.info(\"🚀 Starting Performance Optimizations for Greenupp Platform\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 23,
    original: "console.log(\"==========================================================\");",
    replacement: "logger.info(\"==========================================================\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 24,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 28,
    original: "console.log(\"📊 Step 1: Applying Database Indexes...\");",
    replacement: "logger.info(\"📊 Step 1: Applying Database Indexes...\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 30,
    original: "console.log(\"✅ Database indexes applied successfully\");",
    replacement: "logger.info(\"✅ Database indexes applied successfully\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 31,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 34,
    original: "console.log(\"📈 Step 2: Updating Table Statistics...\");",
    replacement: "logger.info(\"📈 Step 2: Updating Table Statistics...\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 36,
    original: "console.log(\"✅ Table statistics updated\");",
    replacement: "logger.info(\"✅ Table statistics updated\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 37,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 40,
    original: "console.log(\"⚙️ Step 3: Optimizing Database Configuration...\");",
    replacement: "logger.info(\"⚙️ Step 3: Optimizing Database Configuration...\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 42,
    original: "console.log(\"✅ Database configuration optimized\");",
    replacement: "logger.info(\"✅ Database configuration optimized\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 43,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 46,
    original: "console.log(\"🧹 Step 4: Cleaning Up Old Data...\");",
    replacement: "logger.info(\"🧹 Step 4: Cleaning Up Old Data...\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 48,
    original: "console.log(\"✅ Old data cleanup completed\");",
    replacement: "logger.info(\"✅ Old data cleanup completed\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 49,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 52,
    original: "console.log(\"📊 Step 5: Running Performance Analysis...\");",
    replacement: "logger.info(\"📊 Step 5: Running Performance Analysis...\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 54,
    original: "console.log(\"✅ Performance analysis completed\");",
    replacement: "logger.info(\"✅ Performance analysis completed\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 55,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 57,
    original: "console.log(\"🎉 All performance optimizations completed successfully!\");",
    replacement: "logger.info(\"🎉 All performance optimizations completed successfully!\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 58,
    original: "console.log(\"\");",
    replacement: "logger.info(\"\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 59,
    original: "console.log(\"📋 Summary of optimizations applied:\");",
    replacement: "logger.info(\"📋 Summary of optimizations applied:\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 60,
    original: "console.log(\"- Database indexes for faster queries\");",
    replacement: "logger.info(\"- Database indexes for faster queries\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 61,
    original: "console.log(\"- Updated table statistics for better query planning\");",
    replacement: "logger.info(\"- Updated table statistics for better query planning\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 62,
    original: "console.log(\"- Optimized database configuration\");",
    replacement: "logger.info(\"- Optimized database configuration\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 63,
    original: "console.log(\"- Cleaned up old data and sessions\");",
    replacement: "logger.info(\"- Cleaned up old data and sessions\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 64,
    original: "console.log(\"- Performance analysis and recommendations\");",
    replacement: "logger.info(\"- Performance analysis and recommendations\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 66,
    original: "console.error(\"❌ Error during optimization:\", error);",
    replacement: "logger.error(\"❌ Error during optimization:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 145,
    original: "console.warn(`⚠️ Warning creating index: ${error.message}`);",
    replacement: "logger.warn(`⚠️ Warning creating index: ${error.message}`);",
    category: "WARN"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 174,
    original: "console.warn(`⚠️ Warning analyzing table ${table}: ${error.message}`);",
    replacement: "logger.warn(`⚠️ Warning analyzing table ${table}: ${error.message}`);",
    category: "WARN"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 209,
    original: "console.warn(`⚠️ Warning applying optimization: ${error.message}`);",
    replacement: "logger.warn(`⚠️ Warning applying optimization: ${error.message}`);",
    category: "WARN"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 238,
    original: "console.log(`🧹 Cleaned up ${result.rowCount} old records`);",
    replacement: "logger.info(`🧹 Cleaned up ${result.rowCount} old records`);",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 240,
    original: "console.warn(`⚠️ Warning during cleanup: ${error.message}`);",
    replacement: "logger.warn(`⚠️ Warning during cleanup: ${error.message}`);",
    category: "WARN"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 246,
    original: "console.log(\"📊 Analyzing query performance...\");",
    replacement: "logger.info(\"📊 Analyzing query performance...\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 264,
    original: "console.log(\"🐌 Slow queries detected:\");",
    replacement: "logger.info(\"🐌 Slow queries detected:\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 266,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 274,
    original: "console.log(\"✅ No slow queries detected\");",
    replacement: "logger.info(\"✅ No slow queries detected\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 288,
    original: "console.log(\"\\n📏 Table sizes:\");",
    replacement: "logger.info(\"\\n📏 Table sizes:\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 290,
    original: "console.log(`  ${row.tablename}: ${row.size}`);",
    replacement: "logger.info(`  ${row.tablename}: ${row.size}`);",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 307,
    original: "console.log(\"\\n📈 Most used indexes:\");",
    replacement: "logger.info(\"\\n📈 Most used indexes:\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 309,
    original: "console.log(`  ${index + 1}. ${row.indexname} (${row.idx_scan} scans)`);",
    replacement: "logger.info(`  ${index + 1}. ${row.indexname} (${row.idx_scan} scans)`);",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 312,
    original: "console.warn(`⚠️ Warning during performance analysis: ${error.message}`);",
    replacement: "logger.warn(`⚠️ Warning during performance analysis: ${error.message}`);",
    category: "WARN"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 319,
    original: "console.log(\"\\n🎯 Performance optimization script completed!\");",
    replacement: "logger.info(\"\\n🎯 Performance optimization script completed!\");",
    category: "INFO"
  },
  {
    file: "scripts\optimize-performance.js",
    line: 323,
    original: "console.error(\"\\n💥 Script failed:\", error);",
    replacement: "logger.error(\"\\n💥 Script failed:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 8,
    original: "console.log(\"🔍 Finding crops without QR codes...\");",
    replacement: "logger.info(\"🔍 Finding crops without QR codes...\");",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 16,
    original: "console.log(`📊 Found ${cropsWithoutQR.length} crops without QR codes`);",
    replacement: "logger.info(`📊 Found ${cropsWithoutQR.length} crops without QR codes`);",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 19,
    original: "console.log(\"✅ All crops already have QR codes!\");",
    replacement: "logger.info(\"✅ All crops already have QR codes!\");",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 28,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 43,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 48,
    original: "console.log(`❌ Failed to generate QR code for ${crop.name}`);",
    replacement: "logger.info(`❌ Failed to generate QR code for ${crop.name}`);",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 52,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 60,
    original: "console.log(\"\\n📈 Summary:\");",
    replacement: "logger.info(\"\\n📈 Summary:\");",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 61,
    original: "console.log(`✅ Successfully generated: ${successCount} QR codes`);",
    replacement: "logger.info(`✅ Successfully generated: ${successCount} QR codes`);",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 62,
    original: "console.log(`❌ Failed to generate: ${errorCount} QR codes`);",
    replacement: "logger.info(`❌ Failed to generate: ${errorCount} QR codes`);",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 63,
    original: "console.log(`📊 Total processed: ${cropsWithoutQR.length} crops`);",
    replacement: "logger.info(`📊 Total processed: ${cropsWithoutQR.length} crops`);",
    category: "INFO"
  },
  {
    file: "scripts\generate-qr-codes.js",
    line: 65,
    original: "console.error(\"❌ Script failed:\", error);",
    replacement: "logger.error(\"❌ Script failed:\", error);",
    category: "ERROR"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 41,
    original: "console.log('🔍 Scanning for console statements...\\n');",
    replacement: "logger.info('🔍 Scanning for console statements...\\n');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 120,
    original: "console.error(`Error reading ${file}:`, error.message);",
    replacement: "logger.error(`Error reading ${file}:`, error.message);",
    category: "ERROR"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 128,
    original: "console.log('📊 Console Log Cleanup Report');",
    replacement: "logger.info('📊 Console Log Cleanup Report');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 129,
    original: "console.log('===============================\\n');",
    replacement: "logger.info('===============================\\n');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 131,
    original: "console.log('📈 Summary:');",
    replacement: "logger.info('📈 Summary:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 132,
    original: "console.log(`  Total console statements: ${results.summary.total}`);",
    replacement: "logger.info(`  Total console statements: ${results.summary.total}`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 133,
    original: "console.log(`  To replace: ${results.toReplace.length}`);",
    replacement: "logger.info(`  To replace: ${results.toReplace.length}`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 134,
    original: "console.log(`  To keep: ${results.toKeep.length}`);",
    replacement: "logger.info(`  To keep: ${results.toKeep.length}`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 135,
    original: "console.log(`",
    replacement: "logger.info(`",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 144,
    original: "console.log('🚨 Console statements that should be replaced with logger:');",
    replacement: "logger.info('🚨 Console statements that should be replaced with logger:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 145,
    original: "console.log('=========================================================\\n');",
    replacement: "logger.info('=========================================================\\n');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 155,
    original: "console.log(`📄 ${file}:`);",
    replacement: "logger.info(`📄 ${file}:`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 157,
    original: "console.log(`  Line ${stmt.line}: ${stmt.content} [${stmt.category}]`);",
    replacement: "logger.info(`  Line ${stmt.line}: ${stmt.content} [${stmt.category}]`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 159,
    original: "console.log('');",
    replacement: "logger.info('');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 163,
    original: "console.log('\\n💡 Recommended Actions:');",
    replacement: "logger.info('\\n💡 Recommended Actions:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 164,
    original: "console.log('========================');",
    replacement: "logger.info('========================');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 165,
    original: "console.log('1. Replace console.log with logger.info() for informational messages');",
    replacement: "logger.info('1. Replace console.log with logger.info() for informational messages');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 166,
    original: "console.log('2. Replace console.error with logger.error() for errors');",
    replacement: "logger.error('2. Replace console.error with logger.error() for errors');",
    category: "ERROR"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 167,
    original: "console.log('3. Replace console.warn with logger.warn() for warnings');",
    replacement: "logger.warn('3. Replace console.warn with logger.warn() for warnings');",
    category: "WARN"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 168,
    original: "console.log('4. Replace console.debug with logger.debug() for debug messages');",
    replacement: "logger.debug('4. Replace console.debug with logger.debug() for debug messages');",
    category: "DEBUG"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 169,
    original: "console.log('5. Consider removing debug statements in production code');",
    replacement: "logger.debug('5. Consider removing debug statements in production code');",
    category: "DEBUG"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 170,
    original: "console.log('\\nExample replacements:');",
    replacement: "logger.info('\\nExample replacements:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 171,
    original: "console.log('  console.log(\"Info message\") → logger.info(\"Info message\")');",
    replacement: "logger.info('  console.log(\"Info message\") → logger.info(\"Info message\")');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 172,
    original: "console.log('  console.error(\"Error:\", error) → logger.error(\"Error:\", error)');",
    replacement: "logger.error('  console.error(\"Error:\", error) → logger.error(\"Error:\", error)');",
    category: "ERROR"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 206,
    original: "console.log('⚠️  This is an auto-generated script. Review carefully before running!');",
    replacement: "logger.info('⚠️  This is an auto-generated script. Review carefully before running!');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 207,
    original: "console.log('🔄 To apply replacements, uncomment the replacement logic below.\\\\n');",
    replacement: "logger.info('🔄 To apply replacements, uncomment the replacement logic below.\\\\n');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 223,
    original: "console.log(\\`✅ Updated \\${replacement.file}:\\${replacement.line}\\`);",
    replacement: "logger.info(\\`✅ Updated \\${replacement.file}:\\${replacement.line}\\`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 225,
    original: "console.log(\\`⚠️  Skipped \\${replacement.file}:\\${replacement.line} - content changed\\`);",
    replacement: "logger.info(\\`⚠️  Skipped \\${replacement.file}:\\${replacement.line} - content changed\\`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 228,
    original: "console.error(\\`❌ Error updating \\${replacement.file}:\\`, error.message);",
    replacement: "logger.error(\\`❌ Error updating \\${replacement.file}:\\`, error.message);",
    category: "ERROR"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 233,
    original: "console.log('\\\\n📊 Summary:');",
    replacement: "logger.info('\\\\n📊 Summary:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 234,
    original: "console.log(\\`Total replacements identified: \\${replacements.length}\\`);",
    replacement: "logger.info(\\`Total replacements identified: \\${replacements.length}\\`);",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 235,
    original: "console.log('\\\\n💡 Manual review recommended for:');",
    replacement: "logger.info('\\\\n💡 Manual review recommended for:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 236,
    original: "console.log('  • Debug statements that should be removed entirely');",
    replacement: "logger.debug('  • Debug statements that should be removed entirely');",
    category: "DEBUG"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 237,
    original: "console.log('  • Temporary logging that should be deleted');",
    replacement: "logger.info('  • Temporary logging that should be deleted');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 238,
    original: "console.log('  • Performance-sensitive logging');",
    replacement: "logger.info('  • Performance-sensitive logging');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 252,
    original: "console.log('\\n🎯 Next Steps:');",
    replacement: "logger.info('\\n🎯 Next Steps:');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 253,
    original: "console.log('1. Review the report above');",
    replacement: "logger.info('1. Review the report above');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 255,
    original: "console.log('3. Manually update critical files first');",
    replacement: "logger.info('3. Manually update critical files first');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 256,
    original: "console.log('4. Run the auto-replacement script for bulk changes');",
    replacement: "logger.info('4. Run the auto-replacement script for bulk changes');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 257,
    original: "console.log('5. Test thoroughly after changes');",
    replacement: "logger.info('5. Test thoroughly after changes');",
    category: "INFO"
  },
  {
    file: "scripts\cleanup-console-logs.js",
    line: 260,
    original: "console.error('❌ Script failed:', error.message);",
    replacement: "logger.error('❌ Script failed:', error.message);",
    category: "ERROR"
  },
  {
    file: "server\utils\logger.ts",
    line: 31,
    original: "console.log(`[DEBUG] ${message}`, ...args);",
    replacement: "logger.debug(`[DEBUG] ${message}`, ...args);",
    category: "DEBUG"
  },
  {
    file: "server\utils\logger.ts",
    line: 37,
    original: "console.log(`[INFO] ${message}`, ...args);",
    replacement: "logger.info(`[INFO] ${message}`, ...args);",
    category: "INFO"
  },
  {
    file: "server\utils\logger.ts",
    line: 43,
    original: "console.warn(`[WARN] ${message}`, ...args);",
    replacement: "logger.warn(`[WARN] ${message}`, ...args);",
    category: "WARN"
  },
  {
    file: "server\utils\logger.ts",
    line: 49,
    original: "console.error(`[ERROR] ${message}`, ...args);",
    replacement: "logger.error(`[ERROR] ${message}`, ...args);",
    category: "ERROR"
  },
  {
    file: "server\services\uploadService.ts",
    line: 31,
    original: "console.warn(\"Could not create uploads directory:\", error);",
    replacement: "logger.warn(\"Could not create uploads directory:\", error);",
    category: "WARN"
  },
  {
    file: "server\services\uploadService.ts",
    line: 39,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\stream-chat-service.ts",
    line: 16,
    original: "console.log(`[StreamChat] INFO: ${message}`, ...args),",
    replacement: "logger.info(`[StreamChat] INFO: ${message}`, ...args),",
    category: "INFO"
  },
  {
    file: "server\services\stream-chat-service.ts",
    line: 18,
    original: "console.error(`[StreamChat] ERROR: ${message}`, ...args),",
    replacement: "logger.error(`[StreamChat] ERROR: ${message}`, ...args),",
    category: "ERROR"
  },
  {
    file: "server\services\stream-chat-service.ts",
    line: 20,
    original: "console.warn(`[StreamChat] WARN: ${message}`, ...args),",
    replacement: "logger.warn(`[StreamChat] WARN: ${message}`, ...args),",
    category: "WARN"
  },
  {
    file: "server\services\stream-chat-service.ts",
    line: 22,
    original: "console.debug(`[StreamChat] DEBUG: ${message}`, ...args),",
    replacement: "logger.info(`[StreamChat] DEBUG: ${message}`, ...args),",
    category: "INFO"
  },
  {
    file: "server\services\social-notifications.ts",
    line: 42,
    original: "console.log(`[SOCIAL NOTIFICATION] Sending ${notification.type} notification`);",
    replacement: "logger.info(`[SOCIAL NOTIFICATION] Sending ${notification.type} notification`);",
    category: "INFO"
  },
  {
    file: "server\services\social-notifications.ts",
    line: 234,
    original: "console.log(`[SOCIAL NOTIFICATION] Email sent to ${recipientEmail}`);",
    replacement: "logger.info(`[SOCIAL NOTIFICATION] Email sent to ${recipientEmail}`);",
    category: "INFO"
  },
  {
    file: "server\services\social-notifications.ts",
    line: 237,
    original: "console.error(`[SOCIAL NOTIFICATION] Failed to send email to ${recipientEmail}: ${emailResult.error || 'Unknown error'}`);",
    replacement: "logger.error(`[SOCIAL NOTIFICATION] Failed to send email to ${recipientEmail}: ${emailResult.error || 'Unknown error'}`);",
    category: "ERROR"
  },
  {
    file: "server\services\social-notifications.ts",
    line: 244,
    original: "console.error('[SOCIAL NOTIFICATION] Error sending notification email:', error);",
    replacement: "logger.error('[SOCIAL NOTIFICATION] Error sending notification email:', error);",
    category: "ERROR"
  },
  {
    file: "server\services\qrcode.ts",
    line: 29,
    original: "console.log(`[QRCode] Generating QR code for data: ${data}`);",
    replacement: "logger.info(`[QRCode] Generating QR code for data: ${data}`);",
    category: "INFO"
  },
  {
    file: "server\services\qrcode.ts",
    line: 43,
    original: "console.log(`[QRCode] Successfully generated QR code`);",
    replacement: "logger.info(`[QRCode] Successfully generated QR code`);",
    category: "INFO"
  },
  {
    file: "server\services\qrcode.ts",
    line: 46,
    original: "console.error(\"[QRCode] Error generating QR code:\", error);",
    replacement: "logger.error(\"[QRCode] Error generating QR code:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\qrcode.ts",
    line: 63,
    original: "console.log(`[QRCode] Generating crop trace QR code for URL: ${traceUrl}`);",
    replacement: "logger.info(`[QRCode] Generating crop trace QR code for URL: ${traceUrl}`);",
    category: "INFO"
  },
  {
    file: "server\services\qrcode.ts",
    line: 79,
    original: "console.log(`[QRCode] Generating marketplace QR code for URL: ${traceUrl}`);",
    replacement: "logger.info(`[QRCode] Generating marketplace QR code for URL: ${traceUrl}`);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 66,
    original: "console.log(\"Detecting format for base64 data length:\", base64Data.length);",
    replacement: "logger.info(\"Detecting format for base64 data length:\", base64Data.length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 70,
    original: "console.log(\"Buffer length:\", buffer.length);",
    replacement: "logger.info(\"Buffer length:\", buffer.length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 71,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 85,
    original: "console.log(\"Detected: PNG\");",
    replacement: "logger.info(\"Detected: PNG\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 91,
    original: "console.log(\"Detected: JPEG\");",
    replacement: "logger.info(\"Detected: JPEG\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 102,
    original: "console.log(\"Detected: GIF\");",
    replacement: "logger.info(\"Detected: GIF\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 117,
    original: "console.log(\"Detected: WebP\");",
    replacement: "logger.info(\"Detected: WebP\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 121,
    original: "console.log(\"Could not detect format, defaulting to JPEG\");",
    replacement: "logger.info(\"Could not detect format, defaulting to JPEG\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 131,
    original: "console.log(\"Extracting from data URL, length:\", dataUrl.length);",
    replacement: "logger.info(\"Extracting from data URL, length:\", dataUrl.length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 132,
    original: "console.log(\"Data URL starts with:\", `${dataUrl.substring(0, 100)}...`);",
    replacement: "logger.info(\"Data URL starts with:\", `${dataUrl.substring(0, 100)}...`);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 136,
    original: "console.log(\"No data: prefix found, treating as raw base64\");",
    replacement: "logger.info(\"No data: prefix found, treating as raw base64\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 146,
    original: "console.log(\"Extracted base64 data length:\", base64Match[1].length);",
    replacement: "logger.info(\"Extracted base64 data length:\", base64Match[1].length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 159,
    original: "console.log(\"=== Starting image conversion for OpenAI ===\");",
    replacement: "logger.info(\"=== Starting image conversion for OpenAI ===\");",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 160,
    original: "console.log(\"Input imageData type:\", typeof imageData);",
    replacement: "logger.info(\"Input imageData type:\", typeof imageData);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 161,
    original: "console.log(\"Input imageData length:\", imageData.length);",
    replacement: "logger.info(\"Input imageData length:\", imageData.length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 162,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 177,
    original: "console.log(\"Extracted base64 data length:\", base64Data.length);",
    replacement: "logger.info(\"Extracted base64 data length:\", base64Data.length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 193,
    original: "console.log(`Final detected format: ${imageFormat}`);",
    replacement: "logger.info(`Final detected format: ${imageFormat}`);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 207,
    original: "console.log(\"Generated data URL length:\", dataUrl.length);",
    replacement: "logger.info(\"Generated data URL length:\", dataUrl.length);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 208,
    original: "console.log(\"Data URL starts with:\", `${dataUrl.substring(0, 100)}...`);",
    replacement: "logger.info(\"Data URL starts with:\", `${dataUrl.substring(0, 100)}...`);",
    category: "INFO"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 216,
    original: "console.error(\"Error converting image for OpenAI:\", error);",
    replacement: "logger.error(\"Error converting image for OpenAI:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\plant-analysis.ts",
    line: 314,
    original: "console.error(\"Error analyzing plant image:\", error);",
    replacement: "logger.error(\"Error analyzing plant image:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\notifications.ts",
    line: 176,
    original: "console.error(\"Failed to send notification email:\", error);",
    replacement: "logger.error(\"Failed to send notification email:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\notifications.ts",
    line: 521,
    original: "console.error(\"Email sending failed:\", error);",
    replacement: "logger.error(\"Email sending failed:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\email.ts",
    line: 16,
    original: "console.log(\"\\n==================================\");",
    replacement: "logger.info(\"\\n==================================\");",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 18,
    original: "console.log(\"==================================\");",
    replacement: "logger.info(\"==================================\");",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 19,
    original: "console.log(`From: ${options.from}`);",
    replacement: "logger.info(`From: ${options.from}`);",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 20,
    original: "console.log(`To: ${options.to}`);",
    replacement: "logger.info(`To: ${options.to}`);",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 21,
    original: "console.log(`Subject: ${options.subject}`);",
    replacement: "logger.info(`Subject: ${options.subject}`);",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 22,
    original: "console.log(\"----------------------------------\");",
    replacement: "logger.info(\"----------------------------------\");",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 23,
    original: "console.log(options.text);",
    replacement: "logger.info(options.text);",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 24,
    original: "console.log(\"==================================\\n\");",
    replacement: "logger.info(\"==================================\\n\");",
    category: "INFO"
  },
  {
    file: "server\services\email.ts",
    line: 52,
    original: "console.error(\"Failed to send email via SMTP:\", error);",
    replacement: "logger.error(\"Failed to send email via SMTP:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 29,
    original: "console.error(\"Error creating chat room:\", error);",
    replacement: "logger.error(\"Error creating chat room:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 45,
    original: "console.error(`Error fetching chat room ${roomId}:`, error);",
    replacement: "logger.error(`Error fetching chat room ${roomId}:`, error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 61,
    original: "console.error(\"Error adding chat room member:\", error);",
    replacement: "logger.error(\"Error adding chat room member:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 77,
    original: "console.error(`Error fetching members for room ${roomId}:`, error);",
    replacement: "logger.error(`Error fetching members for room ${roomId}:`, error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 97,
    original: "console.error(\"Error sending chat message:\", error);",
    replacement: "logger.error(\"Error sending chat message:\", error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 126,
    original: "console.error(`Error fetching messages for room ${roomId}:`, error);",
    replacement: "logger.error(`Error fetching messages for room ${roomId}:`, error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 155,
    original: "console.error(`Error fetching chat rooms for user ${userId}:`, error);",
    replacement: "logger.error(`Error fetching chat rooms for user ${userId}:`, error);",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 201,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 258,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 296,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 341,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 376,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 424,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\chat-service-new.ts",
    line: 479,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\services\ai-treatment-generator.ts",
    line: 62,
    original: "console.warn(",
    replacement: "logger.warn(",
    category: "WARN"
  },
  {
    file: "server\services\ai-treatment-generator.ts",
    line: 134,
    original: "console.error(\"Error generating AI treatment plan:\", error);",
    replacement: "logger.error(\"Error generating AI treatment plan:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\waitlist.ts",
    line: 73,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\waitlist.ts",
    line: 83,
    original: "console.error(\"Waitlist registration error:\", error);",
    replacement: "logger.error(\"Waitlist registration error:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\waitlist.ts",
    line: 155,
    original: "console.error(\"Waitlist stats error:\", error);",
    replacement: "logger.error(\"Waitlist stats error:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\waitlist.ts",
    line: 190,
    original: "console.error(\"Waitlist registrations error:\", error);",
    replacement: "logger.error(\"Waitlist registrations error:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\waitlist.ts",
    line: 230,
    original: "console.error(\"Update registration error:\", error);",
    replacement: "logger.error(\"Update registration error:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 17,
    original: "console.log('Single file upload request received');",
    replacement: "logger.info('Single file upload request received');",
    category: "INFO"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 21,
    original: "console.warn('No file was provided in the request');",
    replacement: "logger.warn('No file was provided in the request');",
    category: "WARN"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 27,
    original: "console.log(`Processed file: ${req.file.originalname} -> ${fileUrl}`);",
    replacement: "logger.info(`Processed file: ${req.file.originalname} -> ${fileUrl}`);",
    category: "INFO"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 42,
    original: "console.error('Error uploading file:', error);",
    replacement: "logger.error('Error uploading file:', error);",
    category: "ERROR"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 53,
    original: "console.log('Multiple files upload request received');",
    replacement: "logger.info('Multiple files upload request received');",
    category: "INFO"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 57,
    original: "console.warn('No files were provided in the request');",
    replacement: "logger.warn('No files were provided in the request');",
    category: "WARN"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 61,
    original: "console.log(`Processing ${req.files.length} files for upload`);",
    replacement: "logger.info(`Processing ${req.files.length} files for upload`);",
    category: "INFO"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 67,
    original: "console.log(`Processed file: ${file.originalname} -> ${fileUrl}`);",
    replacement: "logger.info(`Processed file: ${file.originalname} -> ${fileUrl}`);",
    category: "INFO"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 76,
    original: "console.error(`Error processing file ${file.originalname}:`, fileError);",
    replacement: "logger.error(`Error processing file ${file.originalname}:`, fileError);",
    category: "ERROR"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 83,
    original: "console.log(`Successfully processed ${files.length} files`);",
    replacement: "logger.info(`Successfully processed ${files.length} files`);",
    category: "INFO"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 89,
    original: "console.error('Error uploading files:', error);",
    replacement: "logger.error('Error uploading files:', error);",
    category: "ERROR"
  },
  {
    file: "server\routes\upload-routes.ts",
    line: 116,
    original: "console.error('Error extracting tags:', error);",
    replacement: "logger.error('Error extracting tags:', error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 66,
    original: "console.error(\"Error testing Stream Chat connection:\", error);",
    replacement: "logger.error(\"Error testing Stream Chat connection:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 89,
    original: "console.error(\"Error generating Stream Chat token:\", error);",
    replacement: "logger.error(\"Error generating Stream Chat token:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 120,
    original: "console.error(\"Error initializing Stream Chat:\", error);",
    replacement: "logger.error(\"Error initializing Stream Chat:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 176,
    original: "console.error(\"Error creating direct chat:\", error);",
    replacement: "logger.error(\"Error creating direct chat:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 233,
    original: "console.error(\"Error creating group chat:\", error);",
    replacement: "logger.error(\"Error creating group chat:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 258,
    original: "console.error(\"Error fetching channels:\", error);",
    replacement: "logger.error(\"Error fetching channels:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\stream-chat-routes.ts",
    line: 284,
    original: "console.error(\"Error fetching users for chat:\", error);",
    replacement: "logger.error(\"Error fetching users for chat:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\seller.ts",
    line: 39,
    original: "console.error(\"Error fetching sellers:\", error);",
    replacement: "logger.error(\"Error fetching sellers:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\seller.ts",
    line: 89,
    original: "console.error(\"Error fetching seller:\", error);",
    replacement: "logger.error(\"Error fetching seller:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\seller.ts",
    line: 111,
    original: "console.error(\"Error fetching seller listings:\", error);",
    replacement: "logger.error(\"Error fetching seller listings:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 71,
    original: "console.error(\"Error fetching notifications:\", error);",
    replacement: "logger.error(\"Error fetching notifications:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 93,
    original: "console.error(\"Error counting unread notifications:\", error);",
    replacement: "logger.error(\"Error counting unread notifications:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 122,
    original: "console.error(\"Error fetching notification settings:\", error);",
    replacement: "logger.error(\"Error fetching notification settings:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 156,
    original: "console.error(\"Error marking notification as read:\", error);",
    replacement: "logger.error(\"Error marking notification as read:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 193,
    original: "console.error(\"Error archiving notification:\", error);",
    replacement: "logger.error(\"Error archiving notification:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 244,
    original: "console.error(\"Error updating notification settings:\", error);",
    replacement: "logger.error(\"Error updating notification settings:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 322,
    original: "console.error(\"Error creating notification:\", error);",
    replacement: "logger.error(\"Error creating notification:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\notifications.ts",
    line: 354,
    original: "console.error(\"Error sending test email:\", error);",
    replacement: "logger.error(\"Error sending test email:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\maps-config.ts",
    line: 23,
    original: "console.error(\"Error getting maps config:\", error);",
    replacement: "logger.error(\"Error getting maps config:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\health.ts",
    line: 11,
    original: "console.log(\"🧪 Test endpoint called:\", {",
    replacement: "logger.info(\"🧪 Test endpoint called:\", {",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 31,
    original: "console.log(`🔍 [${requestId}] Health check request received:`, {",
    replacement: "logger.info(`🔍 [${requestId}] Health check request received:`, {",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 56,
    original: "console.log(`✅ [${requestId}] Health check successful:`, response);",
    replacement: "logger.info(`✅ [${requestId}] Health check successful:`, response);",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 61,
    original: "console.error(`❌ [${requestId}] Health check failed:`, {",
    replacement: "logger.error(`❌ [${requestId}] Health check failed:`, {",
    category: "ERROR"
  },
  {
    file: "server\routes\health.ts",
    line: 82,
    original: "console.log(`🔍 [${requestId}] Database health check request received:`, {",
    replacement: "logger.info(`🔍 [${requestId}] Database health check request received:`, {",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 106,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 114,
    original: "console.error(`❌ [${requestId}] Database health check failed:`, {",
    replacement: "logger.error(`❌ [${requestId}] Database health check failed:`, {",
    category: "ERROR"
  },
  {
    file: "server\routes\health.ts",
    line: 136,
    original: "console.log(`🔍 [${requestId}] Detailed health check request received:`, {",
    replacement: "logger.info(`🔍 [${requestId}] Detailed health check request received:`, {",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 160,
    original: "console.error(`❌ [${requestId}] Database check failed:`, error);",
    replacement: "logger.error(`❌ [${requestId}] Database check failed:`, error);",
    category: "ERROR"
  },
  {
    file: "server\routes\health.ts",
    line: 185,
    original: "console.log(`✅ [${requestId}] Detailed health check completed:`, response);",
    replacement: "logger.info(`✅ [${requestId}] Detailed health check completed:`, response);",
    category: "INFO"
  },
  {
    file: "server\routes\health.ts",
    line: 190,
    original: "console.error(`❌ [${requestId}] Detailed health check failed:`, {",
    replacement: "logger.error(`❌ [${requestId}] Detailed health check failed:`, {",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 53,
    original: "console.log(\"Setting shared isAuthenticated middleware for Green Socials\");",
    replacement: "logger.info(\"Setting shared isAuthenticated middleware for Green Socials\");",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 129,
    original: "console.error(\"Error fetching profile:\", error);",
    replacement: "logger.error(\"Error fetching profile:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 183,
    original: "console.error(\"Error creating/updating profile:\", error);",
    replacement: "logger.error(\"Error creating/updating profile:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 249,
    original: "console.error(\"Error fetching comments:\", error);",
    replacement: "logger.error(\"Error fetching comments:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 265,
    original: "console.log(\"Using Drizzle query builder API instead of raw SQL\");",
    replacement: "logger.info(\"Using Drizzle query builder API instead of raw SQL\");",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 337,
    original: "console.log(`Fetched comments for post ${row.id}:`, commentResults);",
    replacement: "logger.info(`Fetched comments for post ${row.id}:`, commentResults);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 341,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 370,
    original: "console.error(\"Error fetching comments for post:\", row.id, error);",
    replacement: "logger.error(\"Error fetching comments for post:\", row.id, error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 411,
    original: "console.error(\"Error in feed query execution:\", queryError);",
    replacement: "logger.error(\"Error in feed query execution:\", queryError);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 415,
    original: "console.error(\"Error fetching feed:\", error);",
    replacement: "logger.error(\"Error fetching feed:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 424,
    original: "console.log(\"Creating new social post\");",
    replacement: "logger.info(\"Creating new social post\");",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 428,
    original: "console.error(\"User not authenticated in post creation\");",
    replacement: "logger.error(\"User not authenticated in post creation\");",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 435,
    original: "console.log(\"Received post payload:\", {",
    replacement: "logger.info(\"Received post payload:\", {",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 451,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 460,
    original: "console.log(\"First media item structure:\", req.body.media[0]);",
    replacement: "logger.info(\"First media item structure:\", req.body.media[0]);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 463,
    original: "console.log(\"Media is not an array:\", typeof req.body.media);",
    replacement: "logger.info(\"Media is not an array:\", typeof req.body.media);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 475,
    original: "console.log(\"Media prepared for SQL storage as JSONB\");",
    replacement: "logger.info(\"Media prepared for SQL storage as JSONB\");",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 477,
    original: "console.error(\"Error preparing media for storage:\", error);",
    replacement: "logger.error(\"Error preparing media for storage:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 577,
    original: "console.error(\"Error creating post:\", error);",
    replacement: "logger.error(\"Error creating post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 699,
    original: "console.error(\"Error fetching post:\", error);",
    replacement: "logger.error(\"Error fetching post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 710,
    original: "console.error(\"User not authenticated in comment creation\");",
    replacement: "logger.error(\"User not authenticated in comment creation\");",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 715,
    original: "console.log(\"Creating comment using Drizzle query builder\");",
    replacement: "logger.info(\"Creating comment using Drizzle query builder\");",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 716,
    original: "console.log(\"Comment data:\", {",
    replacement: "logger.info(\"Comment data:\", {",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 910,
    original: "console.error(\"Failed to create notification for comment/reply:\", error);",
    replacement: "logger.error(\"Failed to create notification for comment/reply:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 915,
    original: "console.error(\"Error creating comment:\", error);",
    replacement: "logger.error(\"Error creating comment:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 944,
    original: "console.error(\"Error fetching communities:\", error);",
    replacement: "logger.error(\"Error fetching communities:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1005,
    original: "console.error(\"Error fetching community:\", error);",
    replacement: "logger.error(\"Error fetching community:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1074,
    original: "console.error(\"Error creating community:\", error);",
    replacement: "logger.error(\"Error creating community:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1093,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1119,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1125,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1181,
    original: "console.error(\"Failed to create notification for new follower:\", error);",
    replacement: "logger.error(\"Failed to create notification for new follower:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1188,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1195,
    original: "console.error(\"Error following user:\", error);",
    replacement: "logger.error(\"Error following user:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1215,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1241,
    original: "console.log(`User ${followerId} is not following user ${followedId}`);",
    replacement: "logger.info(`User ${followerId} is not following user ${followedId}`);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1245,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1275,
    original: "console.error(\"Error unfollowing user:\", error);",
    replacement: "logger.error(\"Error unfollowing user:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1294,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1304,
    original: "console.log(`DEBUG: Found ${relationshipCount[0].count} following users`);",
    replacement: "logger.debug(`DEBUG: Found ${relationshipCount[0].count} following users`);",
    category: "DEBUG"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1334,
    original: "console.log(`DEBUG: Found ${following.length} following users`);",
    replacement: "logger.debug(`DEBUG: Found ${following.length} following users`);",
    category: "DEBUG"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1336,
    original: "console.log(\"DEBUG: Formatted following:\", JSON.stringify(following));",
    replacement: "logger.debug(\"DEBUG: Formatted following:\", JSON.stringify(following));",
    category: "DEBUG"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1340,
    original: "console.error(\"Error fetching following users:\", error);",
    replacement: "logger.error(\"Error fetching following users:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1384,
    original: "console.error(\"Error fetching followers:\", error);",
    replacement: "logger.error(\"Error fetching followers:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1400,
    original: "console.log(`DEBUG: Looking for users that are not user id ${userId}`);",
    replacement: "logger.debug(`DEBUG: Looking for users that are not user id ${userId}`);",
    category: "DEBUG"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1403,
    original: "console.log(`Getting followed user IDs for user ${userId}`);",
    replacement: "logger.info(`Getting followed user IDs for user ${userId}`);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1424,
    original: "console.log(`User ${userId} is following these users:`, followedUserIds);",
    replacement: "logger.info(`User ${userId} is following these users:`, followedUserIds);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1430,
    original: "console.log(`Getting users not in: ${followedIdsStringForSql}`);",
    replacement: "logger.info(`Getting users not in: ${followedIdsStringForSql}`);",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1462,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1467,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1470,
    original: "console.log(\"Formatted results:\", JSON.stringify(formattedResults));",
    replacement: "logger.info(\"Formatted results:\", JSON.stringify(formattedResults));",
    category: "INFO"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1474,
    original: "console.error(\"Error fetching suggested users:\", error);",
    replacement: "logger.error(\"Error fetching suggested users:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1560,
    original: "console.error(\"Error fetching activity:\", error);",
    replacement: "logger.error(\"Error fetching activity:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1604,
    original: "console.error(\"Error fetching expertise categories:\", error);",
    replacement: "logger.error(\"Error fetching expertise categories:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1714,
    original: "console.error(\"Failed to create notification for post like:\", error);",
    replacement: "logger.error(\"Failed to create notification for post like:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1720,
    original: "console.error(\"Error liking post:\", error);",
    replacement: "logger.error(\"Error liking post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1768,
    original: "console.error(\"Error unliking post:\", error);",
    replacement: "logger.error(\"Error unliking post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1876,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1886,
    original: "console.error(\"Error liking comment:\", error);",
    replacement: "logger.error(\"Error liking comment:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 1934,
    original: "console.error(\"Error unliking comment:\", error);",
    replacement: "logger.error(\"Error unliking comment:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2040,
    original: "console.error(\"Failed to create notification for post share:\", error);",
    replacement: "logger.error(\"Failed to create notification for post share:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2046,
    original: "console.error(\"Error sharing post:\", error);",
    replacement: "logger.error(\"Error sharing post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2112,
    original: "console.error(\"Error reporting post:\", error);",
    replacement: "logger.error(\"Error reporting post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2178,
    original: "console.error(\"Error reporting comment:\", error);",
    replacement: "logger.error(\"Error reporting comment:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2281,
    original: "console.error(\"Failed to create notification for post save:\", error);",
    replacement: "logger.error(\"Failed to create notification for post save:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2287,
    original: "console.error(\"Error saving post:\", error);",
    replacement: "logger.error(\"Error saving post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\green-socials.ts",
    line: 2336,
    original: "console.error(\"Error unsaving post:\", error);",
    replacement: "logger.error(\"Error unsaving post:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\fields.ts",
    line: 25,
    original: "console.error(\"Error fetching fields:\", error);",
    replacement: "logger.error(\"Error fetching fields:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\fields.ts",
    line: 106,
    original: "console.error(\"Error fetching fields with locations:\", error);",
    replacement: "logger.error(\"Error fetching fields with locations:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\fields.ts",
    line: 133,
    original: "console.error(\"Error fetching field:\", error);",
    replacement: "logger.error(\"Error fetching field:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\fields.ts",
    line: 183,
    original: "console.error(\"Error creating field:\", error);",
    replacement: "logger.error(\"Error creating field:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\fields.ts",
    line: 237,
    original: "console.error(\"Error updating field:\", error);",
    replacement: "logger.error(\"Error updating field:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\fields.ts",
    line: 263,
    original: "console.error(\"Error deleting field:\", error);",
    replacement: "logger.error(\"Error deleting field:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\farming-assistant.ts",
    line: 96,
    original: "console.error(\"Error in farming assistant endpoint:\", error);",
    replacement: "logger.error(\"Error in farming assistant endpoint:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\farming-assistant.ts",
    line: 174,
    original: "console.error(\"Error in farming assistant endpoint:\", error);",
    replacement: "logger.error(\"Error in farming assistant endpoint:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\farming-assistant.ts",
    line: 222,
    original: "console.error(\"Error fetching farming context:\", error);",
    replacement: "logger.error(\"Error fetching farming context:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\email.ts",
    line: 46,
    original: "console.error(\"Error sending test email:\", error);",
    replacement: "logger.error(\"Error sending test email:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\email.ts",
    line: 176,
    original: "console.error(\"Error sending professional email:\", error);",
    replacement: "logger.error(\"Error sending professional email:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\email.ts",
    line: 221,
    original: "console.error(\"Error sending test SMS:\", error);",
    replacement: "logger.error(\"Error sending test SMS:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\email.ts",
    line: 286,
    original: "console.error(\"Error creating test notification:\", error);",
    replacement: "logger.error(\"Error creating test notification:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\email.ts",
    line: 307,
    original: "console.log(\"Getting users with SMS enabled...\");",
    replacement: "logger.info(\"Getting users with SMS enabled...\");",
    category: "INFO"
  },
  {
    file: "server\routes\email.ts",
    line: 403,
    original: "console.error(\"Error broadcasting SMS:\", error);",
    replacement: "logger.error(\"Error broadcasting SMS:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\croptrace.ts",
    line: 48,
    original: "console.error(\"Error initializing crop traceability:\", error);",
    replacement: "logger.error(\"Error initializing crop traceability:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\croptrace.ts",
    line: 96,
    original: "console.error(\"Error recording crop event:\", error);",
    replacement: "logger.error(\"Error recording crop event:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\croptrace.ts",
    line: 153,
    original: "console.error(\"Error linking listing to crop:\", error);",
    replacement: "logger.error(\"Error linking listing to crop:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\croptrace.ts",
    line: 186,
    original: "console.error(\"Error getting crop traceability history:\", error);",
    replacement: "logger.error(\"Error getting crop traceability history:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\croptrace.ts",
    line: 225,
    original: "console.error(\"Error getting crop events:\", error);",
    replacement: "logger.error(\"Error getting crop events:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\crop-activities.ts",
    line: 17,
    original: "console.error(\"Failed to get crop activities:\", error);",
    replacement: "logger.error(\"Failed to get crop activities:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\crop-activities.ts",
    line: 38,
    original: "console.error(\"Failed to get crop activities:\", error);",
    replacement: "logger.error(\"Failed to get crop activities:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 46,
    original: "console.log(`Found active cart for user ${userId}, id: ${activeCart.id}`);",
    replacement: "logger.info(`Found active cart for user ${userId}, id: ${activeCart.id}`);",
    category: "INFO"
  },
  {
    file: "server\routes\cart.ts",
    line: 58,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\cart.ts",
    line: 66,
    original: "console.log(`Creating new cart for user ${userId}`);",
    replacement: "logger.info(`Creating new cart for user ${userId}`);",
    category: "INFO"
  },
  {
    file: "server\routes\cart.ts",
    line: 139,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\cart.ts",
    line: 152,
    original: "console.error(\"Error fetching cart:\", error);",
    replacement: "logger.error(\"Error fetching cart:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 229,
    original: "console.error(\"Error adding item to cart:\", error);",
    replacement: "logger.error(\"Error adding item to cart:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 292,
    original: "console.error(\"Error updating cart item:\", error);",
    replacement: "logger.error(\"Error updating cart item:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 340,
    original: "console.error(\"Error removing item from cart:\", error);",
    replacement: "logger.error(\"Error removing item from cart:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 365,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "server\routes\cart.ts",
    line: 412,
    original: "console.error(\"Error clearing cart:\", error);",
    replacement: "logger.error(\"Error clearing cart:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 460,
    original: "console.error(\"Error starting checkout:\", error);",
    replacement: "logger.error(\"Error starting checkout:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 512,
    original: "console.error(\"Error creating Stripe payment intent:\", error);",
    replacement: "logger.error(\"Error creating Stripe payment intent:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 565,
    original: "console.error(\"Error creating Metatron Pay intent:\", error);",
    replacement: "logger.error(\"Error creating Metatron Pay intent:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\cart.ts",
    line: 632,
    original: "console.error(\"Error confirming payment:\", error);",
    replacement: "logger.error(\"Error confirming payment:\", error);",
    category: "ERROR"
  },
  {
    file: "server\routes\admin.ts",
    line: 321,
    original: "console.error(\"Detailed error:\", error);",
    replacement: "logger.error(\"Detailed error:\", error);",
    category: "ERROR"
  },
  {
    file: "server\payment\stripe.ts",
    line: 52,
    original: "console.error(\"Error creating Stripe payment intent:\", error);",
    replacement: "logger.error(\"Error creating Stripe payment intent:\", error);",
    category: "ERROR"
  },
  {
    file: "server\payment\stripe.ts",
    line: 84,
    original: "console.error(\"Error confirming Stripe payment:\", error);",
    replacement: "logger.error(\"Error confirming Stripe payment:\", error);",
    category: "ERROR"
  },
  {
    file: "server\payment\metatronPay.ts",
    line: 29,
    original: "console.error('Error creating Metatron Pay intent:', error);",
    replacement: "logger.error('Error creating Metatron Pay intent:', error);",
    category: "ERROR"
  },
  {
    file: "server\payment\metatronPay.ts",
    line: 61,
    original: "console.error('Error verifying Metatron payment:', error);",
    replacement: "logger.error('Error verifying Metatron payment:', error);",
    category: "ERROR"
  },
  {
    file: "server\models\HealthModel.ts",
    line: 117,
    original: "console.error(`❌ [${requestId}] Database check failed:`, error);",
    replacement: "logger.error(`❌ [${requestId}] Database check failed:`, error);",
    category: "ERROR"
  },
  {
    file: "server\lib\logger.ts",
    line: 53,
    original: "console.warn(\"Could not create logs directory:\", error);",
    replacement: "logger.warn(\"Could not create logs directory:\", error);",
    category: "WARN"
  },
  {
    file: "server\lib\errors.ts",
    line: 54,
    original: "console.error(\"Error:\", {",
    replacement: "logger.error(\"Error:\", {",
    category: "ERROR"
  },
  {
    file: "server\controllers\ProductVerificationController.ts",
    line: 38,
    original: "console.error(\"Error verifying batch:\", error);",
    replacement: "logger.error(\"Error verifying batch:\", error);",
    category: "ERROR"
  },
  {
    file: "server\controllers\ProductVerificationController.ts",
    line: 66,
    original: "console.error(\"Error verifying batch:\", error);",
    replacement: "logger.error(\"Error verifying batch:\", error);",
    category: "ERROR"
  },
  {
    file: "server\controllers\ProductVerificationController.ts",
    line: 84,
    original: "console.error(\"Error getting scannable products:\", error);",
    replacement: "logger.error(\"Error getting scannable products:\", error);",
    category: "ERROR"
  },
  {
    file: "server\controllers\ProductVerificationController.ts",
    line: 101,
    original: "console.error(\"Error getting scannable crops:\", error);",
    replacement: "logger.error(\"Error getting scannable crops:\", error);",
    category: "ERROR"
  },
  {
    file: "server\controllers\ProductVerificationController.ts",
    line: 120,
    original: "console.error(\"Error getting scannable listings:\", error);",
    replacement: "logger.error(\"Error getting scannable listings:\", error);",
    category: "ERROR"
  },
  {
    file: "server\controllers\ProductVerificationController.ts",
    line: 156,
    original: "console.error(\"Error getting crop traceability history:\", error);",
    replacement: "logger.error(\"Error getting crop traceability history:\", error);",
    category: "ERROR"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 207,
    original: "console.log(\"=== CREATE LISTING DEBUG ===\");",
    replacement: "logger.debug(\"=== CREATE LISTING DEBUG ===\");",
    category: "DEBUG"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 208,
    original: "console.log(\"Content-Type:\", req.headers[\"content-type\"]);",
    replacement: "logger.info(\"Content-Type:\", req.headers[\"content-type\"]);",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 209,
    original: "console.log(\"req.body:\", req.body);",
    replacement: "logger.info(\"req.body:\", req.body);",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 210,
    original: "console.log(\"req.body type:\", typeof req.body);",
    replacement: "logger.info(\"req.body type:\", typeof req.body);",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 211,
    original: "console.log(\"req.body keys:\", Object.keys(req.body || {}));",
    replacement: "logger.info(\"req.body keys:\", Object.keys(req.body || {}));",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 212,
    original: "console.log(\"req.files:\", req.files);",
    replacement: "logger.info(\"req.files:\", req.files);",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 219,
    original: "console.log(\"Processing FormData...\");",
    replacement: "logger.info(\"Processing FormData...\");",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 249,
    original: "console.log(\"Parsed data:\", parsedData);",
    replacement: "logger.info(\"Parsed data:\", parsedData);",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 256,
    original: "console.log(\"Validated listing data:\", listingData);",
    replacement: "logger.info(\"Validated listing data:\", listingData);",
    category: "INFO"
  },
  {
    file: "server\controllers\MarketplaceController.ts",
    line: 283,
    original: "console.log(\"Model data:\", modelData);",
    replacement: "logger.info(\"Model data:\", modelData);",
    category: "INFO"
  },
  {
    file: "client\public\firebase-messaging-sw.js",
    line: 20,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\public\firebase-messaging-sw.js",
    line: 47,
    original: "console.log(\"[firebase-messaging-sw.js] Notification click received.\");",
    replacement: "logger.info(\"[firebase-messaging-sw.js] Notification click received.\");",
    category: "INFO"
  },
  {
    file: "client\src\service-worker.ts",
    line: 298,
    original: "console.error('Error syncing form data:', error);",
    replacement: "logger.error('Error syncing form data:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\service-worker-registration.ts",
    line: 14,
    original: "console.log('Service Worker registered with scope:', registration.scope);",
    replacement: "logger.info('Service Worker registered with scope:', registration.scope);",
    category: "INFO"
  },
  {
    file: "client\src\service-worker-registration.ts",
    line: 28,
    original: "console.log('New content is available; please refresh.');",
    replacement: "logger.info('New content is available; please refresh.');",
    category: "INFO"
  },
  {
    file: "client\src\service-worker-registration.ts",
    line: 42,
    original: "console.log('Content is cached for offline use.');",
    replacement: "logger.info('Content is cached for offline use.');",
    category: "INFO"
  },
  {
    file: "client\src\service-worker-registration.ts",
    line: 49,
    original: "console.error('Error during service worker registration:', error);",
    replacement: "logger.error('Error during service worker registration:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\service-worker-registration.ts",
    line: 71,
    original: "console.error(error.message);",
    replacement: "logger.error(error.message);",
    category: "ERROR"
  },
  {
    file: "client\src\service-worker-registration.ts",
    line: 81,
    original: "console.log('Service worker file will be handled by build process');",
    replacement: "logger.info('Service worker file will be handled by build process');",
    category: "INFO"
  },
  {
    file: "client\src\firebase.ts",
    line: 20,
    original: "console.error(\"FCM permission/token error:\", err);",
    replacement: "logger.error(\"FCM permission/token error:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 6,
    original: "console.error(`API Error: ${res.status}: ${text}`);",
    replacement: "logger.error(`API Error: ${res.status}: ${text}`);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 31,
    original: "console.log(`Making ${method} request to: ${url}`);",
    replacement: "logger.info(`Making ${method} request to: ${url}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 43,
    original: "console.log(`Response status: ${res.status}`);",
    replacement: "logger.info(`Response status: ${res.status}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 44,
    original: "console.log(`Response cookies present: ${!!document.cookie}`);",
    replacement: "logger.info(`Response cookies present: ${!!document.cookie}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 46,
    original: "console.log(`Cookie length: ${document.cookie.length}`);",
    replacement: "logger.info(`Cookie length: ${document.cookie.length}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 51,
    original: "console.error(`API error: ${res.status}`, text);",
    replacement: "logger.error(`API error: ${res.status}`, text);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 81,
    original: "console.error(`Request error for ${method} ${url}:`, error);",
    replacement: "logger.error(`Request error for ${method} ${url}:`, error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 92,
    original: "console.log(`Executing query for: ${queryKey[0]}`);",
    replacement: "logger.info(`Executing query for: ${queryKey[0]}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 93,
    original: "console.log(`Cookies present: ${!!document.cookie}`);",
    replacement: "logger.info(`Cookies present: ${!!document.cookie}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 102,
    original: "console.log(`Query response status: ${res.status}`);",
    replacement: "logger.info(`Query response status: ${res.status}`);",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 104,
    original: "console.log(\"Authentication failed for request\");",
    replacement: "logger.info(\"Authentication failed for request\");",
    category: "INFO"
  },
  {
    file: "client\src\lib\queryClient.ts",
    line: 106,
    original: "console.log(\"Request authenticated successfully\");",
    replacement: "logger.info(\"Request authenticated successfully\");",
    category: "INFO"
  },
  {
    file: "client\src\lib\protected-route.tsx",
    line: 28,
    original: "console.log(\"Protected route: No user found, attempting to refetch...\");",
    replacement: "logger.info(\"Protected route: No user found, attempting to refetch...\");",
    category: "INFO"
  },
  {
    file: "client\src\lib\protected-route.tsx",
    line: 32,
    original: "console.error(\"Error refetching user data:\", error);",
    replacement: "logger.error(\"Error refetching user data:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\protected-route.tsx",
    line: 61,
    original: "console.warn(",
    replacement: "logger.warn(",
    category: "WARN"
  },
  {
    file: "client\src\lib\protected-route.tsx",
    line: 78,
    original: "console.warn(",
    replacement: "logger.warn(",
    category: "WARN"
  },
  {
    file: "client\src\lib\protected-route.tsx",
    line: 94,
    original: "console.warn(",
    replacement: "logger.warn(",
    category: "WARN"
  },
  {
    file: "client\src\lib\indexedDb.ts",
    line: 135,
    original: "console.error('Error retrieving weather data from IndexedDB:', error);",
    replacement: "logger.error('Error retrieving weather data from IndexedDB:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\indexedDb.ts",
    line: 155,
    original: "console.error('Error retrieving weather preferences from IndexedDB:', error);",
    replacement: "logger.error('Error retrieving weather preferences from IndexedDB:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\indexedDb.ts",
    line: 181,
    original: "console.error('Error retrieving crops from IndexedDB:', error);",
    replacement: "logger.error('Error retrieving crops from IndexedDB:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\indexedDb.ts",
    line: 203,
    original: "console.error('Error retrieving form data from IndexedDB:', error);",
    replacement: "logger.error('Error retrieving form data from IndexedDB:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\indexedDb.ts",
    line: 254,
    original: "console.error('Error retrieving AI Assistant messages from IndexedDB:', error);",
    replacement: "logger.error('Error retrieving AI Assistant messages from IndexedDB:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\lib\indexedDb.ts",
    line: 273,
    original: "console.error('Error retrieving AI Assistant sessions from IndexedDB:', error);",
    replacement: "logger.error('Error retrieving AI Assistant sessions from IndexedDB:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\UploadTestPage.tsx",
    line: 53,
    original: "console.log(\"Uploading single file:\", file.name);",
    replacement: "logger.info(\"Uploading single file:\", file.name);",
    category: "INFO"
  },
  {
    file: "client\src\pages\UploadTestPage.tsx",
    line: 68,
    original: "console.log(\"Single upload response:\", data);",
    replacement: "logger.info(\"Single upload response:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\pages\UploadTestPage.tsx",
    line: 79,
    original: "console.error(\"Single upload error:\", error);",
    replacement: "logger.error(\"Single upload error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\UploadTestPage.tsx",
    line: 118,
    original: "console.log(`Uploading ${e.target.files.length} files as batch`);",
    replacement: "logger.info(`Uploading ${e.target.files.length} files as batch`);",
    category: "INFO"
  },
  {
    file: "client\src\pages\UploadTestPage.tsx",
    line: 133,
    original: "console.log(\"Multiple upload response:\", data);",
    replacement: "logger.info(\"Multiple upload response:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\pages\UploadTestPage.tsx",
    line: 144,
    original: "console.error(\"Multiple upload error:\", error);",
    replacement: "logger.error(\"Multiple upload error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\PublicSellersPage.tsx",
    line: 75,
    original: "console.error(\"Error fetching sellers:\", response.status, response.statusText);",
    replacement: "logger.error(\"Error fetching sellers:\", response.status, response.statusText);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\PublicSellerProfilePage.tsx",
    line: 131,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\PublicSellerProfilePage.tsx",
    line: 154,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\PublicEmailTestPage.tsx",
    line: 82,
    original: "console.error(\"Error sending test email:\", error);",
    replacement: "logger.error(\"Error sending test email:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\PublicEmailTestPage.tsx",
    line: 142,
    original: "console.error(\"Error sending social notification:\", error);",
    replacement: "logger.error(\"Error sending social notification:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\profile-creation-page.tsx",
    line: 81,
    original: "console.error('Error fetching profile:', error);",
    replacement: "logger.error('Error fetching profile:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 183,
    original: "console.log(\"Could not extract media URL from:\", media);",
    replacement: "logger.info(\"Could not extract media URL from:\", media);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 192,
    original: "console.log(\"Processing URL:\", url);",
    replacement: "logger.info(\"Processing URL:\", url);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 207,
    original: "console.log(\"Image URL constructed:\", fullUrl);",
    replacement: "logger.info(\"Image URL constructed:\", fullUrl);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 214,
    original: "console.log(\"Fixed uploads URL:\", fullUrl);",
    replacement: "logger.info(\"Fixed uploads URL:\", fullUrl);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 225,
    original: "console.log(\"Corrected API uploads URL:\", fullUrl);",
    replacement: "logger.info(\"Corrected API uploads URL:\", fullUrl);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 233,
    original: "console.log(\"Constructed URL:\", fullUrl);",
    replacement: "logger.info(\"Constructed URL:\", fullUrl);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 239,
    original: "console.log(\"Added leading slash to URL:\", fullUrl);",
    replacement: "logger.info(\"Added leading slash to URL:\", fullUrl);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 268,
    original: "if (feed) console.log(feed);",
    replacement: "if (feed) logger.info(feed);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 348,
    original: "console.log(\"Creating post with the provided payload:\");",
    replacement: "logger.info(\"Creating post with the provided payload:\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 349,
    original: "console.log(JSON.stringify(payload, null, 2));",
    replacement: "logger.info(JSON.stringify(payload, null, 2));",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 354,
    original: "console.log(\"Post creation response status:\", res.status);",
    replacement: "logger.info(\"Post creation response status:\", res.status);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 359,
    original: "console.error(\"Post creation error details:\", errorText);",
    replacement: "logger.error(\"Post creation error details:\", errorText);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 364,
    original: "console.log(\"Post creation response:\", responseData);",
    replacement: "logger.info(\"Post creation response:\", responseData);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 822,
    original: "console.log(\"Upload response:\", data);",
    replacement: "logger.info(\"Upload response:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 826,
    original: "console.log(\"Processed URL for upload:\", processedUrl);",
    replacement: "logger.info(\"Processed URL for upload:\", processedUrl);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 843,
    original: "console.error(\"Upload error:\", error);",
    replacement: "logger.error(\"Upload error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 922,
    original: "console.log(`Uploading ${files.length} files as batch`);",
    replacement: "logger.info(`Uploading ${files.length} files as batch`);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 936,
    original: "console.log(\"Multiple upload response:\", data);",
    replacement: "logger.info(\"Multiple upload response:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 960,
    original: "console.error(\"Multiple upload error:\", error);",
    replacement: "logger.error(\"Multiple upload error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 982,
    original: "console.log(\"Creating post with the following content:\");",
    replacement: "logger.info(\"Creating post with the following content:\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 983,
    original: "console.log(\"- Content:\", newPostContent);",
    replacement: "logger.info(\"- Content:\", newPostContent);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 984,
    original: "console.log(\"- Post type:\", postType);",
    replacement: "logger.info(\"- Post type:\", postType);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 985,
    original: "console.log(\"- Visibility:\", postVisibility);",
    replacement: "logger.info(\"- Visibility:\", postVisibility);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 986,
    original: "console.log(\"- Media items count:\", mediaUrls.length);",
    replacement: "logger.info(\"- Media items count:\", mediaUrls.length);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 990,
    original: "console.log(\"Media items details:\");",
    replacement: "logger.info(\"Media items details:\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 992,
    original: "console.log(`Media ${index + 1}:`, {",
    replacement: "logger.info(`Media ${index + 1}:`, {",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1000,
    original: "console.log(\"- Hashtags:\", hashtags);",
    replacement: "logger.info(\"- Hashtags:\", hashtags);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1001,
    original: "console.log(\"- Crops Tags:\", cropsTags);",
    replacement: "logger.info(\"- Crops Tags:\", cropsTags);",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1013,
    original: "console.log(\"Full post payload:\", JSON.stringify(payload, null, 2));",
    replacement: "logger.info(\"Full post payload:\", JSON.stringify(payload, null, 2));",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1763,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1771,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1787,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1807,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1815,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1867,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1875,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1925,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 1933,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2289,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2296,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2310,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2327,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2334,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2373,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2381,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2429,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2437,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2496,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2523,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\GreenSocialsPage.tsx",
    line: 2656,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\FarmingAssistantPage.tsx",
    line: 124,
    original: "console.error(\"Error loading sessions:\", error);",
    replacement: "logger.error(\"Error loading sessions:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\FarmingAssistantPage.tsx",
    line: 148,
    original: "console.error(\"Error loading messages for session:\", error);",
    replacement: "logger.error(\"Error loading messages for session:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\FarmingAssistantPage.tsx",
    line: 171,
    original: "console.error(\"Error deleting session:\", error);",
    replacement: "logger.error(\"Error deleting session:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\dashboard-page.tsx",
    line: 68,
    original: "console.error(\"Error fetching farmer profile:\", error);",
    replacement: "logger.error(\"Error fetching farmer profile:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\dashboard-page.tsx",
    line: 84,
    original: "console.error(\"Error fetching fields:\", error);",
    replacement: "logger.error(\"Error fetching fields:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\dashboard-page.tsx",
    line: 100,
    original: "console.error(\"Error fetching crops:\", error);",
    replacement: "logger.error(\"Error fetching crops:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\dashboard-page.tsx",
    line: 117,
    original: "console.error(\"Error fetching tasks:\", error);",
    replacement: "logger.error(\"Error fetching tasks:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\dashboard-page.tsx",
    line: 140,
    original: "console.error(\"Error fetching weather:\", error);",
    replacement: "logger.error(\"Error fetching weather:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\auth-page.tsx",
    line: 197,
    original: "console.log(\"Login successful, explicitly refetching user data\");",
    replacement: "logger.info(\"Login successful, explicitly refetching user data\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\auth-page.tsx",
    line: 558,
    original: "console.log(\"Registration successful, explicitly refetching user data\");",
    replacement: "logger.info(\"Registration successful, explicitly refetching user data\");",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-websocket.tsx",
    line: 21,
    original: "console.log('WebSocket reconnect attempted, but WebSockets are disabled');",
    replacement: "logger.info('WebSocket reconnect attempted, but WebSockets are disabled');",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 30,
    original: "console.log('Creating weather preferences with data:', data);",
    replacement: "logger.info('Creating weather preferences with data:', data);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 36,
    original: "console.error('Server error response:', errorText);",
    replacement: "logger.error('Server error response:', errorText);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 41,
    original: "console.log('Create response:', jsonResponse);",
    replacement: "logger.info('Create response:', jsonResponse);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 44,
    original: "console.error('Error creating weather preferences:', error);",
    replacement: "logger.error('Error creating weather preferences:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 49,
    original: "console.log('Weather preferences successfully created:', data);",
    replacement: "logger.info('Weather preferences successfully created:', data);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 58,
    original: "console.error('Error in create mutation:', error);",
    replacement: "logger.error('Error in create mutation:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 70,
    original: "console.log('Updating weather preferences with data:', data);",
    replacement: "logger.info('Updating weather preferences with data:', data);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 77,
    original: "console.error('Server error response:', errorText);",
    replacement: "logger.error('Server error response:', errorText);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 82,
    original: "console.log('Update response:', jsonResponse);",
    replacement: "logger.info('Update response:', jsonResponse);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 85,
    original: "console.error('Error updating weather preferences:', error);",
    replacement: "logger.error('Error updating weather preferences:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 90,
    original: "console.log('Weather preferences successfully updated:', data);",
    replacement: "logger.info('Weather preferences successfully updated:', data);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-weather-preferences.tsx",
    line: 99,
    original: "console.error('Error in update mutation:', error);",
    replacement: "logger.error('Error in update mutation:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 53,
    original: "console.log('Initializing Stream Chat with authenticated user:', user.id);",
    replacement: "logger.info('Initializing Stream Chat with authenticated user:', user.id);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 97,
    original: "console.log('Stream Chat initialized successfully');",
    replacement: "logger.info('Stream Chat initialized successfully');",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 99,
    original: "console.error('Error initializing Stream Chat:', err);",
    replacement: "logger.error('Error initializing Stream Chat:', err);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 125,
    original: "console.log('Stream Chat disconnected successfully');",
    replacement: "logger.info('Stream Chat disconnected successfully');",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 127,
    original: "console.error('Error disconnecting Stream Chat:', err);",
    replacement: "logger.error('Error disconnecting Stream Chat:', err);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 164,
    original: "console.error('Error creating direct channel:', err);",
    replacement: "logger.error('Error creating direct channel:', err);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-stream-chat.tsx",
    line: 205,
    original: "console.error('Error creating group channel:', err);",
    replacement: "logger.error('Error creating group channel:', err);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-socketio.tsx",
    line: 27,
    original: "console.log('Socket.IO connect attempted, but Socket.IO is disabled');",
    replacement: "logger.info('Socket.IO connect attempted, but Socket.IO is disabled');",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-socketio.tsx",
    line: 31,
    original: "console.log('Socket.IO disconnect called, but Socket.IO is disabled');",
    replacement: "logger.info('Socket.IO disconnect called, but Socket.IO is disabled');",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-notifications.tsx",
    line: 65,
    original: "console.log(\"WebSocket connected - real-time notifications active\");",
    replacement: "logger.info(\"WebSocket connected - real-time notifications active\");",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-notifications.tsx",
    line: 69,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-global-search.ts",
    line: 54,
    original: "console.error(\"Error loading recent searches:\", error);",
    replacement: "logger.error(\"Error loading recent searches:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 58,
    original: "console.log(\"Cart data fetched:\", data);",
    replacement: "logger.info(\"Cart data fetched:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 210,
    original: "console.error(\"Error adding to cart:\", error);",
    replacement: "logger.error(\"Error adding to cart:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 218,
    original: "console.error(\"Error updating quantity:\", error);",
    replacement: "logger.error(\"Error updating quantity:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 226,
    original: "console.error(\"Error removing from cart:\", error);",
    replacement: "logger.error(\"Error removing from cart:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 234,
    original: "console.error(\"Error clearing cart:\", error);",
    replacement: "logger.error(\"Error clearing cart:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 243,
    original: "console.error(\"Error starting checkout:\", error);",
    replacement: "logger.error(\"Error starting checkout:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 331,
    original: "console.error(\"Error creating Stripe payment:\", error);",
    replacement: "logger.error(\"Error creating Stripe payment:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 340,
    original: "console.error(\"Error creating Metatron payment:\", error);",
    replacement: "logger.error(\"Error creating Metatron payment:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-cart.tsx",
    line: 349,
    original: "console.error(\"Error confirming payment:\", error);",
    replacement: "logger.error(\"Error confirming payment:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\hooks\use-auth.tsx",
    line: 59,
    original: "console.log(\"No user data available, refetching\");",
    replacement: "logger.info(\"No user data available, refetching\");",
    category: "INFO"
  },
  {
    file: "client\src\hooks\use-auth.tsx",
    line: 73,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\components\SmsTestPanel.tsx",
    line: 61,
    original: "console.error(\"Error testing SMS:\", error);",
    replacement: "logger.error(\"Error testing SMS:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\SmsTestPanel.tsx",
    line: 99,
    original: "console.log(\"Broadcast results:\", data.results);",
    replacement: "logger.info(\"Broadcast results:\", data.results);",
    category: "INFO"
  },
  {
    file: "client\src\components\SmsTestPanel.tsx",
    line: 109,
    original: "console.error(\"Error broadcasting SMS:\", error);",
    replacement: "logger.error(\"Error broadcasting SMS:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\QRCodeScanner.tsx",
    line: 73,
    original: "console.log(\"QR scan error:\", errorMessage);",
    replacement: "logger.info(\"QR scan error:\", errorMessage);",
    category: "INFO"
  },
  {
    file: "client\src\components\QRCodeScanner.tsx",
    line: 80,
    original: "console.error(\"Failed to initialize scanner:\", err);",
    replacement: "logger.error(\"Failed to initialize scanner:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\ProfessionalEmailTestPanel.tsx",
    line: 102,
    original: "console.error(\"Error sending professional email:\", error);",
    replacement: "logger.error(\"Error sending professional email:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\FileUploadTest.tsx",
    line: 56,
    original: "console.error('Upload error:', error);",
    replacement: "logger.error('Upload error:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\FileUploadTest.tsx",
    line: 85,
    original: "console.error('Test error:', error);",
    replacement: "logger.error('Test error:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 29,
    original: "console.log('Sending basic test email request');",
    replacement: "logger.info('Sending basic test email request');",
    category: "INFO"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 31,
    original: "console.log('Test email response:', response);",
    replacement: "logger.info('Test email response:', response);",
    category: "INFO"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 33,
    original: "console.log('Test email data:', data);",
    replacement: "logger.info('Test email data:', data);",
    category: "INFO"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 48,
    original: "console.error('Error testing email:', error);",
    replacement: "logger.error('Error testing email:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 62,
    original: "console.log('Sending social notification test request:', { activityType });",
    replacement: "logger.info('Sending social notification test request:', { activityType });",
    category: "INFO"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 64,
    original: "console.log('Social notification test response:', response);",
    replacement: "logger.info('Social notification test response:', response);",
    category: "INFO"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 66,
    original: "console.log('Social notification test data:', data);",
    replacement: "logger.info('Social notification test data:', data);",
    category: "INFO"
  },
  {
    file: "client\src\components\EmailTestPanel.tsx",
    line: 81,
    original: "console.error('Error testing notification email:', error);",
    replacement: "logger.error('Error testing notification email:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 273,
    original: "console.error(\"Error saving location:\", error);",
    replacement: "logger.error(\"Error saving location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 353,
    original: "console.error(\"Error detecting location:\", error);",
    replacement: "logger.error(\"Error detecting location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 390,
    original: "console.log(\"Attempting to auto-detect location...\");",
    replacement: "logger.info(\"Attempting to auto-detect location...\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 398,
    original: "console.log(\"Location permission granted, detecting location...\");",
    replacement: "logger.info(\"Location permission granted, detecting location...\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 401,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 410,
    original: "console.log(\"Permissions API not supported\");",
    replacement: "logger.info(\"Permissions API not supported\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 431,
    original: "console.log(\"Using saved active location:\", activeLocation);",
    replacement: "logger.info(\"Using saved active location:\", activeLocation);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 438,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 450,
    original: "console.log(\"No active location, skipping weather fetch\");",
    replacement: "logger.info(\"No active location, skipping weather fetch\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 454,
    original: "console.log(\"Fetching weather for location:\", activeLocation);",
    replacement: "logger.info(\"Fetching weather for location:\", activeLocation);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 484,
    original: "console.error(\"Error fetching weather:\", error);",
    replacement: "logger.error(\"Error fetching weather:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 553,
    original: "console.error(\"Error fetching climate data:\", error);",
    replacement: "logger.error(\"Error fetching climate data:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 602,
    original: "console.error(\"Error fetching crop recommendations:\", error);",
    replacement: "logger.error(\"Error fetching crop recommendations:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\WeatherPage.tsx",
    line: 652,
    original: "console.error(\"Error fetching historical data:\", error);",
    replacement: "logger.error(\"Error fetching historical data:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\ProfilePage.tsx",
    line: 119,
    original: "console.error(\"Error fetching farmer profile:\", error);",
    replacement: "logger.error(\"Error fetching farmer profile:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\ProfilePage.tsx",
    line: 147,
    original: "console.error(\"Error fetching stats:\", error);",
    replacement: "logger.error(\"Error fetching stats:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\PlantDiagnosisPage.tsx",
    line: 195,
    original: "console.error(\"Error accessing camera:\", error);",
    replacement: "logger.error(\"Error accessing camera:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\OrdersPage.tsx",
    line: 88,
    original: "console.error(\"Failed to fetch orders\");",
    replacement: "logger.error(\"Failed to fetch orders\");",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\OrdersPage.tsx",
    line: 91,
    original: "console.error(\"Error fetching orders:\", error);",
    replacement: "logger.error(\"Error fetching orders:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 114,
    original: "console.log(\"Listings data from API:\", listings);",
    replacement: "logger.info(\"Listings data from API:\", listings);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 119,
    original: "console.log(\"First listing structure:\", {",
    replacement: "logger.info(\"First listing structure:\", {",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 136,
    original: "console.log(\"All properties of first listing:\");",
    replacement: "logger.info(\"All properties of first listing:\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 138,
    original: "console.log(`${key}: ${value} (${typeof value})`);",
    replacement: "logger.info(`${key}: ${value} (${typeof value})`);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 151,
    original: "console.error(\"Marketplace listings error:\", error);",
    replacement: "logger.error(\"Marketplace listings error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 168,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 175,
    original: "console.error(\"Error getting location:\", error);",
    replacement: "logger.error(\"Error getting location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 245,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 282,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 303,
    original: "console.error(\"Error filtering listing:\", error);",
    replacement: "logger.error(\"Error filtering listing:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 337,
    original: "console.error(\"Error sorting listings:\", error);",
    replacement: "logger.error(\"Error sorting listings:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 453,
    original: "console.log(\"Listings after filtering:\", {",
    replacement: "logger.info(\"Listings after filtering:\", {",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 719,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 817,
    original: "console.log(`Rendering listing: ${listing.id}`, listing);",
    replacement: "logger.info(`Rendering listing: ${listing.id}`, listing);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 866,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 878,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 908,
    original: "console.error(\"Price format error:\", e);",
    replacement: "logger.error(\"Price format error:\", e);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 989,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplacePage.tsx",
    line: 1001,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 119,
    original: "console.log(`Fetching listing with ID: ${params.id}`);",
    replacement: "logger.info(`Fetching listing with ID: ${params.id}`);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 126,
    original: "console.error(`Error fetching listing: ${response.status}`, errorText);",
    replacement: "logger.error(`Error fetching listing: ${response.status}`, errorText);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 135,
    original: "console.log(\"Listing data from API:\", data);",
    replacement: "logger.info(\"Listing data from API:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 152,
    original: "console.error(`Error fetching location: ${response.status}`, errorText);",
    replacement: "logger.error(`Error fetching location: ${response.status}`, errorText);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 157,
    original: "console.log(\"Location data from API:\", data);",
    replacement: "logger.info(\"Location data from API:\", data);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 247,
    original: "console.error(\"Error adding to cart:\", error);",
    replacement: "logger.error(\"Error adding to cart:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 294,
    original: "console.log(\"Listing data:\", JSON.stringify(listing, null, 2));",
    replacement: "logger.info(\"Listing data:\", JSON.stringify(listing, null, 2));",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 295,
    original: "console.log(\"Images data:\", listing.images);",
    replacement: "logger.info(\"Images data:\", listing.images);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 304,
    original: "console.log(\"Raw images value:\", listing.images);",
    replacement: "logger.info(\"Raw images value:\", listing.images);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 309,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 319,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 326,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 333,
    original: "console.log(\"Using single image string (JSON parsing failed)\");",
    replacement: "logger.info(\"Using single image string (JSON parsing failed)\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 337,
    original: "console.log(\"No images in listing data\");",
    replacement: "logger.info(\"No images in listing data\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 340,
    original: "console.error(\"Error processing images:\", error);",
    replacement: "logger.error(\"Error processing images:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 348,
    original: "console.log(\"Final image array:\", imageArray);",
    replacement: "logger.info(\"Final image array:\", imageArray);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\MarketplaceDetailPage.tsx",
    line: 352,
    original: "console.log(\"Using default image as no valid images were found\");",
    replacement: "logger.info(\"Using default image as no valid images were found\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\ListCropOnMarketplace.tsx",
    line: 181,
    original: "console.log(\"Sending marketplace listing data:\", formattedData);",
    replacement: "logger.info(\"Sending marketplace listing data:\", formattedData);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\ListCropOnMarketplace.tsx",
    line: 199,
    original: "console.error(\"Error linking listing to crop:\", error);",
    replacement: "logger.error(\"Error linking listing to crop:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\ListCropOnMarketplace.tsx",
    line: 221,
    original: "console.error(\"Error creating listing:\", error);",
    replacement: "logger.error(\"Error creating listing:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\InventoryPage.tsx",
    line: 137,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\InventoryPage.tsx",
    line: 153,
    original: "console.error(\"Error fetching inventory:\", error);",
    replacement: "logger.error(\"Error fetching inventory:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\InventoryPage.tsx",
    line: 212,
    original: "console.error(\"Error updating inventory:\", error);",
    replacement: "logger.error(\"Error updating inventory:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\DealerDirectoryPage.tsx",
    line: 280,
    original: "console.error(\"Error getting location:\", error);",
    replacement: "logger.error(\"Error getting location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\DashboardOverview.tsx",
    line: 45,
    original: "console.error(\"Error fetching profile:\", error);",
    replacement: "logger.error(\"Error fetching profile:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\DashboardOverview.tsx",
    line: 62,
    original: "console.error(\"Error fetching fields:\", error);",
    replacement: "logger.error(\"Error fetching fields:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\DashboardOverview.tsx",
    line: 79,
    original: "console.error(\"Error fetching crops:\", error);",
    replacement: "logger.error(\"Error fetching crops:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\DashboardOverview.tsx",
    line: 96,
    original: "console.error(\"Error fetching tasks:\", error);",
    replacement: "logger.error(\"Error fetching tasks:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\DashboardOverview.tsx",
    line: 125,
    original: "console.error(\"Error fetching weather:\", error);",
    replacement: "logger.error(\"Error fetching weather:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 163,
    original: "console.error(\"Error fetching crops:\", error);",
    replacement: "logger.error(\"Error fetching crops:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 180,
    original: "console.error(\"Error fetching profile:\", error);",
    replacement: "logger.error(\"Error fetching profile:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 328,
    original: "console.log(\"Current user data:\", user);",
    replacement: "logger.info(\"Current user data:\", user);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 410,
    original: "console.error(\"Error fetching location data:\", error);",
    replacement: "logger.error(\"Error fetching location data:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 422,
    original: "console.error(\"Error getting location:\", error);",
    replacement: "logger.error(\"Error getting location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 439,
    original: "console.log(\"Creating listing with form data\");",
    replacement: "logger.info(\"Creating listing with form data\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 440,
    original: "console.log(\"API endpoint:\", \"/api/marketplace/listings\");",
    replacement: "logger.info(\"API endpoint:\", \"/api/marketplace/listings\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 451,
    original: "console.log(\"Form data entries:\", entries.join(\", \"));",
    replacement: "logger.info(\"Form data entries:\", entries.join(\", \"));",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 455,
    original: "console.log(\"USING REAL ENDPOINT WITH DEBUG MIDDLEWARE\");",
    replacement: "logger.debug(\"USING REAL ENDPOINT WITH DEBUG MIDDLEWARE\");",
    category: "DEBUG"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 466,
    original: "console.error(\"Error in createListingMutation:\", error);",
    replacement: "logger.error(\"Error in createListingMutation:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 560,
    original: "console.log(\"Form values being sent:\", values);",
    replacement: "logger.info(\"Form values being sent:\", values);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 561,
    original: "console.log(\"FormData entries:\");",
    replacement: "logger.info(\"FormData entries:\");",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CreateListingPage.tsx",
    line: 563,
    original: "console.log(`${key}: ${value}`);",
    replacement: "logger.info(`${key}: ${value}`);",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CheckoutPage.tsx",
    line: 40,
    original: "console.log('Current cart state:', {",
    replacement: "logger.info('Current cart state:', {",
    category: "INFO"
  },
  {
    file: "client\src\pages\farmer\CartPage.tsx",
    line: 79,
    original: "console.error(\"Checkout error:\", error);",
    replacement: "logger.error(\"Checkout error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\marketplace\LocationSelector.tsx",
    line: 111,
    original: "console.error(\"Error fetching location data:\", err);",
    replacement: "logger.error(\"Error fetching location data:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\marketplace\LocationSelector.tsx",
    line: 135,
    original: "console.error(\"Error getting user location:\", err);",
    replacement: "logger.error(\"Error getting user location:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\marketplace\LocationMap.tsx",
    line: 152,
    original: "console.error('Error getting location:', error);",
    replacement: "logger.error('Error getting location:', error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\ui\InstallPWA.tsx",
    line: 65,
    original: "console.log('User accepted the install prompt');",
    replacement: "logger.info('User accepted the install prompt');",
    category: "INFO"
  },
  {
    file: "client\src\components\ui\InstallPWA.tsx",
    line: 67,
    original: "console.log('User dismissed the install prompt');",
    replacement: "logger.info('User dismissed the install prompt');",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\WeatherPreferences.tsx",
    line: 154,
    original: "console.error(\"Error detecting location:\", error);",
    replacement: "logger.error(\"Error detecting location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\WeatherPreferences.tsx",
    line: 166,
    original: "console.error(\"Geolocation error:\", error);",
    replacement: "logger.error(\"Geolocation error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\WeatherPreferences.tsx",
    line: 181,
    original: "console.log(\"Form values being submitted:\", values);",
    replacement: "logger.info(\"Form values being submitted:\", values);",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\WeatherPreferences.tsx",
    line: 191,
    original: "console.log(\"Mapped server data:\", serverData);",
    replacement: "logger.info(\"Mapped server data:\", serverData);",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\WeatherPreferences.tsx",
    line: 192,
    original: "console.log(\"Using mutation:\", preferences ? \"update\" : \"create\");",
    replacement: "logger.info(\"Using mutation:\", preferences ? \"update\" : \"create\");",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\WeatherPreferences.tsx",
    line: 201,
    original: "console.log(\"Form submitted\");",
    replacement: "logger.info(\"Form submitted\");",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\WeatherAlertSystem.tsx",
    line: 191,
    original: "console.log(`Weather alert triggered: ${alert.name}`);",
    replacement: "logger.info(`Weather alert triggered: ${alert.name}`);",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\TreatmentStepForm.tsx",
    line: 95,
    original: "console.error(\"Error adding treatment step:\", error);",
    replacement: "logger.error(\"Error adding treatment step:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\TreatmentProgressForm.tsx",
    line: 80,
    original: "console.error(\"Error adding progress entry:\", error);",
    replacement: "logger.error(\"Error adding progress entry:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\TaskManager.tsx",
    line: 136,
    original: "console.log(\"onSubmit called with values:\", values);",
    replacement: "logger.info(\"onSubmit called with values:\", values);",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\TaskManager.tsx",
    line: 144,
    original: "console.log(\"Submitting task data:\", taskData); // Debug log",
    replacement: "logger.debug(\"Submitting task data:\", taskData); // Debug log",
    category: "DEBUG"
  },
  {
    file: "client\src\components\farmer\TaskManager.tsx",
    line: 148,
    original: "console.log(\"Task created successfully!\");",
    replacement: "logger.info(\"Task created successfully!\");",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\TaskManager.tsx",
    line: 153,
    original: "console.error(\"Task creation error:\", error); // Debug log",
    replacement: "logger.error(\"Task creation error:\", error); // Debug log",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\TaskManager.tsx",
    line: 226,
    original: "console.log(\"Form submitted, calling handleSubmit...\");",
    replacement: "logger.info(\"Form submitted, calling handleSubmit...\");",
    category: "INFO"
  },
  {
    file: "client\src\components\farmer\FieldLocationPicker.tsx",
    line: 130,
    original: "console.error(\"Error fetching location data:\", error);",
    replacement: "logger.error(\"Error fetching location data:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\FieldLocationPicker.tsx",
    line: 163,
    original: "console.error(\"Error searching locations:\", error);",
    replacement: "logger.error(\"Error searching locations:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\FieldLocationPicker.tsx",
    line: 217,
    original: "console.error(\"Error getting location:\", error);",
    replacement: "logger.error(\"Error getting location:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\FieldBoundaryPicker.tsx",
    line: 230,
    original: "console.error(\"Geolocation error:\", error);",
    replacement: "logger.error(\"Geolocation error:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\farmer\FieldBoundaryPicker.tsx",
    line: 361,
    original: "console.error(\"Error saving boundary:\", error);",
    replacement: "logger.error(\"Error saving boundary:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\dashboards\FarmerDashboard.tsx",
    line: 74,
    original: "console.error(\"Error fetching profile:\", error);",
    replacement: "logger.error(\"Error fetching profile:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\dashboards\FarmerDashboard.tsx",
    line: 91,
    original: "console.error(\"Error fetching fields:\", error);",
    replacement: "logger.error(\"Error fetching fields:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\dashboards\FarmerDashboard.tsx",
    line: 109,
    original: "console.error(\"Error fetching crops:\", error);",
    replacement: "logger.error(\"Error fetching crops:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\dashboards\FarmerDashboard.tsx",
    line: 138,
    original: "console.error(\"Error fetching stats:\", error);",
    replacement: "logger.error(\"Error fetching stats:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\dashboards\FarmerDashboard.tsx",
    line: 175,
    original: "console.error(\"Error fetching weather:\", error);",
    replacement: "logger.error(\"Error fetching weather:\", error);",
    category: "ERROR"
  },
  {
    file: "client\src\components\dashboards\FarmerDashboard.tsx",
    line: 396,
    original: "console.error(",
    replacement: "logger.error(",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 81,
    original: "console.error(\"Error sending message:\", err);",
    replacement: "logger.error(\"Error sending message:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 129,
    original: "console.error(\"Error sending message:\", err);",
    replacement: "logger.error(\"Error sending message:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 161,
    original: "console.log(otherUser);",
    replacement: "logger.info(otherUser);",
    category: "INFO"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 178,
    original: "console.error(\"Error extracting channel info:\", err);",
    replacement: "logger.error(\"Error extracting channel info:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 266,
    original: "console.error(\"Error opening channel from notification:\", err);",
    replacement: "logger.error(\"Error opening channel from notification:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 282,
    original: "console.error(\"Error setting active channel:\", err);",
    replacement: "logger.error(\"Error setting active channel:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 404,
    original: "console.error(\"Error selecting channel:\", err);",
    replacement: "logger.error(\"Error selecting channel:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 462,
    original: "console.error(\"Error accessing channel messages:\", err);",
    replacement: "logger.error(\"Error accessing channel messages:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\StreamChatComponent.tsx",
    line: 491,
    original: "console.error(\"Error accessing channel members:\", err);",
    replacement: "logger.error(\"Error accessing channel members:\", err);",
    category: "ERROR"
  },
  {
    file: "client\src\components\chat\PopoverAssistant.tsx",
    line: 298,
    original: "console.log(",
    replacement: "logger.info(",
    category: "INFO"
  },
  {
    file: "client\src\components\auth\DeviceManager.tsx",
    line: 186,
    original: "console.log(devices);",
    replacement: "logger.info(devices);",
    category: "DEVELOPMENT"
  },
  {
    file: "client\src\components\admin\PestOutbreakDashboard.tsx",
    line: 271,
    original: "console.error(\"No outbreak selected\");",
    replacement: "logger.error(\"No outbreak selected\");",
    category: "ERROR"
  },
  {
    file: "client\src\components\admin\PestOutbreakDashboard.tsx",
    line: 276,
    original: "console.error(\"Selected outbreak has no ID:\", selectedOutbreak);",
    replacement: "logger.error(\"Selected outbreak has no ID:\", selectedOutbreak);",
    category: "ERROR"
  }
];

console.log('⚠️  This is an auto-generated script. Review carefully before running!');
console.log('🔄 To apply replacements, uncomment the replacement logic below.\n');

// Uncomment to apply replacements:
/*
for (const replacement of replacements) {
  try {
    const content = await readFile(replacement.file, 'utf-8');
    const lines = content.split('\n');
    
    if (lines[replacement.line - 1].trim() === replacement.original) {
      lines[replacement.line - 1] = lines[replacement.line - 1].replace(
        replacement.original,
        replacement.replacement
      );
      
      await writeFile(replacement.file, lines.join('\n'));
      console.log(`✅ Updated ${replacement.file}:${replacement.line}`);
    } else {
      console.log(`⚠️  Skipped ${replacement.file}:${replacement.line} - content changed`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${replacement.file}:`, error.message);
  }
}
*/

console.log('\n📊 Summary:');
console.log(`Total replacements identified: ${replacements.length}`);
console.log('\n💡 Manual review recommended for:');
console.log('  • Debug statements that should be removed entirely');
console.log('  • Temporary logging that should be deleted');
console.log('  • Performance-sensitive logging');
