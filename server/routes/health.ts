import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// HEALTH CHECKS DISABLED - Uncomment to re-enable
/*
// Simple test endpoint to verify server is responding
router.get("/test", (req, res) => {
  console.log("🧪 Test endpoint called:", {
    method: req.method,
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    message: "Server is responding!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// Fast health check endpoint for Railway (no database dependency)
router.get("/health", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`🔍 [${requestId}] Health check request received:`, {
    method: req.method,
    path: req.path,
    url: req.url,
    headers: {
      "user-agent": req.get("user-agent"),
      host: req.get("host"),
      "x-forwarded-for": req.get("x-forwarded-for"),
      "x-forwarded-proto": req.get("x-forwarded-proto"),
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });

  try {
    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      requestId: requestId,
      responseTime: Date.now() - startTime,
    };

    console.log(`✅ [${requestId}] Health check successful:`, response);

    res.status(200).json(response);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Health check failed:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
      timestamp: new Date().toISOString(),
    });

    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Server error",
      requestId: requestId,
      responseTime: responseTime,
    });
  }
});

// Database health check (separate endpoint for detailed checks)
router.get("/health/db", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`🔍 [${requestId}] Database health check request received:`, {
    method: req.method,
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  try {
    // Check database connection with timeout
    const dbPromise = db.execute("SELECT 1");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000)
    );

    await Promise.race([dbPromise, timeoutPromise]);

    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      requestId: requestId,
      responseTime: Date.now() - startTime,
    };

    console.log(
      `✅ [${requestId}] Database health check successful:`,
      response
    );

    res.status(200).json(response);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Database health check failed:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
      timestamp: new Date().toISOString(),
    });

    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      requestId: requestId,
      responseTime: responseTime,
    });
  }
});

// Detailed health check
router.get("/health/detailed", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`🔍 [${requestId}] Detailed health check request received:`, {
    method: req.method,
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  try {
    const checks = {
      database: false,
      memory: false,
      disk: false,
    };

    // Database check with timeout
    try {
      const dbPromise = db.execute("SELECT 1");
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 5000)
      );

      await Promise.race([dbPromise, timeoutPromise]);
      checks.database = true;
    } catch (error) {
      console.error(`❌ [${requestId}] Database check failed:`, error);
    }

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = memUsage.heapUsed < 500 * 1024 * 1024; // Less than 500MB

    // Disk check (basic)
    checks.disk = true; // Railway handles disk space

    const isHealthy = Object.values(checks).every((check) => check);

    const response = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
        external: Math.round(memUsage.external / 1024 / 1024) + "MB",
      },
      requestId: requestId,
      responseTime: Date.now() - startTime,
    };

    console.log(`✅ [${requestId}] Detailed health check completed:`, response);

    res.status(isHealthy ? 200 : 503).json(response);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Detailed health check failed:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
      timestamp: new Date().toISOString(),
    });

    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      requestId: requestId,
      responseTime: responseTime,
    });
  }
});
*/

export default router;
