import { Router, Request, Response } from 'express';
import { redisChatService } from '../services/redis-chat-service';
import { insertChatRoomSchema, insertChatMessageSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get all chat rooms for the authenticated user
 */
router.get('/rooms', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Using Redis chat service to get user rooms with cached data
    const rooms = await redisChatService.getUserRooms(req.user.id);
    res.json(rooms);
  } catch (error) {
    logger.error('Error fetching user chat rooms:', error);
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
    const members = await redisChatService.getRoomMembers(roomId);
    const isMember = members.includes(req.user.id);
    
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this chat room' });
    }
    
    // Get room data with members
    const room = await redisChatService.getUserRooms(req.user.id);
    const thisRoom = room.find(r => r.id === roomId);
    
    if (!thisRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    res.json(thisRoom);
  } catch (error) {
    logger.error(`Error fetching chat room:`, error);
    res.status(500).json({ message: 'Failed to fetch chat room' });
  }
});

/**
 * Get messages for a specific chat room
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
    
    // Parse query parameters
    const before = req.query.before as string || undefined;
    const limit = parseInt(req.query.limit as string || '50');
    
    console.log(`Fetching messages for room ${roomId}, user ${req.user.id}, limit ${limit}, before ${before || 'none'}`);
    
    // Get messages
    const messages = await redisChatService.getRoomMessages(roomId, req.user.id, limit, before);
    
    console.log(`Retrieved ${messages ? messages.length : 0} messages for room ${roomId}`);
    
    // Mark messages as read as a side effect
    await redisChatService.markMessagesAsRead(req.user.id, roomId);
    
    res.json(messages);
  } catch (error) {
    logger.error(`Error fetching chat messages:`, error);
    res.status(500).json({ message: 'Failed to fetch chat messages' });
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
    
    // Get or create direct chat room
    const room = await redisChatService.createDirectChat(req.user.id, userId);
    
    res.json(room);
  } catch (error) {
    logger.error('Error creating direct chat:', error);
    res.status(500).json({ message: 'Failed to create direct chat' });
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
    
    await redisChatService.markMessagesAsRead(req.user.id, roomId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
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
    const totalUnread = await redisChatService.getTotalUnreadCount(req.user.id);
    res.json({ count: totalUnread });
  } catch (error) {
    logger.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Failed to fetch unread message count' });
  }
});

/**
 * Get potential users to start a chat with (followed users)
 */
router.get('/potential-users', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const potentialUsers = await redisChatService.getPotentialChatUsers(req.user.id);
    res.json(potentialUsers);
  } catch (error) {
    logger.error('Error getting potential chat users:', error);
    res.status(500).json({ message: 'Failed to get potential chat users' });
  }
});

export default router;