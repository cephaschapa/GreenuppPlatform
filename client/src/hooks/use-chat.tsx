import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

export type PotentialChatUser = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  email?: string;
  relationship: 'following' | 'suggested';
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
  fetchPotentialChatUsers: () => Promise<PotentialChatUser[]>;
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
    // Don't attempt to connect if not authenticated
    if (!user || !user.id) {
      if (socket) {
        socket.close();
        setSocket(null);
        setWsStatus('closed');
      }
      return;
    }

    // Set up polling with adaptive frequency based on WebSocket status
    let intervalId: NodeJS.Timeout | null = null;
    
    // Connect to WebSocket server
    const connectWebSocket = () => {
      try {
        console.log('Attempting to connect to WebSocket...');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
        console.log('WebSocket URL:', wsUrl);
        
        // Create a new WebSocket connection
        const newSocket = new WebSocket(wsUrl);
        setWsStatus('connecting');
        
        // Set up event handlers
        newSocket.onopen = () => {
          console.log('WebSocket connection established successfully');
          setWsStatus('open');
          
          // Send authentication message
          const authMessage = JSON.stringify({
            type: 'auth',
            userId: user.id
          });
          console.log('Sending WebSocket auth message:', authMessage);
          newSocket.send(authMessage);
        };
        
        newSocket.onclose = () => {
          console.log('WebSocket connection closed');
          setWsStatus('closed');
          
          // Try to reconnect after a delay, but only if user is still authenticated
          setTimeout(() => {
            if (user && user.id) {
              connectWebSocket();
            }
          }, 3000);
        };
        
        newSocket.onerror = (err) => {
          console.error('WebSocket error:', err);
          setWsStatus('error');
        };
        
        newSocket.onmessage = (evt) => {
          try {
            console.log('WebSocket message received:', evt.data);
            const data = JSON.parse(evt.data);
            handleWebSocketMessage(data);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        // Store the socket in state
        setSocket(newSocket);
        
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setWsStatus('error');
      }
    };
    
    connectWebSocket();
    
    // Set up adaptive polling based on WebSocket status
    // Use a longer interval when WebSocket is connected, shorter when it's not
    const pollingInterval = wsStatus === 'open' ? 10000 : 3000; // 10s when connected, 3s when not
    
    console.log(`Setting up chat polling with interval: ${pollingInterval}ms (WebSocket status: ${wsStatus})`);
    
    // Clear any existing intervals before setting a new one
    if (intervalId) clearInterval(intervalId);
    
    // Start new interval for polling
    intervalId = setInterval(() => {
      console.log(`Polling chat data (WebSocket status: ${wsStatus})`);
      
      // Force fetch only when WebSocket is in error state or closed
      const forceFetch = wsStatus === 'error' || wsStatus === 'closed';
      fetchRooms(forceFetch);
    }, pollingInterval);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (socket) {
        socket.close();
      }
      if (intervalId) {
        console.log('Clearing chat polling interval');
        clearInterval(intervalId);
      }
    };
  }, [user, wsStatus]); // Add wsStatus as dependency
  
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
  
  // Track last room fetch timestamp to avoid frequent polling
  const lastRoomFetchRef = useRef<number>(0);
  
  // Fetch all chat rooms with caching
  const fetchRooms = async (forceFetch: boolean = false) => {
    // Don't try to fetch rooms if user is not authenticated
    if (!user || !user.id) {
      return;
    }
    
    // Only fetch every 5 seconds unless forced to reduce API calls
    const now = Date.now();
    if (!forceFetch && now - lastRoomFetchRef.current < 5000) {
      console.log('Skipping room fetch due to recent fetch');
      return;
    }
    
    try {
      lastRoomFetchRef.current = now;
      console.log('Fetching chat rooms from server');
      
      const response = await fetch('/api/chat/rooms');
      
      // Handle unauthenticated response quietly
      if (response.status === 401) {
        console.log('Not authenticated for chat rooms');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      
      // Only update state if response has changed (uses HTTP 304 for caching)
      if (response.status !== 304) {
        const data = await response.json();
        setRooms(data);
      }
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
    // Don't try to fetch if user is not authenticated
    if (!user || !user.id) {
      return;
    }
    
    try {
      const response = await fetch('/api/chat/unread/count');
      
      // Handle unauthenticated response quietly
      if (response.status === 401) {
        console.log('Not authenticated for unread count');
        return;
      }
      
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
      // First try WebSocket method
      let messageSent = false;
      
      // Try to send via WebSocket for real-time delivery
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          console.log('Sending message via WebSocket', {
            roomId: activeRoom.id,
            content,
            replyToId
          });
          
          socket.send(JSON.stringify({
            type: 'send_message',
            roomId: activeRoom.id,
            content,
            replyToId
          }));
          
          // We'll assume success for now - WebSocket errors are handled elsewhere
          messageSent = true;
        } catch (wsError) {
          console.error('WebSocket send error, falling back to API:', wsError);
          messageSent = false;
        }
      }
      
      // Fallback to REST API if WebSocket didn't work
      if (!messageSent) {
        console.log('Sending message via REST API', {
          roomId: activeRoom.id,
          content
        });
        
        const response = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, media, replyToId })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
        }
        
        const message = await response.json();
        console.log('Message sent successfully via API', message);
        handleNewMessage(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  
  // Fetch potential chat users (users the current user follows)
  const fetchPotentialChatUsers = async (): Promise<PotentialChatUser[]> => {
    try {
      const response = await fetch('/api/chat/potential-users');
      
      if (response.status === 401) {
        console.log('Not authenticated for fetching potential chat users');
        return [];
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch potential chat users');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching potential chat users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load potential chat users',
        variant: 'destructive',
      });
      return [];
    }
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
        fetchPotentialChatUsers,
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