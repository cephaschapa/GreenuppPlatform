import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Channel names for pub/sub
export const REDIS_CHANNELS = {
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_READ: 'chat:read',
  NOTIFICATION: 'notification',
  USER_STATUS: 'user:status',
};

// Redis connection options
const REDIS_OPTIONS = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  // Reconnect strategy
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

class RedisService {
  private publisher: Redis;
  private subscriber: Redis;
  private client: Redis;
  private subscribers: Map<string, Set<(message: any) => void>> = new Map();
  private initialized = false;

  constructor() {
    this.publisher = new Redis(REDIS_OPTIONS);
    this.subscriber = new Redis(REDIS_OPTIONS);
    this.client = new Redis(REDIS_OPTIONS);

    this.setupSubscriber();
    this.setupErrorHandling();
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Test the connection
      await this.client.ping();
      this.initialized = true;
      logger.info('Redis service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Redis service:', error);
      logger.warn('Continuing without Redis functionality - fallback to database-only operations');
      // Don't throw error, just return false to indicate failure
      this.initialized = false;
      return false;
    }
  }

  // Set up the subscriber to handle messages
  private setupSubscriber() {
    this.subscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        const callbacks = this.subscribers.get(channel);
        
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              logger.error(`Error in Redis subscriber callback for channel ${channel}:`, error);
            }
          });
        }
      } catch (error) {
        logger.error(`Error processing Redis message on channel ${channel}:`, error);
      }
    });
  }

  // Set up error handling for Redis connections
  private setupErrorHandling() {
    const handleError = (client: Redis, name: string) => {
      client.on('error', (error) => {
        logger.error(`Redis ${name} error:`, error);
      });

      client.on('reconnecting', () => {
        logger.info(`Redis ${name} reconnecting...`);
      });

      client.on('ready', () => {
        logger.info(`Redis ${name} ready`);
      });
    };

    handleError(this.publisher, 'publisher');
    handleError(this.subscriber, 'subscriber');
    handleError(this.client, 'client');
  }

  // Subscribe to a channel
  async subscribe(channel: string, callback: (message: any) => void) {
    if (!this.initialized) {
      logger.warn(`Cannot subscribe to Redis channel ${channel}: Service not initialized`);
      return false;
    }
    
    try {
      if (!this.subscribers.has(channel)) {
        await this.subscriber.subscribe(channel);
        this.subscribers.set(channel, new Set());
      }
      
      this.subscribers.get(channel)?.add(callback);
      logger.info(`Subscribed to Redis channel: ${channel}`);
      return true;
    } catch (error) {
      logger.error(`Error subscribing to Redis channel ${channel}:`, error);
      return false;
    }
  }

  // Unsubscribe from a channel
  async unsubscribe(channel: string, callback?: (message: any) => void) {
    if (!this.initialized) {
      logger.warn(`Cannot unsubscribe from Redis channel ${channel}: Service not initialized`);
      return false;
    }
    
    if (!this.subscribers.has(channel)) return false;
    
    try {
      if (callback) {
        // Remove specific callback
        this.subscribers.get(channel)?.delete(callback);
        
        // If no callbacks left, unsubscribe from channel
        if (this.subscribers.get(channel)?.size === 0) {
          await this.subscriber.unsubscribe(channel);
          this.subscribers.delete(channel);
          logger.info(`Unsubscribed from Redis channel: ${channel}`);
        }
      } else {
        // Remove all callbacks
        await this.subscriber.unsubscribe(channel);
        this.subscribers.delete(channel);
        logger.info(`Unsubscribed from Redis channel: ${channel}`);
      }
      return true;
    } catch (error) {
      logger.error(`Error unsubscribing from Redis channel ${channel}:`, error);
      return false;
    }
  }

  // Publish a message to a channel
  async publish(channel: string, message: any) {
    if (!this.initialized) {
      logger.warn(`Cannot publish to Redis channel ${channel}: Service not initialized`);
      return false;
    }
    
    try {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      await this.publisher.publish(channel, messageString);
      logger.debug(`Published message to Redis channel: ${channel}`);
      return true;
    } catch (error) {
      logger.error(`Error publishing to Redis channel ${channel}:`, error);
      return false;
    }
  }

  // Redis key-value operations
  async set(key: string, value: any, expireSeconds?: number) {
    if (!this.initialized) {
      logger.warn(`Cannot set Redis key ${key}: Service not initialized`);
      return false;
    }
    
    try {
      const valueString = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (expireSeconds) {
        await this.client.set(key, valueString, 'EX', expireSeconds);
      } else {
        await this.client.set(key, valueString);
      }
      return true;
    } catch (error) {
      logger.error(`Error setting Redis key ${key}:`, error);
      return false;
    }
  }

  async get(key: string) {
    if (!this.initialized) {
      logger.warn(`Cannot get Redis key ${key}: Service not initialized`);
      return null;
    }
    
    try {
      const value = await this.client.get(key);
      
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        // If not valid JSON, return as is
        return value;
      }
    } catch (error) {
      logger.error(`Error getting Redis key ${key}:`, error);
      return null;
    }
  }

  async delete(key: string) {
    if (!this.initialized) {
      logger.warn(`Cannot delete Redis key ${key}: Service not initialized`);
      return false;
    }
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting Redis key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.initialized) {
      logger.warn(`Cannot check existence of Redis key ${key}: Service not initialized`);
      return false;
    }
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking existence of Redis key ${key}:`, error);
      return false;
    }
  }

  // List operations
  async listPush(key: string, value: any) {
    if (!this.initialized) {
      logger.warn(`Cannot push to Redis list ${key}: Service not initialized`);
      return false;
    }
    
    try {
      const valueString = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.rpush(key, valueString);
      return true;
    } catch (error) {
      logger.error(`Error pushing to Redis list ${key}:`, error);
      return false;
    }
  }

  async listRange(key: string, start: number, end: number) {
    if (!this.initialized) {
      logger.warn(`Cannot get range from Redis list ${key}: Service not initialized`);
      return [];
    }
    
    try {
      const items = await this.client.lrange(key, start, end);
      return items.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } catch (error) {
      logger.error(`Error getting range from Redis list ${key}:`, error);
      return [];
    }
  }

  // Close all Redis connections
  async close() {
    try {
      await this.publisher.quit();
      await this.subscriber.quit();
      await this.client.quit();
      logger.info('Redis connections closed');
    } catch (error) {
      logger.error('Error closing Redis connections:', error);
    }
  }
}

// Create and export a singleton instance
export const redisService = new RedisService();