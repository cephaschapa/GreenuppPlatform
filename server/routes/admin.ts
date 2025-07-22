import { Router } from "express";
import { getPerformanceMetrics } from "../lib/queryOptimizer.js";
import { getCacheStats, clearCachePrefix } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import { hasRole } from "../middleware/auth.js";
import { storage } from "../storage.js";
import { db } from "../db.js";
import {
  users,
  marketplaceListings,
  contactForm,
  loginAttempts,
  securityEvents,
} from "@shared/schema";
import { eq, desc, count, sql } from "drizzle-orm";

const router = Router();

// Apply admin role middleware to all admin routes
router.use(hasRole("admin"));

/**
 * GET /api/admin/dashboard
 * Get admin dashboard overview data
 */
router.get("/dashboard", async (req, res) => {
  try {
    const startTime = Date.now();

    // Get user statistics
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [recentUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`created_at >= NOW() - INTERVAL '7 days'`);

    // Get marketplace statistics
    const [totalListings] = await db
      .select({ count: count() })
      .from(marketplaceListings);
    const [activeListings] = await db
      .select({ count: count() })
      .from(marketplaceListings)
      .where(eq(marketplaceListings.status, "active"));

    // Get contact form statistics
    const [totalContacts] = await db
      .select({ count: count() })
      .from(contactForm);
    const [recentContacts] = await db
      .select({ count: count() })
      .from(contactForm)
      .where(sql`timestamp >= NOW() - INTERVAL '7 days'`);

    // Get security statistics
    const [totalLoginAttempts] = await db
      .select({ count: count() })
      .from(loginAttempts);
    const [failedLoginAttempts] = await db
      .select({ count: count() })
      .from(loginAttempts)
      .where(eq(loginAttempts.success, false));

    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics();
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
      overview: {
        totalUsers: totalUsers.count,
        newUsersThisWeek: recentUsers.count,
        totalListings: totalListings.count,
        activeListings: activeListings.count,
        totalContacts: totalContacts.count,
        newContactsThisWeek: recentContacts.count,
        totalLoginAttempts: totalLoginAttempts.count,
        failedLoginAttempts: failedLoginAttempts.count,
      },
      performance: performanceMetrics,
      cache: cacheStats,
      system: systemStats,
    });
  } catch (error) {
    logger.error("Error getting admin dashboard data:", error);
    res.status(500).json({ error: "Failed to get admin dashboard data" });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const offset = (page - 1) * limit;

    let query = db.select().from(users);

    // Apply search filter
    if (search) {
      query = query.where(
        sql`username ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`}`
      );
    }

    // Apply role filter
    if (role) {
      query = query.where(eq(users.role, role));
    }

    // Get total count for pagination
    const countQuery = db.select({ count: count() }).from(users);
    if (search) {
      countQuery.where(
        sql`username ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`}`
      );
    }
    if (role) {
      countQuery.where(eq(users.role, role));
    }
    const [totalCount] = await countQuery;

    // Get paginated results
    const userList = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount.count / limit);

    res.json({
      users: userList,
      pagination: {
        page,
        limit,
        totalCount: totalCount.count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

/**
 * GET /api/admin/users/:id
 * Get user by ID with detailed information
 */
router.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's recent login attempts
    const recentLogins = await db
      .select()
      .from(loginAttempts)
      .where(eq(loginAttempts.userId, userId))
      .orderBy(desc(loginAttempts.createdAt))
      .limit(10);

    // Get user's security events
    const securityEvents = await db
      .select()
      .from(securityEvents)
      .where(eq(securityEvents.userId, userId))
      .orderBy(desc(securityEvents.createdAt))
      .limit(10);

    res.json({
      user,
      recentLogins,
      securityEvents,
    });
  } catch (error) {
    logger.error("Error getting user details:", error);
    res.status(500).json({ error: "Failed to get user details" });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user by ID (admin only)
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting admin users (safety measure)
    if (existingUser.role === "admin") {
      return res.status(403).json({ error: "Cannot delete admin users" });
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, userId));

    logger.info(
      `User ${existingUser.username} (ID: ${userId}) deleted by admin ${req.session.userId}`
    );

    res.json({
      message: "User deleted successfully",
      deletedUser: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user (admin only)
 */
router.patch("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role, firstName, lastName, email, username } = req.body;

    const updateData: any = {};
    if (role) updateData.role = role;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (username) updateData.username = username;

    const updatedUser = await storage.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: updatedUser, message: "User updated successfully" });
  } catch (error) {
    logger.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * GET /api/admin/analytics
 * Get analytics data
 */
router.get("/analytics", async (req, res) => {
  try {
    const period = (req.query.period as string) || "7d"; // 7d, 30d, 90d

    let days;
    switch (period) {
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      default:
        days = 7;
    }

    // User registration trends
    const userTrends = await db
      .select({
        date: sql`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(
        sql`${users.createdAt} >= NOW() - INTERVAL '${sql.raw(
          days.toString()
        )} days'`
      )
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Login attempt trends
    const loginTrends = await db
      .select({
        date: sql`DATE(${loginAttempts.createdAt})`,
        total: count(),
        successful: sql`COUNT(CASE WHEN ${loginAttempts.success} = true THEN 1 END)`,
        failed: sql`COUNT(CASE WHEN ${loginAttempts.success} = false THEN 1 END)`,
      })
      .from(loginAttempts)
      .where(
        sql`${loginAttempts.createdAt} >= NOW() - INTERVAL '${sql.raw(
          days.toString()
        )} days'`
      )
      .groupBy(sql`DATE(${loginAttempts.createdAt})`)
      .orderBy(sql`DATE(${loginAttempts.createdAt})`);

    // Marketplace activity
    const marketplaceTrends = await db
      .select({
        date: sql`DATE(${marketplaceListings.createdAt})`,
        count: count(),
      })
      .from(marketplaceListings)
      .where(
        sql`${marketplaceListings.createdAt} >= NOW() - INTERVAL '${sql.raw(
          days.toString()
        )} days'`
      )
      .groupBy(sql`DATE(${marketplaceListings.createdAt})`)
      .orderBy(sql`DATE(${marketplaceListings.createdAt})`);

    res.json({
      userTrends,
      loginTrends,
      marketplaceTrends,
    });
  } catch (error) {
    logger.error("Error getting analytics:", error);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

/**
 * GET /api/admin/content
 * Get content management data
 */
router.get("/content", async (req, res) => {
  try {
    // Get recent marketplace listings
    const recentListings = await db
      .select()
      .from(marketplaceListings)
      .orderBy(desc(marketplaceListings.createdAt))
      .limit(10);

    // Get recent contact form submissions
    const recentContacts = await db
      .select()
      .from(contactForm)
      .orderBy(desc(contactForm.timestamp))
      .limit(10);

    // Get content statistics
    const [totalListings] = await db
      .select({ count: count() })
      .from(marketplaceListings);
    const [pendingContacts] = await db
      .select({ count: count() })
      .from(contactForm);

    res.json({
      recentListings,
      recentContacts,
      stats: {
        totalListings: totalListings.count,
        pendingContacts: pendingContacts.count,
      },
    });
  } catch (error) {
    logger.error("Error getting content data:", error);
    res.status(500).json({ error: "Failed to get content data" });
  }
});

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
