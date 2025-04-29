import { eq, and, desc, sql, asc, or, inArray } from "drizzle-orm";
import { db } from "../db";
import { 
  chatRooms, chatRoomMembers, chatMessages, 
  users, ChatRoom, ChatMessage, ChatRoomMember,
  InsertChatRoom, InsertChatMessage, InsertChatRoomMember
} from "@shared/schema";

/**
 * Service for handling chat-related operations
 */
export class ChatService {
  /**
   * Create a new chat room
   */
  async createChatRoom(data: InsertChatRoom): Promise<ChatRoom> {
    try {
      const [room] = await db.insert(chatRooms).values(data).returning();
      return room;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw new Error('Failed to create chat room');
    }
  }

  /**
   * Get a chat room by ID
   */
  async getChatRoom(roomId: number): Promise<ChatRoom | null> {
    try {
      const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId));
      return room || null;
    } catch (error) {
      console.error(`Error fetching chat room ${roomId}:`, error);
      return null;
    }
  }

  /**
   * Add a member to a chat room
   */
  async addRoomMember(data: InsertChatRoomMember): Promise<ChatRoomMember> {
    try {
      const [member] = await db.insert(chatRoomMembers).values(data).returning();
      return member;
    } catch (error) {
      console.error('Error adding chat room member:', error);
      throw new Error('Failed to add member to chat room');
    }
  }

  /**
   * Get all members of a chat room
   */
  async getRoomMembers(roomId: number): Promise<ChatRoomMember[]> {
    try {
      const members = await db
        .select()
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.roomId, roomId));
      return members;
    } catch (error) {
      console.error(`Error fetching members for room ${roomId}:`, error);
      return [];
    }
  }

  /**
   * Send a message to a chat room
   */
  async sendMessage(data: InsertChatMessage): Promise<ChatMessage> {
    try {
      const [message] = await db.insert(chatMessages).values(data).returning();
      
      // Update the lastMessageAt timestamp in the chat room
      await db
        .update(chatRooms)
        .set({ lastMessageAt: new Date() })
        .where(eq(chatRooms.id, data.roomId));
      
      return message;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get chat messages for a room
   */
  async getMessages(roomId: number, limit: number = 50, before?: Date): Promise<ChatMessage[]> {
    try {
      let query = db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.roomId, roomId));
      
      if (before) {
        query = query.where(sql`${chatMessages.sentAt} < ${before}`);
      }
      
      const messages = await query
        .orderBy(desc(chatMessages.sentAt))
        .limit(limit);
      
      return messages;
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      return [];
    }
  }

  /**
   * Get all chat rooms for a user
   */
  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    try {
      const userRoomIds = await db
        .select({ roomId: chatRoomMembers.roomId })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId));
      
      if (userRoomIds.length === 0) {
        return [];
      }
      
      const roomIds = userRoomIds.map(r => r.roomId);
      
      const rooms = await db
        .select()
        .from(chatRooms)
        .where(inArray(chatRooms.id, roomIds))
        .orderBy(desc(chatRooms.lastMessageAt));
      
      return rooms;
    } catch (error) {
      console.error(`Error fetching chat rooms for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create a direct chat room between two users
   */
  async createDirectChatRoom(user1Id: number, user2Id: number): Promise<ChatRoom> {
    try {
      // Check if a direct chat already exists between these users
      const existingRooms = await this.findDirectChatRoom(user1Id, user2Id);
      
      if (existingRooms) {
        return existingRooms;
      }
      
      // Create a new direct chat room
      const [room] = await db
        .insert(chatRooms)
        .values({
          type: 'direct',
          createdById: user1Id,
          name: `Direct chat ${user1Id}-${user2Id}`,
        })
        .returning();
      
      // Add both users as members
      await db.insert(chatRoomMembers).values([
        {
          roomId: room.id,
          userId: user1Id,
          isAdmin: true,
        },
        {
          roomId: room.id,
          userId: user2Id,
          isAdmin: false,
        }
      ]);
      
      return room;
    } catch (error) {
      console.error(`Error creating direct chat between users ${user1Id} and ${user2Id}:`, error);
      throw new Error('Failed to create direct chat');
    }
  }

  /**
   * Find an existing direct chat room between two users
   */
  async findDirectChatRoom(user1Id: number, user2Id: number): Promise<ChatRoom | null> {
    try {
      // Find rooms where both users are members
      const user1Rooms = await db
        .select({ roomId: chatRoomMembers.roomId })
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, user1Id));
      
      if (user1Rooms.length === 0) {
        return null;
      }
      
      const user1RoomIds = user1Rooms.map(r => r.roomId);
      
      const user2Memberships = await db
        .select({ roomId: chatRoomMembers.roomId })
        .from(chatRoomMembers)
        .where(
          and(
            eq(chatRoomMembers.userId, user2Id),
            inArray(chatRoomMembers.roomId, user1RoomIds)
          )
        );
      
      if (user2Memberships.length === 0) {
        return null;
      }
      
      const commonRoomIds = user2Memberships.map(r => r.roomId);
      
      // Get direct chat rooms from these common rooms
      const [directRoom] = await db
        .select()
        .from(chatRooms)
        .where(
          and(
            inArray(chatRooms.id, commonRoomIds),
            eq(chatRooms.type, 'direct')
          )
        );
      
      return directRoom || null;
    } catch (error) {
      console.error(`Error finding direct chat between users ${user1Id} and ${user2Id}:`, error);
      return null;
    }
  }

  /**
   * Mark messages as read in a chat room
   */
  async markMessagesAsRead(roomId: number, userId: number): Promise<void> {
    try {
      const now = new Date();
      
      // Update the last read timestamp for the user in this room
      await db
        .update(chatRoomMembers)
        .set({ lastReadAt: now })
        .where(
          and(
            eq(chatRoomMembers.roomId, roomId),
            eq(chatRoomMembers.userId, userId)
          )
        );
      
      // Mark all unread messages as delivered/read
      await db
        .update(chatMessages)
        .set({ status: 'read' })
        .where(
          and(
            eq(chatMessages.roomId, roomId),
            sql`${chatMessages.status} != 'read'`,
            sql`${chatMessages.senderId} != ${userId}`
          )
        );
    } catch (error) {
      console.error(`Error marking messages as read in room ${roomId} for user ${userId}:`, error);
      throw new Error('Failed to mark messages as read');
    }
  }

  /**
   * Get unread message counts for all of a user's chat rooms
   */
  async getUnreadMessageCounts(userId: number): Promise<Record<number, number>> {
    try {
      // Get all rooms where the user is a member
      const memberships = await db
        .select()
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.userId, userId));
      
      if (memberships.length === 0) {
        return {};
      }
      
      const result: Record<number, number> = {};
      
      for (const membership of memberships) {
        // Count messages sent after the user's last read timestamp
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.roomId, membership.roomId),
              sql`${chatMessages.sentAt} > ${membership.lastReadAt}`,
              sql`${chatMessages.senderId} != ${userId}`
            )
          );
        
        result[membership.roomId] = count;
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting unread message counts for user ${userId}:`, error);
      return {};
    }
  }

  /**
   * Get chat room members with user details
   */
  async getRoomMembersWithUserInfo(roomId: number): Promise<any[]> {
    try {
      const members = await db
        .select({
          id: chatRoomMembers.id,
          userId: chatRoomMembers.userId,
          roomId: chatRoomMembers.roomId,
          joinedAt: chatRoomMembers.joinedAt,
          lastReadAt: chatRoomMembers.lastReadAt,
          isAdmin: chatRoomMembers.isAdmin,
          isMuted: chatRoomMembers.isMuted,
          nickname: chatRoomMembers.nickname,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
        })
        .from(chatRoomMembers)
        .innerJoin(users, eq(chatRoomMembers.userId, users.id))
        .where(eq(chatRoomMembers.roomId, roomId));
      
      return members;
    } catch (error) {
      console.error(`Error fetching members with user info for room ${roomId}:`, error);
      return [];
    }
  }

  /**
   * Get messages with sender details
   */
  async getMessagesWithSenderInfo(roomId: number, limit: number = 50, before?: Date): Promise<any[]> {
    try {
      let query = db
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
          senderProfileImage: users.profileImage,
        })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.senderId, users.id))
        .where(eq(chatMessages.roomId, roomId));
      
      if (before) {
        query = query.where(sql`${chatMessages.sentAt} < ${before}`);
      }
      
      const messages = await query
        .orderBy(desc(chatMessages.sentAt))
        .limit(limit);
      
      return messages;
    } catch (error) {
      console.error(`Error fetching messages with sender info for room ${roomId}:`, error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const chatService = new ChatService();