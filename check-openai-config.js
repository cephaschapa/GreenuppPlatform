// Script to check OpenAI API configuration
console.log("🔍 Checking OpenAI API Configuration...\n");

// Check if OpenAI API key is set
const openaiApiKey = process.env.OPENAI_API_KEY;

if (openaiApiKey) {
  console.log("✅ OPENAI_API_KEY is set");
  console.log(`   Key length: ${openaiApiKey.length} characters`);
  console.log(`   Key starts with: ${openaiApiKey.substring(0, 3)}...`);

  // Check if it looks like a valid OpenAI API key format
  if (openaiApiKey.startsWith("sk-")) {
    console.log("✅ API key format looks correct (starts with 'sk-')");
  } else {
    console.log("⚠️ API key format may be incorrect (should start with 'sk-')");
  }
} else {
  console.log("❌ OPENAI_API_KEY is not set");
  console.log("\n🔧 To fix this:");
  console.log("1. Create a .env file in your project root");
  console.log("2. Add: OPENAI_API_KEY=your_openai_api_key_here");
  console.log("3. Get your API key from: https://platform.openai.com/api-keys");
  console.log("4. Restart your server");
}

// Check other related environment variables
console.log("\n📋 Other AI-related environment variables:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(
  `   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`
);

console.log("\n🎯 Next steps:");
console.log("1. Make sure your server is running");
console.log("2. Try generating an AI treatment plan");
console.log("3. Check server logs for any OpenAI API errors");
console.log("4. Verify your OpenAI account has sufficient credits");

if (!openaiApiKey) {
  console.log("\n💡 If you don't have an OpenAI API key:");
  console.log("- Sign up at https://platform.openai.com");
  console.log("- Create an API key in your account settings");
  console.log("- Add it to your .env file");
  console.log(
    "- The AI treatment generation will fall back to rule-based if not configured"
  );
}
