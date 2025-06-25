#!/usr/bin/env node

/**
 * Health Check Testing Script
 * Tests all health check endpoints to ensure they're working correctly
 */

import http from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseUrl = process.env.BASE_URL || "http://localhost:5000";
const ENDPOINTS = [
  "/api/test",
  "/api/health",
  "/api/health/db",
  "/api/health/detailed",
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const req = http.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const responseTime = Date.now() - startTime;
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            responseTime,
            data: jsonData,
            headers: res.headers,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            responseTime,
            data: data,
            headers: res.headers,
            parseError: error.message,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function testEndpoints() {
  console.log("🧪 Testing Health Check Endpoints");
  console.log("================================");
  console.log(`Base URL: ${baseUrl}`);
  console.log("");

  const results = [];

  for (const endpoint of ENDPOINTS) {
    const url = `${baseUrl}${endpoint}`;
    console.log(`Testing: ${endpoint}`);

    try {
      const result = await makeRequest(url);
      results.push({ endpoint, success: true, result });

      console.log(`  ✅ Status: ${result.status}`);
      console.log(`  ⏱️  Response Time: ${result.responseTime}ms`);

      if (result.data.status) {
        console.log(`  📊 Status: ${result.data.status}`);
      }

      if (result.data.responseTime) {
        console.log(`  📊 Server Response Time: ${result.data.responseTime}ms`);
      }

      if (result.data.requestId) {
        console.log(`  🆔 Request ID: ${result.data.requestId}`);
      }
    } catch (error) {
      results.push({ endpoint, success: false, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
    }

    console.log("");
  }

  // Summary
  console.log("📋 Summary");
  console.log("==========");

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Successful: ${successful}/${ENDPOINTS.length}`);
  console.log(`❌ Failed: ${failed}/${ENDPOINTS.length}`);

  if (failed > 0) {
    console.log("\n❌ Failed endpoints:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.endpoint}: ${r.error}`);
      });
  }

  // Check if Railway health check endpoint is working
  const healthCheck = results.find((r) => r.endpoint === "/api/health");
  if (healthCheck && healthCheck.success && healthCheck.result.status === 200) {
    console.log("\n✅ Railway health check endpoint is working correctly!");
  } else {
    console.log("\n❌ Railway health check endpoint is not working!");
    console.log("   This will cause deployment issues on Railway.");
  }

  return results;
}

// Run the tests
testEndpoints()
  .then(() => {
    console.log("\n🎯 Health check testing completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Testing failed:", error);
    process.exit(1);
  });
