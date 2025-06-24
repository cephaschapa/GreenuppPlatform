import { Request, Response } from "express";
import { HealthModel } from "../models/HealthModel.js";
import { logger } from "../lib/logger.js";

export class HealthController {
  /**
   * Simple test endpoint to verify server is responding
   */
  static async test(req: Request, res: Response): Promise<void> {
    logger.info("🧪 Test endpoint called:", {
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
  }

  /**
   * Fast health check endpoint for Railway (no database dependency)
   */
  static async basicHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.info(`🔍 [${requestId}] Health check request received:`, {
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
      const healthStatus = await HealthModel.getBasicHealth(
        requestId,
        startTime
      );

      logger.info(`✅ [${requestId}] Health check successful:`, healthStatus);
      res.status(200).json(healthStatus);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error(`❌ [${requestId}] Health check failed:`, {
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime,
        timestamp: new Date().toISOString(),
      });

      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Server error",
        requestId,
        responseTime,
      });
    }
  }

  /**
   * Database health check (separate endpoint for detailed checks)
   */
  static async databaseHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.info(`🔍 [${requestId}] Database health check request received:`, {
      method: req.method,
      path: req.path,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    try {
      const dbHealthStatus = await HealthModel.checkDatabaseHealth(
        requestId,
        startTime
      );

      if (dbHealthStatus.status === "healthy") {
        logger.info(
          `✅ [${requestId}] Database health check successful:`,
          dbHealthStatus
        );
        res.status(200).json(dbHealthStatus);
      } else {
        logger.error(
          `❌ [${requestId}] Database health check failed:`,
          dbHealthStatus
        );
        res.status(503).json(dbHealthStatus);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error(`❌ [${requestId}] Database health check failed:`, {
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime,
        timestamp: new Date().toISOString(),
      });

      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        responseTime,
      });
    }
  }

  /**
   * Detailed health check
   */
  static async detailedHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.info(`🔍 [${requestId}] Detailed health check request received:`, {
      method: req.method,
      path: req.path,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    try {
      const detailedHealthStatus = await HealthModel.getDetailedHealth(
        requestId,
        startTime
      );

      if (detailedHealthStatus.status === "healthy") {
        logger.info(
          `✅ [${requestId}] Detailed health check completed:`,
          detailedHealthStatus
        );
        res.status(200).json(detailedHealthStatus);
      } else {
        logger.error(
          `❌ [${requestId}] Detailed health check failed:`,
          detailedHealthStatus
        );
        res.status(503).json(detailedHealthStatus);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error(`❌ [${requestId}] Detailed health check failed:`, {
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime,
        timestamp: new Date().toISOString(),
      });

      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        responseTime,
      });
    }
  }
}
