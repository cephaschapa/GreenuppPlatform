// Test script to verify AI treatment generation
const http = require("http");

async function testAITreatmentGeneration() {
  console.log("=== Testing AI Treatment Generation ===");

  // Test data for a plant analysis
  const testData = {
    analysisId: 1,
    useAI: true,
  };

  const postData = JSON.stringify(testData);

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/treatment-plans/generate",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

        if (res.statusCode === 201) {
          try {
            const response = JSON.parse(data);
            console.log("✅ AI treatment generation test passed!");
            console.log(`Generated plan: ${response.title}`);
            console.log(`AI Generated: ${response.aiGenerated}`);
            console.log(`Steps: ${response.steps?.length || 0}`);

            if (response.aiGenerated) {
              console.log("🎉 AI generation was successful!");
              if (response.recommendations) {
                console.log("AI Recommendations:", response.recommendations);
              }
              if (response.warnings) {
                console.log("AI Warnings:", response.warnings);
              }
            } else {
              console.log("⚠️ AI generation failed, fell back to rule-based");
            }

            resolve(response);
          } catch (error) {
            console.error("❌ Error parsing response:", error);
            console.log("Raw response:", data);
            reject(error);
          }
        } else if (res.statusCode === 401) {
          console.error(
            "❌ Authentication required - make sure you're logged in"
          );
          reject(new Error("Authentication required"));
        } else if (res.statusCode === 409) {
          console.log("ℹ️ Treatment plan already exists for this analysis");
          resolve({ message: "Plan already exists" });
        } else {
          console.error(`❌ API test failed with status ${res.statusCode}`);
          console.log("Response:", data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request failed:", error.message);
      console.log("Make sure the server is running on localhost:3000");
      reject(error);
    });

    req.setTimeout(30000, () => {
      console.error("❌ Request timed out (30s)");
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
testAITreatmentGeneration()
  .then(() => {
    console.log("\n🎉 AI treatment generation test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 AI treatment generation test failed:", error.message);

    if (error.message.includes("OpenAI API not configured")) {
      console.log("\n🔧 To fix this issue:");
      console.log(
        "1. Make sure OPENAI_API_KEY is set in your environment variables"
      );
      console.log(
        "2. Check that the API key is valid and has sufficient credits"
      );
      console.log(
        "3. Verify the server is properly configured to use the API key"
      );
    }

    process.exit(1);
  });
