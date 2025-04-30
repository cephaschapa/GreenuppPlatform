import { WebSocket } from 'ws';
import { redisService, REDIS_CHANNELS } from './redis-service';
import { logger } from '../utils/logger';
import { db } from '../db';
import { eq, and, desc, sql, or, inArray } from 'drizzle-orm';
import {
  chatRooms,
  chatRoomMembers,
  chatMessages,
  users
} from '@shared/schema';
import { userRelationships } from '@shared/green-socials-schema';

// Maps user IDs to active WebSocket clients
const userClients: Map<number, Set<WebSocket>> = new Map();

// Structure of a chat message object
interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  status: string;
  sentAt: string;
  media?: string | null;
  replyToId?: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  senderUsername: string;
  senderFirstName?: string | null;
  senderLastName?: string | null;
  senderProfileImage?: string | null;
}

// Structure of typing indicator data
interface TypingIndicator {
  roomId: number;
  userId: number;
  username: string;
  isTyping: boolean;
}

// Structure for room read status updates
interface RoomReadStatus {
  roomId: number;
  userId: number;
  timestamp: string;
}

export class RedisChatService {
  private initialized = false;

  constructor() {}

  // Initialize the service
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Initialize Redis service first
      const redisInitialized = await redisService.initialize();
      
      if (!redisInitialized) {
        logger.warn('Redis service not available - chat will use standard database operations');
        return false;
      }
      
      // Subscribe to Redis channels
      await this.setupSubscriptions();
      
