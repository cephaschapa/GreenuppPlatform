#!/usr/bin/env node

/**
 * Production Health Check Testing Script
 * Tests health check endpoints to ensure they work in production environment
 */

import http from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get base URL from environment or use localhost
const baseUrl = process.env.BASE_URL || "http://localhost:5000";
const ENDPOINTS = [
  "/api/health", // Railway health check endpoint
  "/api/health/db", // Database health check
  "/api/health/detailed", // Detailed health check
  "/api/health/test", // Test endpoint
];

function makeRequest(url, timeout = 10000) {
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

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

async function testEndpoints() {
  console.log("🧪 Testing Production Health Check Endpoints");
  console.log("=============================================");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("");

  const results = [];
  let hasFailures = false;

  for (const endpoint of ENDPOINTS) {
    const url = `${baseUrl}${endpoint}`;
    console.log(`Testing: ${endpoint}`);

    try {
      const result = await makeRequest(url);
      results.push({ endpoint, success: true, result });

      console.log(`  ✅ Status: ${result.status}`);
      console.log(`  ⏱️  Response Time: ${result.responseTime}ms`);

      if (result.data.status) {
        console.log(`  📊 Health Status: ${result.data.status}`);
      }

      if (result.data.responseTime) {
        console.log(`  📊 Server Response Time: ${result.data.responseTime}ms`);
      }

      if (result.data.requestId) {
        console.log(`  🆔 Request ID: ${result.data.requestId}`);
      }

      // Check if this is the Railway health check endpoint
      if (endpoint === "/api/health") {
        if (result.status === 200 && result.data.status === "healthy") {
          console.log(`  🚂 Railway Health Check: PASSED`);
        } else {
          console.log(`  🚂 Railway Health Check: FAILED`);
          hasFailures = true;
        }
      }
    } catch (error) {
      results.push({ endpoint, success: false, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
      hasFailures = true;
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

  // Railway-specific checks
  const railwayHealthCheck = results.find((r) => r.endpoint === "/api/health");
  if (
    railwayHealthCheck &&
    railwayHealthCheck.success &&
    railwayHealthCheck.result.status === 200
  ) {
    console.log("\n✅ Railway health check endpoint is working correctly!");
    console.log("   This should resolve CI deployment issues.");
  } else {
    console.log("\n❌ Railway health check endpoint is not working!");
    console.log("   This will cause deployment failures on Railway.");
    hasFailures = true;
  }

  // Performance checks
  const slowEndpoints = results.filter(
    (r) => r.success && r.result.responseTime > 5000
  );
  if (slowEndpoints.length > 0) {
    console.log("\n⚠️  Slow endpoints (>5s):");
    slowEndpoints.forEach((r) => {
      console.log(`  - ${r.endpoint}: ${r.result.responseTime}ms`);
    });
  }

  // Database connectivity check
  const dbHealthCheck = results.find((r) => r.endpoint === "/api/health/db");
  if (
    dbHealthCheck &&
    dbHealthCheck.success &&
    dbHealthCheck.result.data.status === "healthy"
  ) {
    console.log("\n✅ Database connectivity is working!");
  } else if (dbHealthCheck && !dbHealthCheck.success) {
    console.log("\n❌ Database connectivity issues detected!");
    console.log("   This may cause problems in production.");
    hasFailures = true;
  }

  return { results, hasFailures };
}

// Run the tests
testEndpoints()
  .then(({ hasFailures }) => {
    console.log("\n🎯 Health check testing completed!");

    if (hasFailures) {
      console.log(
        "\n💥 Some health checks failed. Please review the issues above."
      );
      console.log("\n🔧 Troubleshooting tips:");
      console.log("1. Check if the server is running: npm start");
      console.log("2. Verify environment variables are set correctly");
      console.log("3. Check database connectivity");
      console.log("4. Review server logs for errors");
      process.exit(1);
    } else {
      console.log(
        "\n🎉 All health checks passed! Your application is ready for deployment."
      );
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error("\n💥 Testing failed:", error);
    process.exit(1);
  });
