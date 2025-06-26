import { createClient } from "redis";
import memoizee from "memoizee";
import { logger } from "./logger.js";

// Redis client for distributed caching
let redisClient: ReturnType<typeof createClient> | null = null;

// In-memory cache for local caching
const memoryCache = new Map<string, { value: any; expires: number }>();

// Cache configuration
const CACHE_CONFIG = {
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    ttl: 3600, // 1 hour default
  },
  // Memory cache configuration
  memory: {
    maxSize: 1000, // Maximum number of items
    ttl: 300000, // 5 minutes default
  },
  // Query cache configuration
  query: {
    ttl: 600000, // 10 minutes
    maxSize: 500,
  },
};

/**
 * Initialize Redis client
 */
export async function initializeCache() {
  try {
    if (process.env.REDIS_URL) {
      redisClient = createClient({
        url: CACHE_CONFIG.redis.url,
      });

      redisClient.on("error", (err) => {
        logger.error("Redis Client Error:", err);
      });

      await redisClient.connect();
      logger.info("✅ Redis cache initialized");
    } else {
      logger.warn("⚠️ Redis URL not provided, using memory cache only");
    }
  } catch (error) {
    logger.error("❌ Failed to initialize Redis cache:", error);
    redisClient = null;
  }
}

/**
 * Get cache key with prefix
 */
function getCacheKey(prefix: string, key: string): string {
  return `greenupp:${prefix}:${key}`;
}

/**
 * Set cache value
 */
export async function setCache(
  prefix: string,
  key: string,
  value: any,
  ttl: number = CACHE_CONFIG.redis.ttl
): Promise<void> {
  const cacheKey = getCacheKey(prefix, key);

  try {
    // Set in Redis if available
    if (redisClient) {
      await redisClient.setEx(cacheKey, ttl, JSON.stringify(value));
    }

    // Set in memory cache
    memoryCache.set(cacheKey, {
      value,
      expires: Date.now() + CACHE_CONFIG.memory.ttl,
    });

    // Clean up memory cache if it gets too large
    if (memoryCache.size > CACHE_CONFIG.memory.maxSize) {
      const firstKey = memoryCache.keys().next().value;
      memoryCache.delete(firstKey);
    }
  } catch (error) {
    logger.error("Cache set error:", error);
  }
}

/**
 * Get cache value
 */
export async function getCache<T>(
  prefix: string,
  key: string
): Promise<T | null> {
  const cacheKey = getCacheKey(prefix, key);

  try {
    // Check memory cache first
    const memoryItem = memoryCache.get(cacheKey);
    if (memoryItem && memoryItem.expires > Date.now()) {
      return memoryItem.value as T;
    }

    // Check Redis cache
    if (redisClient) {
      const value = await redisClient.get(cacheKey);
      if (value) {
        const parsedValue = JSON.parse(value);

        // Update memory cache
        memoryCache.set(cacheKey, {
          value: parsedValue,
          expires: Date.now() + CACHE_CONFIG.memory.ttl,
        });

        return parsedValue as T;
      }
    }

    return null;
  } catch (error) {
    logger.error("Cache get error:", error);
    return null;
  }
}

/**
 * Delete cache value
 */
export async function deleteCache(prefix: string, key: string): Promise<void> {
  const cacheKey = getCacheKey(prefix, key);

  try {
    // Delete from Redis
    if (redisClient) {
      await redisClient.del(cacheKey);
    }

    // Delete from memory cache
    memoryCache.delete(cacheKey);
  } catch (error) {
    logger.error("Cache delete error:", error);
  }
}

/**
 * Clear all cache for a prefix
 */
export async function clearCachePrefix(prefix: string): Promise<void> {
  try {
    // Clear from Redis
    if (redisClient) {
      const keys = await redisClient.keys(getCacheKey(prefix, "*"));
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }

    // Clear from memory cache
    const prefixKey = getCacheKey(prefix, "");
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefixKey)) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    logger.error("Cache clear prefix error:", error);
  }
}

/**
 * Memoized function wrapper for query caching
 */
export function memoizedQuery<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    ttl?: number;
    maxAge?: number;
    key?: (...args: Parameters<T>) => string;
  } = {}
): T {
  return memoizee(fn, {
    maxAge: options.ttl || CACHE_CONFIG.query.ttl,
    promise: true,
    primitive: true,
    normalizer: options.key || ((args) => JSON.stringify(args)),
  }) as T;
}

/**
 * Cache decorator for class methods
 */
export function cached(prefix: string, ttl: number = CACHE_CONFIG.redis.ttl) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`;
      const cached = await getCache(prefix, cacheKey);

      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      await setCache(prefix, cacheKey, result, ttl);

      return result;
    };
  };
}

/**
 * Cache middleware for Express routes
 */
export function cacheMiddleware(
  prefix: string,
  ttl: number = CACHE_CONFIG.redis.ttl,
  keyGenerator?: (req: any) => string
) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = keyGenerator ? keyGenerator(req) : req.originalUrl;
    const cached = await getCache(prefix, cacheKey);

    if (cached !== null) {
      return res.json(cached);
    }

    // Store original send method
    const originalSend = res.json;

    // Override send method to cache response
    res.json = function (body: any) {
      setCache(prefix, cacheKey, body, ttl);
      return originalSend.call(this, body);
    };

    next();
  };
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memory: {
      size: memoryCache.size,
      maxSize: CACHE_CONFIG.memory.maxSize,
    },
    redis: {
      connected: redisClient?.isReady || false,
    },
  };
}

/**
 * Clean up expired memory cache entries
 */
export function cleanupMemoryCache() {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expires <= now) {
      memoryCache.delete(key);
    }
  }
}

// Clean up memory cache every 5 minutes
setInterval(cleanupMemoryCache, 5 * 60 * 1000);

export default {
  initializeCache,
  setCache,
  getCache,
  deleteCache,
  clearCachePrefix,
  memoizedQuery,
  cached,
  cacheMiddleware,
  getCacheStats,
};
