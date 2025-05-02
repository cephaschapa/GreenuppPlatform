import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { chatService } from './chat-service';
import { InsertChatMessage } from '@shared/schema';

type TypingStatusPayload = {
  roomId: number;
  isTyping: boolean;
  userId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
};

type MessagePayload = {
  roomId: number;
  content: string;
  media?: any;
  replyToId?: number;
};

interface UserSocket extends Socket {
  userId?: number;
  userInfo?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

/**
 * Service for handling Socket.IO chat functionality
 */
export class SocketIOChatService {
  private io: Server;
  private userSockets: Map<number, Set<string>> = new Map();
  private socketUsers: Map<string, number> = new Map();
  
  /**
   * Initialize Socket.IO server
   */
  constructor(httpServer: HttpServer) {
    // Create Socket.IO server and configure it
    this.io = new Server(httpServer, {
      path: '/socket.io',
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });
    
    // Set up connection handler
    this.io.on('connection', this.handleConnection.bind(this));
    
    console.log('Socket.IO Chat Service initialized');
  }
  
  /**
   * Handle new socket connection
   */
  private handleConnection(socket: UserSocket): void {
    console.log(`Socket connected: ${socket.id}`);
    
    // Handle authentication
    socket.on('auth', (data: { userId: number }) => {
      if (!data || !data.userId) {
        socket.emit('error', { message: 'Authentication failed: Invalid user ID' });
        return;
      }
      
      const userId = data.userId;
      this.authenticateSocket(socket, userId);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }
  
  /**
   * Authenticate a socket connection
   */
  private authenticateSocket(socket: UserSocket, userId: number): void {
    try {
      // Store userId in socket object
      socket.userId = userId;
      
      // Track socket by user ID
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(socket.id);
      this.socketUsers.set(socket.id, userId);
      
      // Get user info asynchronously
      this.fetchAndSetUserInfo(socket, userId);
      
      // Join rooms the user is a member of
      this.joinUserRooms(socket, userId);
      
      // Set up event listeners
      this.setupSocketEventListeners(socket);
      
      // Notify successful authentication
      socket.emit('auth_success', { userId });
      
      // Broadcast online status
      this.broadcastUserStatus(userId, true);
      
      console.log(`Socket ${socket.id} authenticated for user ${userId}`);
    } catch (error) {
      console.error(`Error authenticating socket for user ${userId}:`, error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  }
  
  /**
   * Fetch and set user info on socket
   */
  private async fetchAndSetUserInfo(socket: UserSocket, userId: number): Promise<void> {
    try {
      // Get user details from database
      const [userInfo] = await chatService.getUserInfo(userId);
      
      if (userInfo) {
        socket.userInfo = {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          username: userInfo.username
        };
      }
    } catch (error) {
      console.error(`Error fetching user info for user ${userId}:`, error);
    }
  }
  
  /**
   * Join user to all their chat room channels
   */
  private async joinUserRooms(socket: UserSocket, userId: number): Promise<void> {
    try {
      // Get all rooms the user is a member of
      const rooms = await chatService.getUserChatRooms(userId);
      
      // Join socket to each room's channel
      for (const room of rooms) {
        const roomChannel = `room:${room.id}`;
        socket.join(roomChannel);
        console.log(`Socket ${socket.id} joined room channel: ${roomChannel}`);
      }
    } catch (error) {
      console.error(`Error joining rooms for user ${userId}:`, error);
    }
  }
  
  /**
   * Set up event listeners for authenticated socket
   */
  private setupSocketEventListeners(socket: UserSocket): void {
    if (!socket.userId) return;
    
    // Handle chat message
    socket.on('chat_message', async (data: MessagePayload) => {
      await this.handleChatMessage(socket, data);
    });
    
    // Handle typing status
    socket.on('typing_status', (data: { roomId: number, isTyping: boolean }) => {
      this.handleTypingStatus(socket, data.roomId, data.isTyping);
    });
    
    // Handle room join
    socket.on('join_room', (data: { roomId: number }) => {
      this.handleJoinRoom(socket, data.roomId);
    });
    
    // Handle room leave
    socket.on('leave_room', (data: { roomId: number }) => {
      this.handleLeaveRoom(socket, data.roomId);
    });
    
    // Handle read receipt
    socket.on('mark_read', async (data: { roomId: number }) => {
      await this.handleMarkRead(socket, data.roomId);
    });
  }
  
  /**
   * Handle socket disconnection
   */
  private handleDisconnect(socket: UserSocket): void {
    const userId = socket.userId;
    const socketId = socket.id;
    
    console.log(`Socket disconnected: ${socketId}, User: ${userId}`);
    
    if (!userId) return;
    
    // Remove socket from tracking
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        // Last socket for this user, they're going offline
        this.userSockets.delete(userId);
        // Broadcast user went offline
        this.broadcastUserStatus(userId, false);
      }
    }
    
    this.socketUsers.delete(socketId);
  }
  
  /**
   * Handle incoming chat message
   */
  private async handleChatMessage(socket: UserSocket, data: MessagePayload): Promise<void> {
    try {
      const userId = socket.userId;
      if (!userId) return;
      
      const { roomId, content, media, replyToId } = data;
      
      // Validate message data
      if (!roomId || !content) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }
      
      // Save message to database
      const messageData: InsertChatMessage = {
        roomId,
        senderId: userId,
        content,
        status: 'sent',
        media,
        replyToId,
      };
      
      const message = await chatService.sendMessage(messageData);
      
      // Fetch the message with sender info
      const [messageWithSender] = await chatService.getMessagesWithSenderInfo(roomId, 1);
      
      // Broadcast to room
      const roomChannel = `room:${roomId}`;
      this.io.to(roomChannel).emit('new_message', messageWithSender);
      
      // Clear typing indicator
      this.handleTypingStatus(socket, roomId, false);
      
      console.log(`Message sent in room ${roomId} by user ${userId}`);
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }
  
  /**
   * Handle typing status change
   */
  private handleTypingStatus(socket: UserSocket, roomId: number, isTyping: boolean): void {
    try {
      const userId = socket.userId;
      if (!userId) return;
      
      const typingData: TypingStatusPayload = {
        roomId,
        isTyping,
        userId,
        firstName: socket.userInfo?.firstName,
        lastName: socket.userInfo?.lastName,
        username: socket.userInfo?.username,
      };
      
      // Broadcast to room except sender
      const roomChannel = `room:${roomId}`;
      socket.to(roomChannel).emit('typing_status', typingData);
    } catch (error) {
      console.error('Error handling typing status:', error);
    }
  }
  
  /**
   * Handle room join request
   */
  private handleJoinRoom(socket: UserSocket, roomId: number): void {
    try {
      const roomChannel = `room:${roomId}`;
      socket.join(roomChannel);
      console.log(`Socket ${socket.id} joined room channel: ${roomChannel}`);
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }
  
  /**
   * Handle room leave request
   */
  private handleLeaveRoom(socket: UserSocket, roomId: number): void {
    try {
      const roomChannel = `room:${roomId}`;
      socket.leave(roomChannel);
      console.log(`Socket ${socket.id} left room channel: ${roomChannel}`);
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }
  
  /**
   * Handle mark as read request
   */
  private async handleMarkRead(socket: UserSocket, roomId: number): Promise<void> {
    try {
      const userId = socket.userId;
      if (!userId) return;
      
      // Mark messages as read in database
      await chatService.markMessagesAsRead(roomId, userId);
      
      // Notify room about read status
      const roomChannel = `room:${roomId}`;
      this.io.to(roomChannel).emit('read_status', {
        roomId,
        userId,
        timestamp: new Date(),
      });
      
      console.log(`Messages marked as read in room ${roomId} by user ${userId}`);
    } catch (error) {
      console.error(`Error marking messages as read in room ${roomId}:`, error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  }
  
  /**
   * Broadcast user online/offline status to relevant rooms
   */
  private async broadcastUserStatus(userId: number, isOnline: boolean): Promise<void> {
    try {
      // Get all rooms the user is a member of
      const rooms = await chatService.getUserChatRooms(userId);
      
      // Broadcast status to each room
      for (const room of rooms) {
        const roomChannel = `room:${room.id}`;
        this.io.to(roomChannel).emit('user_status', {
          roomId: room.id,
          userId,
          isOnline,
          timestamp: new Date(),
        });
      }
      
      console.log(`User ${userId} status broadcast: ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      console.error(`Error broadcasting user status for ${userId}:`, error);
    }
  }
  
  /**
   * Send a notification to a specific user
   */
  public sendToUser(userId: number, eventName: string, data: any): void {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || socketIds.size === 0) return;
    
    // Send to all user's sockets
    for (const socketId of socketIds) {
      this.io.to(socketId).emit(eventName, data);
    }
  }
  
  /**
   * Check if a user is currently online
   */
  public isUserOnline(userId: number): boolean {
    const sockets = this.userSockets.get(userId);
    return !!sockets && sockets.size > 0;
  }
  
  /**
   * Get status of all users in a room
   */
  public async getRoomUserStatuses(roomId: number): Promise<{ userId: number, isOnline: boolean }[]> {
    try {
      // Get all members of the room
      const members = await chatService.getRoomMembersWithUserInfo(roomId);
      
      // Check online status for each member
      return members.map(member => ({
        userId: member.userId,
        isOnline: this.isUserOnline(member.userId)
      }));
    } catch (error) {
      console.error(`Error getting user statuses for room ${roomId}:`, error);
      return [];
    }
  }
}

// The instance will be created when routes.ts initializes the server