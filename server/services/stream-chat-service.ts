import { StreamChat, Channel as StreamChannel, UserResponse, DefaultGenerics } from 'stream-chat';
import { User } from '@shared/schema';

// Initialize Stream Chat client
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Create a logger to help with debugging
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[StreamChat] INFO: ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[StreamChat] ERROR: ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[StreamChat] WARN: ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[StreamChat] DEBUG: ${message}`, ...args)
};

// Log API key and secret status (not the actual values)
logger.info(`Stream Chat API Key status: ${apiKey ? `Set (length: ${  apiKey.length  })` : 'NOT SET'}`);
logger.info(`Stream Chat API Secret status: ${apiSecret ? `Set (length: ${  apiSecret.length  })` : 'NOT SET'}`);

let serverClient: StreamChat | null = null;

try {
  if (!apiKey || !apiSecret) {
    logger.error('Stream Chat API credentials are missing. Please set STREAM_API_KEY and STREAM_API_SECRET environment variables.');
  } else {
    serverClient = StreamChat.getInstance(apiKey, apiSecret);
    logger.info('Stream Chat client initialized successfully');
  }
} catch (error) {
  logger.error('Failed to initialize Stream Chat client:', error);
  serverClient = null;
}

export class StreamChatService {
  /**
   * Create a user in Stream Chat
   */
  async createUser(user: any): Promise<any> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      // If it's a User object from our database
      if (typeof user.username === 'string') {
        const userData = {
          id: user.id.toString(), // Stream user IDs must be strings
          name: user.username,
          role: 'user',
          image: '', // Default empty string, no profileImage in User type
        };
        
        // Upsert the user to Stream Chat
        await serverClient!.upsertUser(userData);
        logger.info(`User created in Stream Chat: ${user.id}`);
        return userData;
      } 
      // If it's already a formatted user object 
      else if (typeof user.name === 'string') {
        await serverClient!.upsertUser(user);
        logger.info(`Pre-formatted user created in Stream Chat: ${user.id}`);
        return user;
      }
      
      throw new Error('Invalid user format');
    } catch (error) {
      logger.error('Error creating user in Stream Chat:', error);
      throw error;
    }
  }
  
  /**
   * Generate a token for client-side authentication
   */
  generateToken(userId: number): string {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      return serverClient!.createToken(userId.toString());
    } catch (error) {
      logger.error('Error generating Stream Chat token:', error);
      throw error;
    }
  }
  
  /**
   * Create a direct messaging channel between two users
   */
  async createDirectChannel(
    user1Id: number,
    user2Id: number,
    channelName?: string
  ): Promise<StreamChannel> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      // Sort the user IDs to ensure consistency for channel IDs
      const members = [user1Id.toString(), user2Id.toString()].sort();
      const channelId = `messaging-${members.join('-')}`;
      
      const channel = serverClient!.channel('messaging', channelId, {
        name: channelName || `Direct Chat ${user1Id}-${user2Id}`,
        members,
        created_by_id: user1Id.toString(),
      });
      
      // Create the channel
      await channel.create();
      logger.info(`Direct channel created: ${channelId}`);
      
      return channel;
    } catch (error) {
      logger.error('Error creating direct channel:', error);
      throw error;
    }
  }
  
  /**
   * Create a group channel
   */
  async createGroupChannel(
    name: string,
    creatorId: number,
    memberIds: number[]
  ): Promise<StreamChannel> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      // Add the creator to the members if not already included
      if (!memberIds.includes(creatorId)) {
        memberIds.push(creatorId);
      }
      
      // Convert all member IDs to strings
      const members = memberIds.map(id => id.toString());
      
      // Create a unique channel ID
      const channelId = `group-${new Date().getTime()}`;
      
      const channel = serverClient!.channel('messaging', channelId, {
        name,
        members,
        created_by_id: creatorId.toString(),
      });
      
      // Create the channel
      await channel.create();
      logger.info(`Group channel created: ${channelId}`);
      
      return channel;
    } catch (error) {
      logger.error('Error creating group channel:', error);
      throw error;
    }
  }
  
  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string, channelType: string = 'messaging'): Promise<void> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      const channel = serverClient!.channel(channelType, channelId);
      await channel.delete();
      logger.info(`Channel deleted: ${channelId}`);
    } catch (error) {
      logger.error('Error deleting channel:', error);
      throw error;
    }
  }
  
  /**
   * Add members to a channel
   */
  async addMembersToChannel(
    channelId: string,
    memberIds: number[],
    channelType: string = 'messaging'
  ): Promise<void> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      const channel = serverClient!.channel(channelType, channelId);
      
      // Convert all member IDs to strings
      const members = memberIds.map(id => id.toString());
      
      await channel.addMembers(members);
      logger.info(`Members added to channel ${channelId}:`, members);
    } catch (error) {
      logger.error('Error adding members to channel:', error);
      throw error;
    }
  }
  
  /**
   * Remove members from a channel
   */
  async removeMembersFromChannel(
    channelId: string,
    memberIds: number[],
    channelType: string = 'messaging'
  ): Promise<void> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      const channel = serverClient!.channel(channelType, channelId);
      
      // Convert all member IDs to strings
      const members = memberIds.map(id => id.toString());
      
      await channel.removeMembers(members);
      logger.info(`Members removed from channel ${channelId}:`, members);
    } catch (error) {
      logger.error('Error removing members from channel:', error);
      throw error;
    }
  }
  
  /**
   * Get a user's channels
   */
  async getUserChannels(userId: number): Promise<StreamChannel[]> {
    try {
      if (!serverClient) {
        throw new Error('Stream Chat client is not initialized. Please check API credentials.');
      }
      
      const filter = { type: 'messaging', members: { $in: [userId.toString()] } };
      
      // Fixed sort format - direction must be -1 or 1, not negative number object
      // Stream Chat API expects string values for sort direction
      const sort = [{ last_message_at: -1 }];
      
      logger.debug('Querying channels with filter:', filter);
      logger.debug('Sort parameters:', sort);
      
      const result = await serverClient!.queryChannels(filter, sort as any, {
        watch: false,
        state: true,
      });
      
      logger.info(`Found ${result.length} channels for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error fetching user channels:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const streamChatService = new StreamChatService();