import "dotenv/config";

console.log("🔍 Verifying Firebase Environment Variables...\n");

// Check if we're in a Vite environment
const isVite = typeof import.meta !== "undefined" && import.meta.env;

if (isVite) {
  console.log("✅ Running in Vite environment");
  console.log("📋 Firebase Config Variables:");
  console.log(
    `   API Key: ${
      import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Auth Domain: ${
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Project ID: ${
      import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Storage Bucket: ${
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Messaging Sender ID: ${
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
        ? "✅ Set"
        : "❌ Missing"
    }`
  );
  console.log(
    `   App ID: ${
      import.meta.env.VITE_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Measurement ID: ${
      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   VAPID Key: ${
      import.meta.env.VITE_FIREBASE_VAPID_KEY ? "✅ Set" : "❌ Missing"
    }`
  );
} else {
  console.log("⚠️  Not running in Vite environment");
  console.log("📋 Node.js Environment Variables:");
  console.log(
    `   API Key: ${process.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"}`
  );
  console.log(
    `   Auth Domain: ${
      process.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Project ID: ${
      process.env.VITE_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Storage Bucket: ${
      process.env.VITE_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Messaging Sender ID: ${
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   App ID: ${process.env.VITE_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing"}`
  );
  console.log(
    `   Measurement ID: ${
      process.env.VITE_FIREBASE_MEASUREMENT_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   VAPID Key: ${
      process.env.VITE_FIREBASE_VAPID_KEY ? "✅ Set" : "❌ Missing"
    }`
  );
}

console.log("\n🎯 To test in the browser:");
console.log("1. Open your client app");
console.log("2. Open browser dev tools");
console.log("3. Check console for any Firebase errors");
console.log("4. Look for the PushNotificationDebug component");
