import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// Fast health check endpoint for Railway (no database dependency)
router.get("/health", async (req, res) => {
  try {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Server error",
    });
  }
});

// Database health check (separate endpoint for detailed checks)
router.get("/health/db", async (req, res) => {
  try {
    // Check database connection with timeout
    const dbPromise = db.execute("SELECT 1");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000)
    );

    await Promise.race([dbPromise, timeoutPromise]);

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Detailed health check
router.get("/health/detailed", async (req, res) => {
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
      console.error("Database health check failed:", error);
    }

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = memUsage.heapUsed < 500 * 1024 * 1024; // Less than 500MB

    // Disk check (basic)
    checks.disk = true; // Railway handles disk space

    const isHealthy = Object.values(checks).every((check) => check);

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
        external: Math.round(memUsage.external / 1024 / 1024) + "MB",
      },
    });
  } catch (error) {
    console.error("Detailed health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
