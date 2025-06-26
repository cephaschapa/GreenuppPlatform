import "dotenv/config";

console.log(
  "🧪 Testing Firebase Configuration with Environment Variables...\n"
);

try {
  // Simulate the Firebase config that would be used in the client
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  console.log("📋 Firebase Config (sanitized):");
  console.log(`   API Key: ${firebaseConfig.apiKey ? "✅ Set" : "❌ Missing"}`);
  console.log(
    `   Auth Domain: ${firebaseConfig.authDomain ? "✅ Set" : "❌ Missing"}`
  );
  console.log(
    `   Project ID: ${firebaseConfig.projectId ? "✅ Set" : "❌ Missing"}`
  );
  console.log(
    `   Storage Bucket: ${
      firebaseConfig.storageBucket ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   Messaging Sender ID: ${
      firebaseConfig.messagingSenderId ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(`   App ID: ${firebaseConfig.appId ? "✅ Set" : "❌ Missing"}`);
  console.log(
    `   Measurement ID: ${
      firebaseConfig.measurementId ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `   VAPID Key: ${
      process.env.VITE_FIREBASE_VAPID_KEY ? "✅ Set" : "❌ Missing"
    }`
  );

  // Check if all required fields are present
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field]
  );

  if (missingFields.length === 0) {
    console.log("\n✅ All required Firebase config fields are present!");
    console.log("🎉 Firebase configuration is ready for the client!");
  } else {
    console.log(`\n❌ Missing required fields: ${missingFields.join(", ")}`);
  }
} catch (error) {
  console.error("❌ Error testing Firebase config:", error.message);
}
