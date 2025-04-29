import { WebSocket } from 'ws';
import { chatService } from './chat-service';
import { InsertChatMessage } from '@shared/schema';

interface WebSocketWithUser extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

interface WebSocketEventPayload {
  type: string;
  data: any;
}

/**
 * Class to handle real-time chat functionality through WebSockets
 */
export class ChatWebSocketService {
  private clients: Map<number, Set<WebSocketWithUser>> = new Map();
  private roomSubscriptions: Map<number, Set<number>> = new Map();

  /**
   * Constructor
   */
  constructor() {
    console.log('Chat WebSocket service initialized');
    
    // Set up a heartbeat interval to check for stale connections
    setInterval(() => this.checkConnections(), 30000);
  }

  /**
   * Register a client to the chat service
   */
  registerClient(userId: number, ws: WebSocketWithUser): void {
    // Mark the WebSocket as authenticated and store userId
    ws.userId = userId;
    ws.isAlive = true;

    // Initialize ping/pong mechanism to detect stale connections
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Add the client to our clients map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)?.add(ws);

    console.log(`Chat client registered for user ${userId}`);

    // Set up message handling
    this.setupMessageHandling(ws);
  }

  /**
   * Set up message event handling for a WebSocket
   */
  private setupMessageHandling(ws: WebSocketWithUser): void {
    ws.on('message', async (message: string) => {
      try {
        if (!ws.userId) {
          return; // Not authenticated
        }

        const event = JSON.parse(message) as WebSocketEventPayload;
        await this.handleWebSocketEvent(ws.userId, event, ws);
      } catch (error) {
        console.error('Error handling chat WebSocket message:', error);
        this.sendErrorToClient(ws, 'Failed to process message');
      }
    });

    ws.on('close', () => {
      this.removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.removeClient(ws);
    });
  }

  /**
   * Handle WebSocket events based on type
   */
  private async handleWebSocketEvent(
    userId: number,
    event: WebSocketEventPayload,
    ws: WebSocketWithUser
  ): Promise<void> {
    if (!event.type) {
      this.sendErrorToClient(ws, 'Event type is required');
      return;
    }

    console.log(`Handling chat event of type ${event.type} from user ${userId}`);

    switch (event.type) {
      case 'join_room':
        await this.handleJoinRoom(userId, event.data?.roomId, ws);
        break;

      case 'leave_room':
        await this.handleLeaveRoom(userId, event.data?.roomId);
        break;

      case 'send_message':
        await this.handleSendMessage(userId, event.data);
        break;

      case 'mark_read':
        await this.handleMarkRead(userId, event.data?.roomId);
        break;

      case 'typing':
        await this.handleTypingIndicator(userId, event.data?.roomId, event.data?.isTyping);
        break;

      default:
        this.sendErrorToClient(ws, `Unknown event type: ${event.type}`);
    }
  }

  /**
   * Handle joining a chat room
   */
  private async handleJoinRoom(userId: number, roomId: number, ws: WebSocketWithUser): Promise<void> {
    if (!roomId) {
      this.sendErrorToClient(ws, 'Room ID is required');
      return;
    }

    try {
      // Verify the user is a member of the room
      const members = await chatService.getRoomMembers(roomId);
      const isMember = members.some(m => m.userId === userId);

      if (!isMember) {
        this.sendErrorToClient(ws, 'You are not a member of this room');
        return;
      }

      // Subscribe the user to this room
      if (!this.roomSubscriptions.has(roomId)) {
        this.roomSubscriptions.set(roomId, new Set());
      }
      this.roomSubscriptions.get(roomId)?.add(userId);

      // Send confirmation and room data
      const room = await chatService.getChatRoom(roomId);
      const messages = await chatService.getMessagesWithSenderInfo(roomId, 50);
      const membersWithInfo = await chatService.getRoomMembersWithUserInfo(roomId);

      this.sendToClient(ws, {
        type: 'room_joined',
        data: {
          room,
          messages,
          members: membersWithInfo
        }
      });

      // Notify other room members that this user has joined
      this.broadcastToRoom(roomId, {
        type: 'user_joined',
        data: {
          roomId,
          userId,
          timestamp: new Date()
        }
      }, userId); // Exclude the user who just joined

      console.log(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      console.error(`Error handling join_room event for user ${userId}, room ${roomId}:`, error);
      this.sendErrorToClient(ws, 'Failed to join room');
    }
  }

  /**
   * Handle leaving a chat room
   */
  private async handleLeaveRoom(userId: number, roomId: number): Promise<void> {
    if (!roomId) {
      return;
    }

    // Unsubscribe user from the room
    this.roomSubscriptions.get(roomId)?.delete(userId);

    // If the room is now empty, clean up
    if (this.roomSubscriptions.get(roomId)?.size === 0) {
      this.roomSubscriptions.delete(roomId);
    }

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      data: {
        roomId,
        userId,
        timestamp: new Date()
      }
    });

    console.log(`User ${userId} left room ${roomId}`);
  }

  /**
   * Handle sending a message to a room
   */
  private async handleSendMessage(userId: number, data: any): Promise<void> {
    if (!data?.roomId || !data?.content) {
      return;
    }

    try {
      const messageData: InsertChatMessage = {
        roomId: data.roomId,
        senderId: userId,
        content: data.content,
        replyToId: data.replyToId || null,
        media: data.media || null
      };

      // Save the message to the database
      const message = await chatService.sendMessage(messageData);

      // Get sender information
      const [senderInfo] = await chatService.getRoomMembersWithUserInfo(data.roomId);

      // Construct the message with sender info
      const messageWithSender = {
        ...message,
        senderUsername: senderInfo?.username,
        senderFirstName: senderInfo?.firstName,
        senderLastName: senderInfo?.lastName,
        senderProfileImage: senderInfo?.profileImage
      };

      // Broadcast to all users in the room
      this.broadcastToRoom(data.roomId, {
        type: 'new_message',
        data: messageWithSender
      });

      console.log(`User ${userId} sent message to room ${data.roomId}`);
    } catch (error) {
      console.error(`Error handling send_message event for user ${userId}:`, error);
      
      // Notify sender of the error
      this.sendToUser(userId, {
        type: 'message_error',
        data: {
          roomId: data.roomId,
          error: 'Failed to send message',
          originalContent: data.content
        }
      });
    }
  }

  /**
   * Handle marking messages as read
   */
  private async handleMarkRead(userId: number, roomId: number): Promise<void> {
    if (!roomId) {
      return;
    }

    try {
      await chatService.markMessagesAsRead(roomId, userId);

      // Notify other users in the room
      this.broadcastToRoom(roomId, {
        type: 'messages_read',
        data: {
          roomId,
          userId,
          timestamp: new Date()
        }
      }, userId); // Exclude the user who marked as read

      console.log(`User ${userId} marked messages as read in room ${roomId}`);
    } catch (error) {
      console.error(`Error marking messages as read for user ${userId} in room ${roomId}:`, error);
    }
  }

  /**
   * Handle typing indicator updates
   */
  private async handleTypingIndicator(userId: number, roomId: number, isTyping: boolean): Promise<void> {
    if (!roomId) {
      return;
    }

    // Broadcast typing status to other users in the room
    this.broadcastToRoom(roomId, {
      type: 'typing_indicator',
      data: {
        roomId,
        userId,
        isTyping,
        timestamp: new Date()
      }
    }, userId); // Exclude the user who is typing
  }

  /**
   * Send a message to a specific WebSocket client
   */
  private sendToClient(ws: WebSocketWithUser, payload: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  /**
   * Send an error message to a client
   */
  private sendErrorToClient(ws: WebSocketWithUser, errorMessage: string): void {
    this.sendToClient(ws, {
      type: 'error',
      data: { message: errorMessage }
    });
  }

  /**
   * Send a message to all connections for a specific user
   */
  private sendToUser(userId: number, payload: any): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    userClients.forEach(client => {
      this.sendToClient(client, payload);
    });
  }

  /**
   * Broadcast a message to all users subscribed to a room
   */
  private broadcastToRoom(roomId: number, payload: any, excludeUserId?: number): void {
    const subscribers = this.roomSubscriptions.get(roomId);
    if (!subscribers) return;

    subscribers.forEach(userId => {
      if (excludeUserId && userId === excludeUserId) {
        return; // Skip excluded user
      }
      this.sendToUser(userId, payload);
    });
  }

  /**
   * Remove a client from tracking
   */
  private removeClient(ws: WebSocketWithUser): void {
    const userId = ws.userId;
    if (!userId) return;

    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }

    console.log(`Chat client removed for user ${userId}`);
  }

  /**
   * Check all connections for stale clients
   */
  private checkConnections(): void {
    this.clients.forEach((clients, userId) => {
      clients.forEach(client => {
        if (client.isAlive === false) {
          // Connection is stale, terminate it
          this.removeClient(client);
          client.terminate();
          return;
        }

        // Reset isAlive flag and ping the client
        client.isAlive = false;
        client.ping();
      });
    });
  }
}

// Create and export a singleton instance
export const chatWebSocketService = new ChatWebSocketService();