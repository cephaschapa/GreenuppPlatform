import { db } from "../db.js";
import { logger } from "./logger.js";
import { getCache, setCache, memoizedQuery } from "./cache.js";

/**
 * Query optimization utilities for better performance
 */

// Query execution time tracking
const queryStats = new Map<
  string,
  { count: number; totalTime: number; avgTime: number }
>();

/**
 * Track query performance
 */
export function trackQuery(queryName: string, executionTime: number) {
  const stats = queryStats.get(queryName) || {
    count: 0,
    totalTime: 0,
    avgTime: 0,
  };

  stats.count++;
  stats.totalTime += executionTime;
  stats.avgTime = stats.totalTime / stats.count;

  queryStats.set(queryName, stats);

  // Log slow queries
  if (executionTime > 1000) {
    logger.warn(`Slow query detected: ${queryName} took ${executionTime}ms`);
  }
}

/**
 * Get query performance statistics
 */
export function getQueryStats() {
  return Object.fromEntries(queryStats);
}

/**
 * Optimized pagination helper
 */
export function createPaginationQuery(
  baseQuery: any,
  page: number = 1,
  limit: number = 20,
  maxLimit: number = 100
) {
  const offset = (page - 1) * Math.min(limit, maxLimit);
  const actualLimit = Math.min(limit, maxLimit);

  return {
    query: baseQuery.limit(actualLimit).offset(offset),
    pagination: {
      page,
      limit: actualLimit,
      offset,
    },
  };
}

/**
 * Optimized search query with full-text search
 */
export function createSearchQuery(
  table: any,
  searchFields: string[],
  searchTerm: string,
  additionalConditions: any[] = []
) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return table.where(
      additionalConditions.length > 0 ? additionalConditions : undefined
    );
  }

  const searchConditions = searchFields.map(
    (field) => sql`${table[field]} ILIKE ${`%${searchTerm}%`}`
  );

  const allConditions = [...searchConditions, ...additionalConditions];

  return table.where(allConditions.length > 0 ? allConditions : undefined);
}

/**
 * Batch query executor for multiple related queries
 */
export async function executeBatchQueries<T>(
  queries: Array<() => Promise<T>>,
  options: {
    parallel?: boolean;
    batchSize?: number;
    cachePrefix?: string;
    cacheTTL?: number;
  } = {}
): Promise<T[]> {
  const {
    parallel = true,
    batchSize = 10,
    cachePrefix,
    cacheTTL = 300,
  } = options;

  if (parallel) {
    // Execute queries in parallel with batching
    const results: T[] = [];

    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (query, index) => {
          const queryIndex = i + index;
          const cacheKey = cachePrefix ? `${cachePrefix}:${queryIndex}` : null;

          if (cacheKey) {
            const cached = await getCache(cachePrefix!, cacheKey);
            if (cached !== null) {
              return cached;
            }
          }

          const startTime = Date.now();
          const result = await query();
          const executionTime = Date.now() - startTime;

          trackQuery(`batch_query_${queryIndex}`, executionTime);

          if (cacheKey) {
            await setCache(cachePrefix!, cacheKey, result, cacheTTL);
          }

          return result;
        })
      );

      results.push(...batchResults);
    }

    return results;
  } else {
    // Execute queries sequentially
    const results: T[] = [];

    for (let i = 0; i < queries.length; i++) {
      const cacheKey = cachePrefix ? `${cachePrefix}:${i}` : null;

      if (cacheKey) {
        const cached = await getCache(cachePrefix!, cacheKey);
        if (cached !== null) {
          results.push(cached);
          continue;
        }
      }

      const startTime = Date.now();
      const result = await queries[i]();
      const executionTime = Date.now() - startTime;

      trackQuery(`batch_query_${i}`, executionTime);

      if (cacheKey) {
        await setCache(cachePrefix!, cacheKey, result, cacheTTL);
      }

      results.push(result);
    }

    return results;
  }
}

/**
 * Optimized marketplace listings query with caching
 */
