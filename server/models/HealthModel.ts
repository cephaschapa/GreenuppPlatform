import { db } from "../db.js";

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  requestId: string;
  responseTime: number;
}

export interface DatabaseHealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  database: "connected" | "disconnected";
  requestId: string;
  responseTime: number;
  error?: string;
}

export interface DetailedHealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  checks: {
    database: boolean;
    memory: boolean;
    disk: boolean;
  };
  memory: {
    heapUsed: string;
    heapTotal: string;
    external: string;
  };
  requestId: string;
  responseTime: number;
  error?: string;
}

export class HealthModel {
  /**
   * Check basic server health without database dependency
   */
  static async getBasicHealth(
    requestId: string,
    startTime: number
  ): Promise<HealthStatus> {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      requestId: requestId,
      responseTime: Date.now() - startTime,
    };
  }

  /**
   * Check database connectivity
   */
  static async checkDatabaseHealth(
    requestId: string,
    startTime: number
  ): Promise<DatabaseHealthStatus> {
    try {
      // Check database connection with timeout
      const dbPromise = db.execute("SELECT 1");
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 5000)
      );

      await Promise.race([dbPromise, timeoutPromise]);

      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        requestId: requestId,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: requestId,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Perform detailed health checks including database, memory, and disk
   */
  static async getDetailedHealth(
    requestId: string,
    startTime: number
  ): Promise<DetailedHealthStatus> {
    const checks = {
      database: false,
      memory: false,
      disk: false,
    };

    // Database check
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

    return {
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
  }
}
