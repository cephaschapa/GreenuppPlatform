import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

// Define types
export type ChatRoom = {
  id: number;
  name: string;
  type: 'direct' | 'group';
  createdById: number;
  lastMessageAt: string;
  unreadCount?: number;
  members?: ChatRoomMember[];
};

export type ChatRoomMember = {
  id: number;
  userId: number;
  roomId: number;
  joinedAt: string;
  lastReadAt: string;
  isAdmin: boolean;
  isMuted: boolean;
  nickname?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
};

export type ChatMessage = {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  sentAt: string;
  media?: any;
  replyToId?: number;
  isEdited: boolean;
  isDeleted: boolean;
  senderUsername?: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderProfileImage?: string;
};

export type TypingUser = {
  userId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  timestamp: Date;
};

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

interface ChatContextType {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: ChatMessage[];
  typingUsers: Map<number, TypingUser>;
  totalUnreadCount: number;
  wsStatus: WebSocketStatus;
  
  // Actions
  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: number, before?: Date) => Promise<void>;
  setActiveRoom: (roomId: number) => Promise<void>;
  sendMessage: (content: string, media?: any, replyToId?: number) => Promise<void>;
  markAsRead: (roomId: number) => Promise<void>;
  createRoom: (name: string, memberIds: number[]) => Promise<ChatRoom | null>;
  createDirectChat: (userId: number) => Promise<ChatRoom | null>;
  setTyping: (isTyping: boolean) => void;
  leaveRoom: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('closed');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingUser>>(new Map());
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setWsStatus('closed');
      }
      return;
    }

    // Connect to WebSocket server
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const newSocket = new WebSocket(wsUrl);
      setWsStatus('connecting');
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setWsStatus('open');
        
        // Send authentication message
        newSocket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      };
      
      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setWsStatus('closed');
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (user) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('error');
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      setSocket(newSocket);
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user]);
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    if (!data.type) return;
    
    switch (data.type) {
      case 'auth_success':
        console.log('WebSocket authentication successful');
        // Fetch initial data
        fetchRooms();
        fetchTotalUnreadCount();
        break;
        
      case 'new_message':
        handleNewMessage(data.data);
        break;
        
      case 'messages_read':
        handleMessagesRead(data.data);
        break;
        
      case 'typing_indicator':
        handleTypingIndicator(data.data);
        break;
        
      case 'room_joined':
        console.log('Joined room:', data.data.room);
        if (data.data.messages) {
          setMessages(data.data.messages);
        }
        break;
        
      case 'error':
        toast({
          title: 'Chat Error',
          description: data.data.message,
          variant: 'destructive',
        });
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };
  
  // Handle new incoming message
  const handleNewMessage = (message: ChatMessage) => {
    // Add message to messages if it's for the active room
    if (activeRoom && message.roomId === activeRoom.id) {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if this is the active room
      markAsRead(message.roomId);
    }
    
    // Update the unread count and last message for the room
    setRooms(prev => prev.map(room => {
      if (room.id === message.roomId) {
        return {
          ...room,
          lastMessageAt: message.sentAt,
          unreadCount: (room.unreadCount || 0) + (message.senderId !== user?.id ? 1 : 0)
        };
      }
      return room;
    }));
    
    // Update total unread count
    if (message.senderId !== user?.id) {
      fetchTotalUnreadCount();
    }
  };
  
  // Handle messages read event
  const handleMessagesRead = (data: { roomId: number, userId: number }) => {
    if (data.userId === user?.id) return;
    
    // Update message status in the active room
    if (activeRoom && activeRoom.id === data.roomId) {
      setMessages(prev => prev.map(message => {
        if (message.senderId === user?.id && message.status !== 'read') {
          return { ...message, status: 'read' };
        }
        return message;
      }));
    }
  };
  
  // Handle typing indicator
  const handleTypingIndicator = (data: { roomId: number, userId: number, isTyping: boolean, timestamp: string }) => {
    if (data.userId === user?.id) return;
    
    if (activeRoom && activeRoom.id === data.roomId) {
      if (data.isTyping) {
        // Find user info
        const member = activeRoom.members?.find(m => m.userId === data.userId);
        
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, {
            userId: data.userId,
            username: member?.username,
            firstName: member?.firstName,
            lastName: member?.lastName,
            timestamp: new Date(data.timestamp)
          });
          return newMap;
        });
        
        // Clear typing indicator after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            const typingUser = newMap.get(data.userId);
            if (typingUser && typingUser.timestamp.getTime() === new Date(data.timestamp).getTime()) {
              newMap.delete(data.userId);
            }
            return newMap;
          });
        }, 3000);
      } else {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    }
  };
  
  // Fetch all chat rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat rooms',
        variant: 'destructive',
      });
    }
  };
  
  // Fetch total unread message count
  const fetchTotalUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/unread/count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      setTotalUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  // Fetch messages for a specific room
  const fetchMessages = async (roomId: number, before?: Date) => {
    try {
      let url = `/api/chat/rooms/${roomId}/messages`;
      if (before) {
        url += `?before=${before.toISOString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (before) {
        // Prepend older messages
        setMessages(prev => [...data, ...prev]);
      } else {
        // Replace with new messages
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };
  
  // Set active chat room
  const setActiveChatRoom = async (roomId: number) => {
    try {
      // Fetch room details
      const response = await fetch(`/api/chat/rooms/${roomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }
      
      const roomData = await response.json();
      setActiveRoom(roomData);
      
      // Join the room via WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'join_room',
          data: { roomId }
        }));
      }
      
      // Fetch messages
      await fetchMessages(roomId);
      
      // Mark messages as read
      await markAsRead(roomId);
      
      // Clear typing indicators
      setTypingUsers(new Map());
    } catch (error) {
      console.error('Error setting active room:', error);
      toast({
        title: 'Error',
        description: 'Failed to open chat room',
        variant: 'destructive',
      });
    }
  };
  
  // Send a message
  const sendMessage = async (content: string, media?: any, replyToId?: number) => {
    if (!activeRoom) return;
    
    try {
      // Try to send via WebSocket for real-time delivery
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'send_message',
          data: {
            roomId: activeRoom.id,
            content,
            media,
            replyToId
          }
        }));
      } else {
        // Fallback to REST API
        const response = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, media, replyToId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const message = await response.json();
        handleNewMessage(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };
  
  // Mark messages as read
  const markAsRead = async (roomId: number) => {
    try {
      // Send via WebSocket for real-time updates
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'mark_read',
          data: { roomId }
        }));
      }
      
      // Also send via REST API for persistence
      const response = await fetch(`/api/chat/rooms/${roomId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
      
      // Update unread count in rooms list
      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return { ...room, unreadCount: 0 };
        }
        return room;
      }));
      
      // Update total unread count
      fetchTotalUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Create a new chat room
  const createRoom = async (name: string, memberIds: number[]): Promise<ChatRoom | null> => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type: 'group', memberIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }
      
      const room = await response.json();
      
      // Update rooms list
      await fetchRooms();
      
      return room;
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Create or get direct chat with another user
  const createDirectChat = async (userId: number): Promise<ChatRoom | null> => {
    try {
      const response = await fetch('/api/chat/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create direct chat');
      }
      
      const room = await response.json();
      
      // Update rooms list
      await fetchRooms();
      
      return room;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create direct chat',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Send typing indicator
  const setTyping = (isTyping: boolean) => {
    if (!activeRoom || !socket || socket.readyState !== WebSocket.OPEN) return;
    
    socket.send(JSON.stringify({
      type: 'typing',
      data: {
        roomId: activeRoom.id,
        isTyping
      }
    }));
  };
  
  // Leave current room
  const leaveRoom = () => {
    if (!activeRoom || !socket || socket.readyState !== WebSocket.OPEN) return;
    
    socket.send(JSON.stringify({
      type: 'leave_room',
      data: {
        roomId: activeRoom.id
      }
    }));
    
    setActiveRoom(null);
    setMessages([]);
    setTypingUsers(new Map());
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        activeRoom,
        messages,
        typingUsers,
        totalUnreadCount,
        wsStatus,
        fetchRooms,
        fetchMessages,
        setActiveRoom: setActiveChatRoom,
        sendMessage,
        markAsRead,
        createRoom,
        createDirectChat,
        setTyping,
        leaveRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}