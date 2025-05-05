import { StreamChat, Channel as StreamChannel, UserResponse } from 'stream-chat';
import { User } from '@shared/schema';

// Initialize Stream Chat client
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error('Stream Chat API credentials are missing. Please set STREAM_API_KEY and STREAM_API_SECRET environment variables.');
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export class StreamChatService {
  /**
   * Create a user in Stream Chat
   */
  async createUser(user: User): Promise<UserResponse> {
    try {
      // Create the user
      const response = await serverClient.upsertUser({
        id: user.id.toString(), // Stream user IDs must be strings
        name: user.username,
        role: 'user',
        image: user.profileImage || '',
      });
      
      console.log(`User created in Stream Chat: ${user.id}`);
      return response;
    } catch (error) {
      console.error('Error creating user in Stream Chat:', error);
      throw error;
    }
  }
  
  /**
   * Generate a token for client-side authentication
   */
  generateToken(userId: number): string {
    try {
      return serverClient.createToken(userId.toString());
    } catch (error) {
      console.error('Error generating Stream Chat token:', error);
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
      // Sort the user IDs to ensure consistency for channel IDs
      const members = [user1Id.toString(), user2Id.toString()].sort();
      const channelId = `messaging-${members.join('-')}`;
      
      const channel = serverClient.channel('messaging', channelId, {
        name: channelName || `Direct Chat ${user1Id}-${user2Id}`,
        members,
        created_by_id: user1Id.toString(),
      });
      
      // Create the channel
      await channel.create();
      console.log(`Direct channel created: ${channelId}`);
      
      return channel;
    } catch (error) {
      console.error('Error creating direct channel:', error);
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
      // Add the creator to the members if not already included
      if (!memberIds.includes(creatorId)) {
        memberIds.push(creatorId);
      }
      
      // Convert all member IDs to strings
      const members = memberIds.map(id => id.toString());
      
      // Create a unique channel ID
      const channelId = `group-${new Date().getTime()}`;
      
      const channel = serverClient.channel('messaging', channelId, {
        name,
        members,
        created_by_id: creatorId.toString(),
      });
      
      // Create the channel
      await channel.create();
      console.log(`Group channel created: ${channelId}`);
      
      return channel;
    } catch (error) {
      console.error('Error creating group channel:', error);
      throw error;
    }
  }
  
  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string, channelType: string = 'messaging'): Promise<void> {
    try {
      const channel = serverClient.channel(channelType, channelId);
      await channel.delete();
      console.log(`Channel deleted: ${channelId}`);
    } catch (error) {
      console.error('Error deleting channel:', error);
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
      const channel = serverClient.channel(channelType, channelId);
      
      // Convert all member IDs to strings
      const members = memberIds.map(id => id.toString());
      
      await channel.addMembers(members);
      console.log(`Members added to channel ${channelId}:`, members);
    } catch (error) {
      console.error('Error adding members to channel:', error);
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
      const channel = serverClient.channel(channelType, channelId);
      
      // Convert all member IDs to strings
      const members = memberIds.map(id => id.toString());
      
      await channel.removeMembers(members);
      console.log(`Members removed from channel ${channelId}:`, members);
    } catch (error) {
      console.error('Error removing members from channel:', error);
      throw error;
    }
  }
  
  /**
   * Get a user's channels
   */
  async getUserChannels(userId: number): Promise<StreamChannel[]> {
    try {
      const filter = { type: 'messaging', members: { $in: [userId.toString()] } };
      const sort = [{ last_message_at: -1 }];
      
      const { channels } = await serverClient.queryChannels(filter, sort, {
        watch: false,
        state: true,
      });
      
      return channels;
    } catch (error) {
      console.error('Error fetching user channels:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const streamChatService = new StreamChatService();