import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { logger } from '../utils/logger';
import { redisChatService } from './redis-chat-service';

export class RedisChatWebSocketService {
  private wss: WebSocketServer;
  private clientCleanupInterval: NodeJS.Timeout | null = null;
  
  constructor(httpServer: HTTPServer) {
    // Initialize WebSocket server with specific path to avoid conflicts with other WebSocket servers
    this.wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/ws/chat', // Use a specific path for chat WebSockets
      clientTracking: true
    });
    
    this.setupEventHandlers();
    this.setupClientCleanup();
    
    logger.info('Redis WebSocket Chat Service initialized');
  }
  
  private setupEventHandlers() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      try {
        logger.info('WebSocket client connected');
        
        // Extract session info from the request
        const session = (req as any).session;
        const user = (req as any).user;
        
        if (!session || !user) {
          logger.warn('Unauthenticated WebSocket connection attempt - closing');
          ws.close(1008, 'Authentication required');
          return;
        }
        
        logger.info(`WebSocket authenticated for user ${user.id}`);
        
        // Register this client with the chat service
        const cleanup = redisChatService.registerClient(user.id, ws);
        logger.info(`Chat client registered for user ${user.id}`);
        
        // Set up WebSocket event handling
        ws.on('message', async (message: string) => {
          try {
            const data = JSON.parse(message);
            await this.handleClientMessage(user.id, data, ws);
          } catch (error) {
            logger.error('Error processing WebSocket message:', error);
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Invalid message format'
            }));
          }
        });
        
        // Handle WebSocket close
        ws.on('close', () => {
          cleanup();
          logger.info(`WebSocket connection closed for user ${user.id}`);
        });
        
        // Handle WebSocket errors
        ws.on('error', (error) => {
          logger.error(`WebSocket error for user ${user.id}:`, error);
          cleanup();
        });
        
        // Send initial connection success message
        ws.send(JSON.stringify({ 
          type: 'connected',
          data: { userId: user.id }
        }));
        
      } catch (error) {
        logger.error('Error handling WebSocket connection:', error);
        ws.close(1011, 'Internal server error');
      }
    });
    
    // Handle server-level errors
    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });
  }
  
  // Handle messages from clients
  private async handleClientMessage(userId: number, message: any, ws: WebSocket) {
    if (!message || !message.type) {
      return;
    }
    
    try {
      switch (message.type) {
        case 'send_message':
          // Send a message to a chat room
          if (!message.roomId || !message.content) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Missing roomId or content'
            }));
            return;
          }
          
          const sentMessage = await redisChatService.sendMessage(
            userId,
            message.roomId,
            message.content,
            message.replyToId
          );
          
          ws.send(JSON.stringify({
            type: 'message_sent',
            data: sentMessage
          }));
          break;
          
        case 'typing':
          // Set typing indicator
          if (!message.roomId || message.isTyping === undefined) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Missing roomId or isTyping parameter'
            }));
            return;
          }
          
          await redisChatService.setTyping(
            userId,
            message.roomId,
            message.isTyping
          );
          break;
          
        case 'mark_read':
          // Mark messages as read
          if (!message.roomId) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Missing roomId parameter'
            }));
            return;
          }
          
          await redisChatService.markMessagesAsRead(
            userId,
            message.roomId
          );
          break;
          
        case 'ping':
          // Respond to ping with pong to keep connection alive
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
          
        default:
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: `Unknown message type: ${message.type}`
          }));
      }
    } catch (error) {
      logger.error(`Error handling WebSocket message of type ${message.type} from user ${userId}:`, error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }
  
  // Set up periodic cleanup of stale connections
  private setupClientCleanup() {
    this.clientCleanupInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        // Send a ping to check if the connection is still alive
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 30000); // Run every 30 seconds
  }
  
  // Shutdown the WebSocket server
  shutdown() {
    if (this.clientCleanupInterval) {
      clearInterval(this.clientCleanupInterval);
    }
    
    this.wss.close((err) => {
      if (err) {
        logger.error('Error closing WebSocket server:', err);
      } else {
        logger.info('WebSocket server closed successfully');
      }
    });
  }
}