export const getOptimizedMarketplaceListings = memoizedQuery(
  async (params: {
    category?: string;
    search?: string;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    status?: string;
    locationId?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) => {
    const startTime = Date.now();

    // Build optimized query with proper joins
    const query = db
      .select({
        listing: marketplaceListings,
        location: locations,
        seller: users,
      })
      .from(marketplaceListings)
      .leftJoin(locations, eq(marketplaceListings.locationId, locations.id))
      .leftJoin(users, eq(marketplaceListings.sellerId, users.id));

    const conditions = [];

    // Add filters
    if (params.category && params.category !== "all") {
      conditions.push(eq(marketplaceListings.category, params.category));
    }

    if (params.sellerId) {
      conditions.push(eq(marketplaceListings.sellerId, params.sellerId));
    }

    if (params.condition) {
      conditions.push(eq(marketplaceListings.condition, params.condition));
    }

    if (params.status) {
      conditions.push(eq(marketplaceListings.status, params.status));
    }

    if (params.locationId) {
      conditions.push(eq(marketplaceListings.locationId, params.locationId));
    }

    if (params.minPrice !== undefined) {
      conditions.push(
        gte(marketplaceListings.price, params.minPrice.toString())
      );
    }

    if (params.maxPrice !== undefined) {
      conditions.push(
        lte(marketplaceListings.price, params.maxPrice.toString())
      );
    }

    if (params.search) {
      conditions.push(
        or(
          ilike(marketplaceListings.title, `%${params.search}%`),
          ilike(marketplaceListings.description, `%${params.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    // Apply sorting
    if (params.sortBy) {
      const [field, direction] = params.sortBy.split(":");
      const isDesc = direction === "desc";

      switch (field) {
        case "price":
          query.orderBy(
            isDesc
              ? desc(marketplaceListings.price)
              : asc(marketplaceListings.price)
          );
          break;
        case "createdAt":
          query.orderBy(
            isDesc
              ? desc(marketplaceListings.createdAt)
              : asc(marketplaceListings.createdAt)
          );
          break;
        case "title":
          query.orderBy(
            isDesc
              ? desc(marketplaceListings.title)
              : asc(marketplaceListings.title)
          );
          break;
        case "views":
          query.orderBy(
            isDesc
              ? desc(marketplaceListings.views)
              : asc(marketplaceListings.views)
          );
          break;
        default:
          query.orderBy(desc(marketplaceListings.createdAt));
      }
    } else {
      query.orderBy(desc(marketplaceListings.createdAt));
    }

    // Apply pagination
    if (params.limit !== undefined) {
      query.limit(params.limit);

      if (params.offset !== undefined) {
        query.offset(params.offset);
      }
    }

    const result = await query;
    const executionTime = Date.now() - startTime;

    trackQuery("marketplace_listings", executionTime);

    return result;
  },
  {
    ttl: 300000, // 5 minutes
    key: (params) => `marketplace_listings:${JSON.stringify(params)}`,
  }
);

/**
 * Optimized user tasks query with caching
 */
export const getOptimizedUserTasks = memoizedQuery(
  async (
    userId: number,
    filters: {
      status?: string;
      priority?: string;
      dueDate?: string;
      cropId?: number;
      fieldId?: number;
    } = {}
  ) => {
    const startTime = Date.now();

    const query = db
      .select({
        task: farmerTasks,
        crop: crops,
        field: fields,
      })
      .from(farmerTasks)
      .leftJoin(crops, eq(farmerTasks.cropId, crops.id))
      .leftJoin(fields, eq(farmerTasks.fieldId, fields.id))
      .where(eq(farmerTasks.userId, userId));

    const conditions = [eq(farmerTasks.userId, userId)];

    if (filters.status) {
      conditions.push(eq(farmerTasks.status, filters.status));
    }

    if (filters.priority) {
      conditions.push(eq(farmerTasks.priority, filters.priority));
    }

    if (filters.cropId) {
      conditions.push(eq(farmerTasks.cropId, filters.cropId));
    }

    if (filters.fieldId) {
      conditions.push(eq(farmerTasks.fieldId, filters.fieldId));
    }

    if (filters.dueDate) {
      conditions.push(eq(farmerTasks.dueDate, filters.dueDate));
    }

    query.where(and(...conditions));
    query.orderBy(asc(farmerTasks.dueDate));

    const result = await query;
    const executionTime = Date.now() - startTime;

    trackQuery("user_tasks", executionTime);

    return result;
  },
  {
    ttl: 60000, // 1 minute
    key: (userId, filters) => `user_tasks:${userId}:${JSON.stringify(filters)}`,
  }
);

/**
 * Database connection pool monitoring
 */
export async function getDatabaseStats() {
  try {
    const stats = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation,
        most_common_vals,
        most_common_freqs
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `);

    return stats;
  } catch (error) {
    logger.error("Failed to get database stats:", error);
    return [];
  }
}

/**
 * Query performance monitoring
 */
export function getPerformanceMetrics() {
  return {
    queryStats: getQueryStats(),
    databaseStats: getDatabaseStats(),
  };
}

export default {
  trackQuery,
  getQueryStats,
  createPaginationQuery,
  createSearchQuery,
  executeBatchQueries,
  getOptimizedMarketplaceListings,
  getOptimizedUserTasks,
  getDatabaseStats,
  getPerformanceMetrics,
};
