import { Router } from "express";
import { getPerformanceMetrics } from "../lib/queryOptimizer.js";
import { getCacheStats, clearCachePrefix } from "../lib/cache.js";
import { logger } from "../lib/logger.js";

const router = Router();

/**
 * GET /api/admin/performance
 * Get system performance metrics
 */
router.get("/performance", async (req, res) => {
  try {
    const startTime = Date.now();

    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics();

    // Get cache statistics
    const cacheStats = getCacheStats();

    // Get system statistics
    const systemStats = {
      memory: {
        heapUsed: formatBytes(process.memoryUsage().heapUsed),
        heapTotal: formatBytes(process.memoryUsage().heapTotal),
        external: formatBytes(process.memoryUsage().external),
      },
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
    };

    res.json({
      queryStats: performanceMetrics.queryStats,
      databaseStats: performanceMetrics.databaseStats,
      cacheStats,
      systemStats,
    });
  } catch (error) {
    logger.error("Error getting performance metrics:", error);
    res.status(500).json({ error: "Failed to get performance metrics" });
  }
});

/**
 * GET /api/admin/cache/stats
 * Get cache statistics
 */
router.get("/cache/stats", (req, res) => {
  try {
    const stats = getCacheStats();
    res.json(stats);
  } catch (error) {
    logger.error("Error getting cache stats:", error);
    res.status(500).json({ error: "Failed to get cache statistics" });
  }
});

/**
 * POST /api/admin/cache/clear
 * Clear all cache
 */
router.post("/cache/clear", async (req, res) => {
  try {
    const { prefix } = req.body;

    if (prefix) {
      await clearCachePrefix(prefix);
      res.json({ message: `Cache cleared for prefix: ${prefix}` });
    } else {
      // Clear all cache
      await clearCachePrefix("");
      res.json({ message: "All cache cleared" });
    }
  } catch (error) {
    logger.error("Error clearing cache:", error);
    res.status(500).json({ error: "Failed to clear cache" });
  }
});

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default router;
