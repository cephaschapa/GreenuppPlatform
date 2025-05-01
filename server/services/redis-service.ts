import { logger } from '../utils/logger';

// Channel names for pub/sub (kept for compatibility with existing code)
export const REDIS_CHANNELS = {
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_READ: 'chat:read',
  NOTIFICATION: 'notification',
  USER_STATUS: 'user:status',
};

/**
 * Mock Redis service - completely disabled version that never attempts to connect
 * This allows all code that uses Redis to continue working with database fallbacks
 */
class RedisService {
  private initialized = false;

  constructor() {
    // Set initialized to false to force database-only fallback paths
    this.initialized = false;
    logger.info('Redis service has been disabled - using database-only operations');
  }

  // Initialize method always returns false
  async initialize() {
    logger.info('Redis initialization skipped - database-only mode is active');
    return false;
  }

  // Subscribe to a channel - mock implementation
  async subscribe(channel: string, callback: (message: any) => void) {
    logger.debug(`Redis disabled: Skipped subscription to channel ${channel}`);
    return false;
  }

  // Unsubscribe from a channel - mock implementation
  async unsubscribe(channel: string, callback?: (message: any) => void) {
    logger.debug(`Redis disabled: Skipped unsubscription from channel ${channel}`);
    return false;
  }

  // Publish a message to a channel - mock implementation
  async publish(channel: string, message: any) {
    logger.debug(`Redis disabled: Skipped publishing to channel ${channel}`);
    return false;
  }

  // Redis key-value operations - mock implementations
  async set(key: string, value: any, expireSeconds?: number) {
    logger.debug(`Redis disabled: Skipped setting key ${key}`);
    return false;
  }

  async get(key: string) {
    logger.debug(`Redis disabled: Skipped getting key ${key}`);
    return null;
  }

  async delete(key: string) {
    logger.debug(`Redis disabled: Skipped deleting key ${key}`);
    return false;
  }

  async exists(key: string): Promise<boolean> {
    logger.debug(`Redis disabled: Skipped checking existence of key ${key}`);
    return false;
  }

  // List operations - mock implementations
  async listPush(key: string, value: any) {
    logger.debug(`Redis disabled: Skipped pushing to list ${key}`);
    return false;
  }

  async listRange(key: string, start: number, end: number) {
    logger.debug(`Redis disabled: Skipped getting range from list ${key}`);
    return [];
  }

  // Always return false for ready check to force database fallbacks
  isReady(): boolean {
    return false;
  }
  
  // Mock close method
  async close() {
    logger.debug('Redis disabled: No connections to close');
    return true;
  }
}

// Create and export a singleton instance
export const redisService = new RedisService();