      this.initialized = true;
      logger.info('Redis Chat Service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Redis Chat Service:', error);
      logger.warn('Chat service will use standard database operations');
      this.initialized = false;
      return false;
    }
  }

  // Set up Redis subscriptions
  private async setupSubscriptions() {
    // Subscribe to chat messages
    await redisService.subscribe(REDIS_CHANNELS.CHAT_MESSAGE, (message) => {
      this.handleChatMessage(message);
    });

    // Subscribe to typing indicators
    await redisService.subscribe(REDIS_CHANNELS.CHAT_TYPING, (typingData) => {
      this.handleTypingIndicator(typingData);
    });

    // Subscribe to read receipts
    await redisService.subscribe(REDIS_CHANNELS.CHAT_READ, (readData) => {
      this.handleReadReceipt(readData);
    });
  }

  // Register a client for a user
  registerClient(userId: number, client: WebSocket) {
    if (!userClients.has(userId)) {
      userClients.set(userId, new Set());
    }
    userClients.get(userId)?.add(client);
    logger.info(`Client registered for user ${userId}`);
    
    // Update user's online status in Redis
    this.updateUserStatus(userId, true);
    
    return () => this.unregisterClient(userId, client);
  }

  // Unregister a client for a user
  unregisterClient(userId: number, client: WebSocket) {
    userClients.get(userId)?.delete(client);
    if (userClients.get(userId)?.size === 0) {
      userClients.delete(userId);
      
      // Update user's offline status in Redis
      this.updateUserStatus(userId, false);
    }
    logger.info(`Client unregistered for user ${userId}`);
  }

  // Update user's online status
  async updateUserStatus(userId: number, isOnline: boolean) {
    try {
      const status = {
        userId,
        isOnline,
        timestamp: new Date().toISOString()
      };
      
      // Store user status in Redis
      await redisService.set(`user:status:${userId}`, status);
      
      // Publish status update
      await redisService.publish(REDIS_CHANNELS.USER_STATUS, status);
      
      logger.debug(`User ${userId} status updated: ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      logger.error(`Error updating user status for user ${userId}:`, error);
    }
  }

  // Handle incoming chat message from Redis
  private handleChatMessage(message: ChatMessage) {
    // Get room members to send the message to
    this.getRoomMembers(message.roomId).then(memberIds => {
      // Send message to all connected clients of room members
      memberIds.forEach(memberId => {
        this.sendToUser(memberId, {
          type: 'chatMessage',
          data: message
        });
      });
    }).catch(error => {
      logger.error(`Error getting room members for message broadcast:`, error);
    });
  }

  // Handle typing indicator from Redis
  private handleTypingIndicator(typingData: TypingIndicator) {
    // Get room members to send the typing indicator to
    this.getRoomMembers(typingData.roomId).then(memberIds => {
      // Send typing indicator to all connected clients of room members (except the typer)
      memberIds.forEach(memberId => {
        if (memberId !== typingData.userId) {
          this.sendToUser(memberId, {
            type: 'typing',
            data: typingData
          });
        }
      });
    }).catch(error => {
      logger.error(`Error getting room members for typing indicator:`, error);
    });
  }

  // Handle read receipt from Redis
  private handleReadReceipt(readData: RoomReadStatus) {
    // Get room members to send the read receipt to
    this.getRoomMembers(readData.roomId).then(memberIds => {
      // Send read receipt to all connected clients of room members
      memberIds.forEach(memberId => {
        if (memberId !== readData.userId) {
          this.sendToUser(memberId, {
            type: 'messageRead',
            data: readData
          });
        }
      });
    }).catch(error => {
      logger.error(`Error getting room members for read receipt:`, error);
    });
  }

  // Get members of a room
  async getRoomMembers(roomId: number): Promise<number[]> {
    try {
      // First check if we have this cached in Redis
      const cacheKey = `chat:room:${roomId}:members`;
      const cachedMembers = await redisService.get(cacheKey);
      
      if (cachedMembers) {
        return cachedMembers as number[];
      }
      
      // If not cached, get from database
      const members = await db
        .select({ userId: chatRoomMembers.userId })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.roomId, roomId));
      
      const memberIds = members.map(m => m.userId);
      
      // Cache the result in Redis (expire after 5 minutes)
      await redisService.set(cacheKey, memberIds, 300);
      
      return memberIds;
    } catch (error) {
      logger.error(`Error getting room members for room ${roomId}:`, error);
      throw error;
    }
  }

  // Send a message to all connected clients of a user
  private sendToUser(userId: number, message: any) {
    const clients = userClients.get(userId);
    if (!clients || clients.size === 0) return;
    
    const messageString = JSON.stringify(message);
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  // Send a chat message
  async sendMessage(userId: number, roomId: number, content: string, replyToId?: number) {
    try {
      // Verify user is a member of the room
      const member = await db
        .select()
        .from(chatRoomMembers)
        .where(and(
          eq(chatRoomMembers.roomId, roomId),
          eq(chatRoomMembers.userId, userId)
        )).limit(1);
      
      if (member.length === 0) {
        throw new Error('User is not a member of this room');
      }
      
      // Get user info
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        throw new Error('User not found');
      }
      
      // Insert message into database
      const [message] = await db
        .insert(chatMessages)
        .values({
          roomId,
          senderId: userId,
          content,
          status: 'sent',
          sentAt: new Date().toISOString(),
          replyToId: replyToId || null
        })
        .returning();
      
      // Update room's last activity
      await db
        .update(chatRooms)
        .set({ 
          lastMessageAt: message.sentAt,
          updatedAt: new Date().toISOString()
        })
        .where(eq(chatRooms.id, roomId));
      
      // Create full message object with sender info
      const fullMessage: ChatMessage = {
        ...message,
        senderUsername: user[0].username,
        senderFirstName: user[0].firstName || null,
        senderLastName: user[0].lastName || null,
        senderProfileImage: user[0].profileImage || null
      };
      
      // Publish message to Redis
      await redisService.publish(REDIS_CHANNELS.CHAT_MESSAGE, fullMessage);
      
      // Store message in Redis for quick access
      const messageKey = `chat:message:${message.id}`;
      await redisService.set(messageKey, fullMessage, 86400); // Cache for 24 hours
      
      // Add to room's recent messages list
      const roomMessagesKey = `chat:room:${roomId}:messages`;
      await redisService.listPush(roomMessagesKey, message.id);
      
      return fullMessage;
    } catch (error) {
      logger.error(`Error sending message from user ${userId} to room ${roomId}:`, error);
      throw error;
    }
  }

  // Set typing indicator
  async setTyping(userId: number, roomId: number, isTyping: boolean) {
    try {
      // Get user info for the typing indicator
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        throw new Error('User not found');
      }
      
      const typingData: TypingIndicator = {
        roomId,
        userId,
        username: user[0].username,
        isTyping
      };
      
      // Publish typing indicator to Redis
      await redisService.publish(REDIS_CHANNELS.CHAT_TYPING, typingData);
      
      // Store in Redis with short expiration (10 seconds)
      const typingKey = `chat:typing:${roomId}:${userId}`;
      if (isTyping) {
        await redisService.set(typingKey, { timestamp: new Date().toISOString() }, 10);
      } else {
        await redisService.delete(typingKey);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error setting typing indicator for user ${userId} in room ${roomId}:`, error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(userId: number, roomId: number) {
    try {
      const timestamp = new Date().toISOString();
      
      // Update read status in database
      await db
        .update(chatRoomMembers)
        .set({ lastReadAt: timestamp })
        .where(and(
          eq(chatRoomMembers.roomId, roomId),
          eq(chatRoomMembers.userId, userId)
        ));
      
      // Publish read receipt to Redis
      const readData: RoomReadStatus = {
        roomId,
        userId,
        timestamp
      };
      
      await redisService.publish(REDIS_CHANNELS.CHAT_READ, readData);
      
      // Update Redis cache for unread counts
      await this.updateUnreadCountCache(userId);
      
      return true;
    } catch (error) {
      logger.error(`Error marking messages as read for user ${userId} in room ${roomId}:`, error);
      throw error;
    }
  }

  // Get user's chat rooms
  async getUserRooms(userId: number) {
    try {
      // Check cache first
      const cacheKey = `chat:user:${userId}:rooms`;
      const cachedRooms = await redisService.get(cacheKey);
      
      if (cachedRooms) {
        return cachedRooms;
      }
      
      // Get from database if not cached
      const userRoomMembers = await db
        .select({
          roomId: chatRoomMembers.roomId,
          lastReadAt: chatRoomMembers.lastReadAt
        })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId));
      
      const roomIds = userRoomMembers.map(m => m.roomId);
      
      if (roomIds.length === 0) {
        // Cache empty result
        await redisService.set(cacheKey, [], 300);
        return [];
      }
      
      // Get the rooms
      const rooms = await db
        .select({
          id: chatRooms.id,
          name: chatRooms.name,
          type: chatRooms.type,
          createdAt: chatRooms.createdAt,
          lastMessageAt: chatRooms.lastMessageAt
        })
        .from(chatRooms)
        .where(inArray(chatRooms.id, roomIds));
      
      // If there are rooms, enhance them with member info and unread counts
      if (rooms.length > 0) {
        const enhancedRooms = await Promise.all(rooms.map(async (room) => {
          const memberReadTime = userRoomMembers.find(m => m.roomId === room.id)?.lastReadAt;
          
          // Get unread count
          const unreadCount = await this.getRoomUnreadCount(room.id, userId, memberReadTime);
          
          // Get room members
          const members = await db
            .select({
              userId: chatRoomMembers.userId,
              username: users.username,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage
            })
            .from(chatRoomMembers)
            .leftJoin(users, eq(chatRoomMembers.userId, users.id))
            .where(eq(chatRoomMembers.roomId, room.id));
          
          return {
            ...room,
            members,
            unreadCount
          };
        }));
        
        // Cache the enhanced rooms (expire after 5 minutes)
        await redisService.set(cacheKey, enhancedRooms, 300);
        
        return enhancedRooms;
      }
      
      // Cache empty result
      await redisService.set(cacheKey, [], 300);
      return [];
    } catch (error) {
      logger.error(`Error getting rooms for user ${userId}:`, error);
      throw error;
    }
  }

  // Get unread message count for a room
  async getRoomUnreadCount(roomId: number, userId: number, lastReadAt?: string): Promise<number> {
    try {
      // Use Redis cache if available
      const cacheKey = `chat:unread:room:${roomId}:user:${userId}`;
      const cachedCount = await redisService.get(cacheKey);
      
      if (cachedCount !== null) {
        return cachedCount as number;
      }
      
      // Get from database if not cached
      if (!lastReadAt) {
        const member = await db
          .select({ lastReadAt: chatRoomMembers.lastReadAt })
          .from(chatRoomMembers)
          .where(and(
            eq(chatRoomMembers.roomId, roomId),
            eq(chatRoomMembers.userId, userId)
          ))
          .limit(1);
        
        if (member.length === 0) {
          return 0;
        }
        
        lastReadAt = member[0].lastReadAt;
      }
      
      // If never read, all messages are unread
      if (!lastReadAt) {
        const count = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(and(
            eq(chatMessages.roomId, roomId),
            sql`${chatMessages.senderId} != ${userId}`
          ));
        
        const unreadCount = count[0]?.count || 0;
        
        // Cache the result (expire after 5 minutes)
        await redisService.set(cacheKey, unreadCount, 300);
        
        return unreadCount;
      }
      
      // Count messages after last read time
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(and(
          eq(chatMessages.roomId, roomId),
          sql`${chatMessages.senderId} != ${userId}`,
          sql`${chatMessages.sentAt} > ${lastReadAt}`
        ));
      
      const unreadCount = count[0]?.count || 0;
      
      // Cache the result (expire after 5 minutes)
      await redisService.set(cacheKey, unreadCount, 300);
      
      return unreadCount;
    } catch (error) {
      logger.error(`Error getting unread count for room ${roomId}, user ${userId}:`, error);
      return 0;
    }
  }

  // Get total unread message count for a user
  async getTotalUnreadCount(userId: number): Promise<number> {
    try {
      // Use Redis cache if available
      const cacheKey = `chat:unread:total:user:${userId}`;
      const cachedCount = await redisService.get(cacheKey);
      
      if (cachedCount !== null) {
        return cachedCount as number;
      }
      
      // Get all user's room memberships
      const memberships = await db
        .select({
          roomId: chatRoomMembers.roomId,
          lastReadAt: chatRoomMembers.lastReadAt
        })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId));
      
      if (memberships.length === 0) {
        return 0;
      }
      
      // Sum unread counts for all rooms
      let totalUnread = 0;
      
      for (const membership of memberships) {
        const unread = await this.getRoomUnreadCount(
          membership.roomId, 
          userId, 
          membership.lastReadAt
        );
        totalUnread += unread;
      }
      
      // Cache the result (expire after 5 minutes)
      await redisService.set(cacheKey, totalUnread, 300);
      
      return totalUnread;
    } catch (error) {
      logger.error(`Error getting total unread count for user ${userId}:`, error);
      return 0;
    }
  }

  // Update the unread count cache for a user
  async updateUnreadCountCache(userId: number): Promise<void> {
    try {
      // Clear user's room cache
      const roomsCacheKey = `chat:user:${userId}:rooms`;
      await redisService.delete(roomsCacheKey);
      
      // Clear user's total unread cache
      const totalUnreadCacheKey = `chat:unread:total:user:${userId}`;
      await redisService.delete(totalUnreadCacheKey);
      
      // Get all user's room memberships
      const memberships = await db
        .select({
          roomId: chatRoomMembers.roomId
        })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId));
      
      // Clear room unread caches
      for (const membership of memberships) {
        const roomUnreadCacheKey = `chat:unread:room:${membership.roomId}:user:${userId}`;
        await redisService.delete(roomUnreadCacheKey);
      }
    } catch (error) {
      logger.error(`Error updating unread count cache for user ${userId}:`, error);
    }
  }

  // Get room messages
  async getRoomMessages(roomId: number, userId: number, limit = 50, before?: string) {
    try {
      // Verify user is a member of the room
      const member = await db
        .select()
        .from(chatRoomMembers)
        .where(and(
          eq(chatRoomMembers.roomId, roomId),
          eq(chatRoomMembers.userId, userId)
        )).limit(1);
      
      if (member.length === 0) {
        throw new Error('User is not a member of this room');
      }
      
      // Build query conditions
      let conditions = eq(chatMessages.roomId, roomId);
      
      if (before) {
        conditions = and(conditions, sql`${chatMessages.sentAt} < ${before}`);
      }
      
      // Get messages from database
      const messages = await db
        .select({
          id: chatMessages.id,
          roomId: chatMessages.roomId,
          senderId: chatMessages.senderId,
          content: chatMessages.content,
          status: chatMessages.status,
          sentAt: chatMessages.sentAt,
          media: chatMessages.media,
          replyToId: chatMessages.replyToId,
          isEdited: chatMessages.isEdited,
          isDeleted: chatMessages.isDeleted,
          senderUsername: users.username,
          senderFirstName: users.firstName,
          senderLastName: users.lastName,
          senderProfileImage: users.profileImage
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .where(conditions)
        .orderBy(desc(chatMessages.sentAt))
        .limit(limit);
      
      return messages.reverse();
    } catch (error) {
      logger.error(`Error getting messages for room ${roomId}:`, error);
      throw error;
    }
  }

  // Create a new direct chat room
  async createDirectChat(userId: number, otherUserId: number) {
    try {
      // Check if a direct chat between these users already exists
      const existingRoom = await db
        .select({
          roomId: chatRoomMembers.roomId
        })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId))
        .innerJoin(
          chatRooms, 
          and(
            eq(chatRoomMembers.roomId, chatRooms.id),
            eq(chatRooms.type, 'direct')
          )
        );
      
      const otherUserRooms = await db
        .select({
          roomId: chatRoomMembers.roomId
        })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, otherUserId));
      
      // Find common rooms (direct chats they share)
      const userRoomIds = existingRoom.map(r => r.roomId);
      const otherUserRoomIds = otherUserRooms.map(r => r.roomId);
      const commonRoomIds = userRoomIds.filter(id => otherUserRoomIds.includes(id));
      
      if (commonRoomIds.length > 0) {
        // Get the existing room
        const room = await db
          .select()
          .from(chatRooms)
          .where(eq(chatRooms.id, commonRoomIds[0]));
        
        if (room.length > 0) {
          // Get room members for the response
          const members = await db
            .select({
              userId: chatRoomMembers.userId,
              username: users.username,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage
            })
            .from(chatRoomMembers)
            .leftJoin(users, eq(chatRoomMembers.userId, users.id))
            .where(eq(chatRoomMembers.roomId, room[0].id));
          
          // Clear cache for this room
          await this.clearRoomCache(room[0].id);
          
          return {
            ...room[0],
            members,
            unreadCount: await this.getRoomUnreadCount(room[0].id, userId)
          };
        }
      }
      
      // Create a new direct chat room
      const [newRoom] = await db
        .insert(chatRooms)
        .values({
          name: `Direct chat ${userId}-${otherUserId}`,
          type: 'direct',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      
      // Add both users as members
      await db
        .insert(chatRoomMembers)
        .values([
          {
            roomId: newRoom.id,
            userId,
            joinedAt: new Date().toISOString()
          },
          {
            roomId: newRoom.id,
            userId: otherUserId,
            joinedAt: new Date().toISOString()
          }
        ]);
      
      // Get user information for the response
      const members = await db
        .select({
          userId: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        })
        .from(users)
        .where(or(
          eq(users.id, userId),
          eq(users.id, otherUserId)
        ));
      
      // Clear cache for both users
      await this.clearUserRoomCache(userId);
      await this.clearUserRoomCache(otherUserId);
      
      return {
        ...newRoom,
        members,
        unreadCount: 0
      };
    } catch (error) {
      logger.error(`Error creating direct chat between users ${userId} and ${otherUserId}:`, error);
      throw error;
    }
  }

  // Get potential chat users (users to start a new chat with)
  async getPotentialChatUsers(userId: number) {
    try {
      // Get users that the current user follows
      const following = await db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        })
        .from(users)
        .innerJoin(
          userRelationships,
          and(
            eq(userRelationships.targetUserId, users.id),
            eq(userRelationships.userId, userId),
            eq(userRelationships.type, 'follow')
          )
        );
      
      // Map to add relationship info
      const potentialUsers = following.map(user => ({
        ...user,
        relationship: 'following'
      }));
      
      // Add some additional suggested users (for demo purposes)
      const suggested = await db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        })
        .from(users)
        .where(
          and(
            sql`${users.id} != ${userId}`,
            sql`${users.id} NOT IN (SELECT "targetUserId" FROM user_relationships WHERE "userId" = ${userId} AND type = 'follow')`
          )
        )
        .limit(5);
      
      // Add suggested users with relationship info
      suggested.forEach(user => {
        potentialUsers.push({
          ...user,
          relationship: 'suggested'
        });
      });
      
      return potentialUsers;
    } catch (error) {
      logger.error(`Error getting potential chat users for user ${userId}:`, error);
      throw error;
    }
  }

  // Clear room cache
  private async clearRoomCache(roomId: number) {
    try {
      // Clear room members cache
      const membersKey = `chat:room:${roomId}:members`;
      await redisService.delete(membersKey);
      
      // Get room members to clear their caches
      const members = await db
        .select({ userId: chatRoomMembers.userId })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.roomId, roomId));
      
      // Clear cache for each member
      for (const member of members) {
        await this.clearUserRoomCache(member.userId);
      }
    } catch (error) {
      logger.error(`Error clearing cache for room ${roomId}:`, error);
    }
  }

  // Clear user room cache
  private async clearUserRoomCache(userId: number) {
    try {
      // Clear user's rooms cache
      const roomsKey = `chat:user:${userId}:rooms`;
      await redisService.delete(roomsKey);
      
      // Clear user's total unread count cache
      const unreadKey = `chat:unread:total:user:${userId}`;
      await redisService.delete(unreadKey);
      
      // Clear room-specific unread counts
      const memberships = await db
        .select({ roomId: chatRoomMembers.roomId })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId));
      
      for (const membership of memberships) {
        const roomUnreadKey = `chat:unread:room:${membership.roomId}:user:${userId}`;
        await redisService.delete(roomUnreadKey);
      }
    } catch (error) {
      logger.error(`Error clearing cache for user ${userId}:`, error);
    }
  }
}

// Create a singleton instance
export const redisChatService = new RedisChatService();