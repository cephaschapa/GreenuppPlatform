import { Router, Request, Response } from 'express';
import { chatService } from '../services/chat-service';
import { insertChatRoomSchema, insertChatMessageSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = Router();

/**
 * Get all chat rooms for the authenticated user
 */
router.get('/rooms', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const rooms = await chatService.getUserChatRooms(req.user.id);
    
    // Map rooms to include unread count
    const unreadCounts = await chatService.getUnreadMessageCounts(req.user.id);
    
    const roomsWithUnread = rooms.map(room => ({
      ...room,
      unreadCount: unreadCounts[room.id] || 0
    }));
    
    res.json(roomsWithUnread);
  } catch (error) {
    console.error('Error fetching user chat rooms:', error);
    res.status(500).json({ message: 'Failed to fetch chat rooms' });
  }
});

/**
 * Get a specific chat room by ID
 */
router.get('/rooms/:roomId', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    
    // Verify the user is a member of this room
    const members = await chatService.getRoomMembers(roomId);
    const isMember = members.some(m => m.userId === req.user!.id);
    
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this chat room' });
    }
    
    const room = await chatService.getChatRoom(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    // Get members with user info
    const membersWithInfo = await chatService.getRoomMembersWithUserInfo(roomId);
    
    res.json({
      ...room,
      members: membersWithInfo
    });
  } catch (error) {
    console.error(`Error fetching chat room:`, error);
    res.status(500).json({ message: 'Failed to fetch chat room' });
  }
});

/**
 * Create a new chat room
 */
router.post('/rooms', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const data = insertChatRoomSchema.parse({
      ...req.body,
      createdById: req.user.id
    });
    
    const room = await chatService.createChatRoom(data);
    
    // Add the creator as a member and admin
    await chatService.addRoomMember({
      roomId: room.id,
      userId: req.user.id,
      isAdmin: true
    });
    
    // Add other members if provided
    if (req.body.memberIds && Array.isArray(req.body.memberIds)) {
      for (const memberId of req.body.memberIds) {
        if (memberId !== req.user.id) {
          await chatService.addRoomMember({
            roomId: room.id,
            userId: memberId,
            isAdmin: false
          });
        }
      }
    }
    
    res.status(201).json(room);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Failed to create chat room' });
  }
});

/**
 * Create or get a direct chat with another user
 */
router.post('/direct', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { userId } = req.body;
    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create a direct chat with yourself' });
    }
    
    const room = await chatService.createDirectChatRoom(req.user.id, userId);
    
    // Get members with user info
    const membersWithInfo = await chatService.getRoomMembersWithUserInfo(room.id);
    
    res.status(201).json({
      ...room,
      members: membersWithInfo
    });
  } catch (error) {
    console.error('Error creating direct chat:', error);
    res.status(500).json({ message: 'Failed to create direct chat' });
  }
});

/**
 * Get messages for a chat room
 */
router.get('/rooms/:roomId/messages', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    
    // Verify the user is a member of this room
    const members = await chatService.getRoomMembers(roomId);
    const isMember = members.some(m => m.userId === req.user!.id);
    
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this chat room' });
    }
    
    // Parse query parameters
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before ? new Date(req.query.before as string) : undefined;
    
    const messages = await chatService.getMessagesWithSenderInfo(roomId, limit, before);
    
    res.json(messages);
  } catch (error) {
    console.error(`Error fetching chat messages:`, error);
    res.status(500).json({ message: 'Failed to fetch chat messages' });
  }
});

/**
 * Send a message to a chat room
 * (this is mainly for non-WebSocket fallback)
 */
router.post('/rooms/:roomId/messages', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    
    // Verify the user is a member of this room
    const members = await chatService.getRoomMembers(roomId);
    const isMember = members.some(m => m.userId === req.user!.id);
    
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this chat room' });
    }
    
    const data = insertChatMessageSchema.parse({
      ...req.body,
      roomId,
      senderId: req.user.id
    });
    
    const message = await chatService.sendMessage(data);
    
    // Get sender information to include in response
    const [senderInfo] = await chatService.getRoomMembersWithUserInfo(roomId);
    
    res.status(201).json({
      ...message,
      senderUsername: senderInfo?.username,
      senderFirstName: senderInfo?.firstName,
      senderLastName: senderInfo?.lastName,
      senderProfileImage: senderInfo?.profileImage
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

/**
 * Mark all messages in a room as read
 */
router.post('/rooms/:roomId/read', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    
    // Verify the user is a member of this room
    const members = await chatService.getRoomMembers(roomId);
    const isMember = members.some(m => m.userId === req.user!.id);
    
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this chat room' });
    }
    
    await chatService.markMessagesAsRead(roomId, req.user.id);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

/**
 * Get total unread message count across all rooms
 */
router.get('/unread/count', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const unreadCounts = await chatService.getUnreadMessageCounts(req.user.id);
    
    // Sum up all unread counts
    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    
    res.json({ count: totalUnread });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Failed to fetch unread message count' });
  }
});

export default router;