import { Router, Request, Response } from 'express';
import { streamChatService } from '../services/stream-chat-service';
import { storage } from '../storage';

const router = Router();

/**
 * Get Stream Chat token for the current user
 */
router.get('/token', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.user.id;
    const token = streamChatService.generateToken(userId);
    
    res.json({ token });
  } catch (error) {
    console.error('Error generating Stream Chat token:', error);
    res.status(500).json({ error: 'Failed to generate chat token' });
  }
});

/**
 * Initialize Stream Chat for a user
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Create/update user in Stream Chat with proper user data
    const userData = {
      id: req.user.id.toString(),
      name: req.user.username,
      image: req.user.profileImage ?? '', // Use null coalescing operator to handle undefined
    };
    
    await streamChatService.createUser(userData);
    
    // Generate a token for the user
    const token = streamChatService.generateToken(req.user.id);
    
    res.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Error initializing Stream Chat:', error);
    res.status(500).json({ error: 'Failed to initialize chat' });
  }
});

/**
 * Create a direct chat with another user
 */
router.post('/direct', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if the target user exists
    const targetUser = await storage.getUser(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create/update both users in Stream Chat with properly formatted data
    const currentUserData = {
      id: req.user.id.toString(),
      name: req.user.username,
      image: req.user.profileImage ?? '',
    };
    
    const targetUserData = {
      id: targetUser.id.toString(),
      name: targetUser.username,
      image: targetUser.profileImage ?? '',
    };
    
    await streamChatService.createUser(currentUserData);
    await streamChatService.createUser(targetUserData);
    
    // Create a direct channel between the users
    const channel = await streamChatService.createDirectChannel(
      req.user.id,
      targetUser.id,
      `Chat between ${req.user.username} and ${targetUser.username}`
    );
    
    res.json({
      channel: {
        id: channel.id,
        type: channel.type,
        cid: `${channel.type}:${channel.id}`,
      },
    });
  } catch (error) {
    console.error('Error creating direct chat:', error);
    res.status(500).json({ error: 'Failed to create direct chat' });
  }
});

/**
 * Create a group chat
 */
router.post('/group', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, members } = req.body;
    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: 'Name and member IDs array are required' });
    }
    
    // Create/update the creator in Stream Chat with properly formatted data
    const creatorData = {
      id: req.user.id.toString(),
      name: req.user.username,
      image: req.user.profileImage ?? '',
    };
    await streamChatService.createUser(creatorData);
    
    // Create/update all members in Stream Chat with properly formatted data
    for (const memberId of members) {
      const member = await storage.getUser(memberId);
      if (member) {
        const memberData = {
          id: member.id.toString(),
          name: member.username,
          image: member.profileImage ?? '',
        };
        await streamChatService.createUser(memberData);
      }
    }
    
    // Create a group channel
    const channel = await streamChatService.createGroupChannel(
      name,
      req.user.id,
      members
    );
    
    res.json({
      channel: {
        id: channel.id,
        type: channel.type,
        cid: `${channel.type}:${channel.id}`,
      },
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: 'Failed to create group chat' });
  }
});

/**
 * Get user's channels
 */
router.get('/channels', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const channels = await streamChatService.getUserChannels(req.user.id);
    
    res.json({
      channels: channels.map(channel => ({
        id: channel.id,
        type: channel.type,
        cid: `${channel.type}:${channel.id}`,
        data: channel.data,
      })),
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

export default router;