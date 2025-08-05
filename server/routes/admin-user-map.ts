import { Router } from "express";
import { hasRole } from "../middleware/auth.js";
import { db } from "../db.js";
import {
  users,
  farmerProfiles,
  deviceSessions,
  fields,
  pestReports,
  plantAnalyses,
  pestOutbreaks,
  pestDiseaseTypes,
} from "@shared/schema";
import { eq, desc, and, gte, count, sql, or, ilike } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router = Router();

// Apply admin role middleware to all routes
router.use(hasRole("admin"));

/**
 * GET /api/admin/users/map-data
 * Get user location data for map visualization
 */
router.get("/map-data", async (req, res) => {
  try {
    const {
      userType = "all",
      activityStatus = "all",
      country = "all",
      dateRange = "all",
      searchQuery = "",
    } = req.query;

    // Build base query
    let query = db
      .select({
        user: users,
        farmProfile: farmerProfiles,
      })
      .from(users)
      .leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId));

    // Apply filters
    const conditions = [];

    if (userType !== "all") {
      conditions.push(eq(users.role, userType as string));
    }

    if (activityStatus === "active") {
      // Consider users active if they've logged in within the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      conditions.push(gte(users.lastLoginAt, thirtyDaysAgo));
    } else if (activityStatus === "inactive") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      conditions.push(
        or(
          sql`${users.lastLoginAt} IS NULL`,
          sql`${users.lastLoginAt} < ${thirtyDaysAgo}`
        )
      );
    }

    if (searchQuery) {
      conditions.push(
        or(
          ilike(users.firstName, `%${searchQuery}%`),
          ilike(users.lastName, `%${searchQuery}%`),
          ilike(users.email, `%${searchQuery}%`),
          ilike(farmerProfiles.farmName, `%${searchQuery}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const baseResults = await query.limit(1000); // Limit for performance

    // Enrich with location data, fields, and activity
    const enrichedResults = await Promise.all(
      baseResults.map(async ({ user, farmProfile }) => {
        // Get latest device session for location
        const [latestSession] = await db
          .select({
            latitude: deviceSessions.latitude,
            longitude: deviceSessions.longitude,
            city: deviceSessions.city,
            state: deviceSessions.state,
            country: deviceSessions.country,
            location: deviceSessions.location,
          })
          .from(deviceSessions)
          .where(eq(deviceSessions.userId, user.id))
          .orderBy(desc(deviceSessions.lastActiveAt))
          .limit(1);

        // Filter by country if specified
        if (country !== "all" && latestSession?.country !== country) {
          return null;
        }

        // Get user's fields
        const userFields = await db
          .select({
            id: fields.id,
            name: fields.name,
            centerLat: fields.centerLat,
            centerLng: fields.centerLng,
            size: fields.size,
            boundary: fields.boundary,
          })
          .from(fields)
          .where(eq(fields.userId, user.id))
          .limit(10);

        // Get recent activity
        const [pestReportCount] = await db
          .select({ count: count() })
          .from(pestReports)
          .where(eq(pestReports.userId, user.id));

        const [plantAnalysisCount] = await db
          .select({ count: count() })
          .from(plantAnalyses)
          .where(eq(plantAnalyses.userId, user.id));

        // Determine if user is active
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = user.lastLoginAt && user.lastLoginAt > thirtyDaysAgo;

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: !!isActive,
          lastActiveAt:
            user.lastLoginAt?.toISOString() || user.createdAt.toISOString(),
          createdAt: user.createdAt.toISOString(),
          location:
            latestSession?.latitude && latestSession?.longitude
              ? {
                  latitude: parseFloat(latestSession.latitude as string),
                  longitude: parseFloat(latestSession.longitude as string),
                  city: latestSession.city,
                  state: latestSession.state,
                  country: latestSession.country,
                  formattedAddress: latestSession.location,
                }
              : null,
          farmProfile: farmProfile
            ? {
                farmName: farmProfile.farmName,
                farmLocation: farmProfile.farmLocation,
                farmSize: farmProfile.farmSize,
                mainCrops: farmProfile.mainCrops,
              }
            : null,
          fields: userFields.map((field) => ({
            id: field.id,
            name: field.name,
            centerLat: field.centerLat
              ? parseFloat(field.centerLat as string)
              : 0,
            centerLng: field.centerLng
              ? parseFloat(field.centerLng as string)
              : 0,
            size: field.size ? parseFloat(field.size as string) : 0,
            boundary: field.boundary,
          })),
          recentActivity: {
            pestReports: pestReportCount.count,
            plantAnalyses: plantAnalysisCount.count,
            lastLogin:
              user.lastLoginAt?.toISOString() || user.createdAt.toISOString(),
          },
        };
      })
    );

    // Filter out null results (users that didn't match country filter)
    const filteredResults = enrichedResults.filter((result) => result !== null);

    res.json(filteredResults);
  } catch (error) {
    logger.error("Error fetching user map data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user map data",
    });
  }
});

/**
 * GET /api/admin/users/map-stats
 * Get statistics for the user map
 */
router.get("/map-stats", async (req, res) => {
  try {
    // Get total users
    const [totalUsersResult] = await db.select({ count: count() }).from(users);

    // Get active users (logged in within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastLoginAt, thirtyDaysAgo));

    // Get farmer users
    const [farmerUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "farmer"));

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentSignupsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));

    // Get total fields
    const [totalFieldsResult] = await db
      .select({ count: count() })
      .from(fields);

    // Get total farm area
    const [totalFarmAreaResult] = await db
      .select({
        totalArea: sql<number>`COALESCE(SUM(CAST(${fields.size} AS DECIMAL)), 0)`,
      })
      .from(fields);

    // Get unique countries
    const countriesResult = await db
      .selectDistinct({ country: deviceSessions.country })
      .from(deviceSessions)
      .where(sql`${deviceSessions.country} IS NOT NULL`);

    const countries = countriesResult
      .map((r) => r.country)
      .filter(Boolean)
      .sort();

    const stats = {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      farmerUsers: farmerUsersResult.count,
      recentSignups: recentSignupsResult.count,
      totalFields: totalFieldsResult.count,
      totalFarmArea: Math.round(totalFarmAreaResult.totalArea || 0),
      countries,
    };

    res.json(stats);
  } catch (error) {
    logger.error("Error fetching user map stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user map statistics",
    });
  }
});

/**
 * GET /api/admin/users/:id/details
 * Get detailed information about a specific user
 */
router.get("/:id/details", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Get user with farm profile
    const [userResult] = await db
      .select({
        user: users,
        farmProfile: farmerProfiles,
      })
      .from(users)
      .leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId))
      .where(eq(users.id, userId));

    if (!userResult) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get device sessions
    const deviceSessionsList = await db
      .select()
      .from(deviceSessions)
      .where(eq(deviceSessions.userId, userId))
      .orderBy(desc(deviceSessions.lastActiveAt))
      .limit(10);

    // Get fields
    const userFields = await db
      .select()
      .from(fields)
      .where(eq(fields.userId, userId));

    // Get activity counts
    const [pestReportCount] = await db
      .select({ count: count() })
      .from(pestReports)
      .where(eq(pestReports.userId, userId));

    const [plantAnalysisCount] = await db
      .select({ count: count() })
      .from(plantAnalyses)
      .where(eq(plantAnalyses.userId, userId));

    const userDetails = {
      ...userResult.user,
      farmProfile: userResult.farmProfile,
      deviceSessions: deviceSessionsList,
      fields: userFields,
      activityCounts: {
        pestReports: pestReportCount.count,
        plantAnalyses: plantAnalysisCount.count,
      },
    };

    res.json(userDetails);
  } catch (error) {
    logger.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user details",
    });
  }
});

/**
 * GET /api/admin/users/pest-outbreaks
 * Get pest outbreak data for map overlay
 */
router.get("/pest-outbreaks", async (req, res) => {
  try {
    // Get active pest outbreaks with location data
    const outbreaksWithLocation = await db
      .select({
        outbreak: pestOutbreaks,
        pestInfo: pestDiseaseTypes,
        reportCount: count(pestReports.id),
      })
      .from(pestOutbreaks)
      .leftJoin(pestDiseaseTypes, eq(pestOutbreaks.pestDiseaseTypeId, pestDiseaseTypes.id))
      .leftJoin(pestReports, eq(pestOutbreaks.id, pestReports.outbreakId))
      .where(eq(pestOutbreaks.status, "active"))
      .groupBy(pestOutbreaks.id, pestDiseaseTypes.id)
      .limit(100);

    // Get location coordinates for each outbreak
    const enrichedOutbreaks = await Promise.all(
      outbreaksWithLocation.map(async ({ outbreak, pestInfo, reportCount }) => {
        // Try to get coordinates from recent reports
        const [locationData] = await db
          .select({
            latitude: deviceSessions.latitude,
            longitude: deviceSessions.longitude,
            city: deviceSessions.city,
            state: deviceSessions.state,
            country: deviceSessions.country,
          })
          .from(pestReports)
          .leftJoin(deviceSessions, eq(pestReports.userId, deviceSessions.userId))
          .where(eq(pestReports.outbreakId, outbreak.id))
          .orderBy(desc(pestReports.reportedAt))
          .limit(1);

        if (!locationData?.latitude || !locationData?.longitude) {
          return null; // Skip outbreaks without location data
        }

        return {
          id: outbreak.id,
          location: outbreak.location,
          severity: outbreak.severity,
          status: outbreak.status,
          affectedFarms: outbreak.affectedFarms || 0,
          coordinates: {
            latitude: parseFloat(locationData.latitude as string),
            longitude: parseFloat(locationData.longitude as string),
          },
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          pestInfo: {
            name: pestInfo?.name || "Unknown",
            category: pestInfo?.category || "Unknown",
            riskLevel: pestInfo?.riskLevel || "medium",
            economicImpact: pestInfo?.economicImpact || "medium",
          },
          reportCount: reportCount || 0,
          firstReported: outbreak.firstReported?.toISOString(),
          lastUpdated: outbreak.updatedAt?.toISOString(),
        };
      })
    );

    // Filter out null results
    const validOutbreaks = enrichedOutbreaks.filter(outbreak => outbreak !== null);

    res.json(validOutbreaks);
  } catch (error) {
    logger.error("Error fetching pest outbreak data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pest outbreak data",
    });
  }
});

/**
 * GET /api/admin/users/farming-analytics
 * Get farming analytics data for map visualization
 */
router.get("/farming-analytics", async (req, res) => {
  try {
    // Get crop distribution by location
    const cropDistribution = await db
      .select({
        country: deviceSessions.country,
        state: deviceSessions.state,
        city: deviceSessions.city,
        cropType: sql<string>`unnest(${farmerProfiles.mainCrops})`,
        farmerCount: count(),
      })
      .from(farmerProfiles)
      .leftJoin(users, eq(farmerProfiles.userId, users.id))
      .leftJoin(deviceSessions, eq(users.id, deviceSessions.userId))
      .where(sql`${farmerProfiles.mainCrops} IS NOT NULL`)
      .groupBy(
        deviceSessions.country,
        deviceSessions.state, 
        deviceSessions.city,
        sql`unnest(${farmerProfiles.mainCrops})`
      )
      .limit(200);

    // Get farm size distribution
    const farmSizeDistribution = await db
      .select({
        country: deviceSessions.country,
        state: deviceSessions.state,
        avgFarmSize: sql<number>`AVG(CAST(${fields.size} AS DECIMAL))`,
        totalFarmArea: sql<number>`SUM(CAST(${fields.size} AS DECIMAL))`,
        farmCount: count(fields.id),
      })
      .from(fields)
      .leftJoin(users, eq(fields.userId, users.id))
      .leftJoin(deviceSessions, eq(users.id, deviceSessions.userId))
      .where(sql`${fields.size} IS NOT NULL`)
      .groupBy(deviceSessions.country, deviceSessions.state)
      .limit(100);

    // Get recent activity hotspots
    const activityHotspots = await db
      .select({
        country: deviceSessions.country,
        state: deviceSessions.state,
        city: deviceSessions.city,
        latitude: deviceSessions.latitude,
        longitude: deviceSessions.longitude,
        pestReports: count(pestReports.id),
        plantAnalyses: count(plantAnalyses.id),
        lastActivity: sql<string>`MAX(COALESCE(${pestReports.reportedAt}, ${plantAnalyses.createdAt}))`,
      })
      .from(deviceSessions)
      .leftJoin(users, eq(deviceSessions.userId, users.id))
      .leftJoin(pestReports, eq(users.id, pestReports.userId))
      .leftJoin(plantAnalyses, eq(users.id, plantAnalyses.userId))
      .where(
        and(
          sql`${deviceSessions.latitude} IS NOT NULL`,
          sql`${deviceSessions.longitude} IS NOT NULL`,
          gte(deviceSessions.lastActiveAt, sql`NOW() - INTERVAL '30 days'`)
        )
      )
      .groupBy(
        deviceSessions.country,
        deviceSessions.state,
        deviceSessions.city,
        deviceSessions.latitude,
        deviceSessions.longitude
      )
      .having(sql`COUNT(${pestReports.id}) > 0 OR COUNT(${plantAnalyses.id}) > 0`)
      .orderBy(desc(sql`COUNT(${pestReports.id}) + COUNT(${plantAnalyses.id})`))
      .limit(50);

    const analytics = {
      cropDistribution: cropDistribution.map(item => ({
        location: `${item.city || ''}, ${item.state || ''}, ${item.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
        cropType: item.cropType,
        farmerCount: item.farmerCount,
        country: item.country,
        state: item.state,
        city: item.city,
      })),
      farmSizeDistribution: farmSizeDistribution.map(item => ({
        location: `${item.state || ''}, ${item.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
        avgFarmSize: Math.round(item.avgFarmSize || 0),
        totalFarmArea: Math.round(item.totalFarmArea || 0),
        farmCount: item.farmCount,
        country: item.country,
        state: item.state,
      })),
      activityHotspots: activityHotspots.map(item => ({
        location: `${item.city || ''}, ${item.state || ''}, ${item.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
        coordinates: {
          latitude: parseFloat(item.latitude as string),
          longitude: parseFloat(item.longitude as string),
        },
        pestReports: item.pestReports,
        plantAnalyses: item.plantAnalyses,
        totalActivity: item.pestReports + item.plantAnalyses,
        lastActivity: item.lastActivity,
        country: item.country,
        state: item.state,
        city: item.city,
      })),
    };

    res.json(analytics);
  } catch (error) {
    logger.error("Error fetching farming analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch farming analytics",
    });
  }
});

export default router;
