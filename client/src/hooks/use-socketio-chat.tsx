import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { useSocketIO } from './use-socketio';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

export type ChatRoom = {
  id: number;
  name: string;
  type: 'direct' | 'group';
  createdById: number;
  description?: string;
  imageUrl?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessage = {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  sentAt: Date;
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

export type UserStatus = {
  userId: number;
  isOnline: boolean;
  timestamp: Date;
};

interface SocketIOChatContextType {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: ChatMessage[];
  typingUsers: Map<number, TypingUser>;
  userStatuses: Map<number, UserStatus>;
  totalUnreadCount: number;
  
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

const SocketIOChatContext = createContext<SocketIOChatContextType | null>(null);

export function SocketIOChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocketIO();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingUser>>(new Map());
  const [userStatuses, setUserStatuses] = useState<Map<number, UserStatus>>(new Map());
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  
  // Fetch chat rooms from the API
  const fetchRooms = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await apiRequest('GET', '/api/chat/rooms');
      const data = await response.json();
      setRooms(data);
      
      // Calculate total unread count
      const response2 = await apiRequest('GET', '/api/chat/unread');
      const unreadData = await response2.json();
      
      let totalCount = 0;
      for (const roomId in unreadData) {
        totalCount += unreadData[roomId];
      }
      setTotalUnreadCount(totalCount);
      
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat rooms',
        variant: 'destructive',
      });
    }
  }, [user, toast]);
  
  // Fetch messages for a specific room
  const fetchMessages = useCallback(async (roomId: number, before?: Date) => {
    if (!user) return;
    
    try {
      let url = `/api/chat/rooms/${roomId}/messages`;
      if (before) {
        const timestamp = before.toISOString();
        url += `?before=${encodeURIComponent(timestamp)}`;
      }
      
      const response = await apiRequest('GET', url);
      const data = await response.json();
      
      // If we're loading more messages, append them to the existing list
      // Otherwise, replace the messages array
      if (before && messages.length > 0) {
        setMessages(prevMessages => [...prevMessages, ...data]);
      } else {
        setMessages(data);
      }
      
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    }
  }, [user, messages.length, toast]);
  
  // Mark messages in a room as read
  const markAsRead = useCallback(async (roomId: number) => {
    if (!user || !socket || !isConnected) return;
    
    try {
      // Mark as read via Socket.IO
      socket.emit('mark_read', { roomId });
      
      // Update total unread count
      fetchRooms();
      
    } catch (error) {
      console.error(`Error marking messages as read in room ${roomId}:`, error);
      
      // Fallback to REST API
      try {
        await apiRequest('POST', `/api/chat/rooms/${roomId}/read`);
        fetchRooms();
      } catch (apiError) {
        console.error('Error marking messages as read via API fallback:', apiError);
      }
    }
  }, [user, socket, isConnected, fetchRooms]);
  
  // Update typing status
  const setTyping = useCallback((isTyping: boolean) => {
    if (!user || !activeRoom || !socket || !isConnected) return;
    
    socket.emit('typing_status', {
      roomId: activeRoom.id,
      isTyping
    });
  }, [user, activeRoom, socket, isConnected]);
  
  // Set the active chat room
  const setActiveChatRoom = useCallback(async (roomId: number) => {
    if (!user) return;
    
    try {
      // Find the room in our list
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        // If room is not in our list, fetch it from the API
        const response = await apiRequest('GET', `/api/chat/rooms/${roomId}`);
        const data = await response.json();
        setActiveRoom(data);
      } else {
        setActiveRoom(room);
      }
      
      // Fetch messages for the room
      await fetchMessages(roomId);
      
      // Join the room's Socket.IO channel
      if (socket && isConnected) {
        socket.emit('join_room', { roomId });
      }
      
      // Mark messages as read
      await markAsRead(roomId);
      
      // Clear typing users when changing rooms
      setTypingUsers(new Map());
      
    } catch (error) {
      console.error(`Error setting active room ${roomId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to open chat room',
        variant: 'destructive',
      });
    }
  }, [user, rooms, socket, isConnected, fetchMessages, markAsRead, toast]);
  
  // Send a message to the active room
  const sendMessage = useCallback(async (content: string, media?: any, replyToId?: number) => {
    if (!user || !activeRoom || !socket || !isConnected) {
      console.error('Cannot send message: missing user, active room, or socket connection');
      return;
    }
    
    try {
      // Send message via Socket.IO
      socket.emit('chat_message', {
        roomId: activeRoom.id,
        content,
        media,
        replyToId
      });
      
      // Clear typing indicator
      setTyping(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      
      // Fallback to REST API if Socket.IO fails
      try {
        const response = await apiRequest('POST', `/api/chat/rooms/${activeRoom.id}/messages`, {
          content,
          media,
          replyToId
        });
        
        if (response.ok) {
          // Refresh messages to show the sent message
          fetchMessages(activeRoom.id);
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.error('Error sending message via API fallback:', apiError);
        toast({
          title: 'Error',
          description: 'Failed to send message via fallback method',
          variant: 'destructive',
        });
      }
    }
  }, [user, activeRoom, socket, isConnected, setTyping, fetchMessages, toast]);
  
  // Create a new chat room
  const createRoom = useCallback(async (name: string, memberIds: number[]): Promise<ChatRoom | null> => {
    if (!user) return null;
    
    try {
      const response = await apiRequest('POST', '/api/chat/rooms', {
        name,
        type: 'group',
        memberIds
      });
      
      const newRoom = await response.json();
      
      // Refresh the rooms list
      fetchRooms();
      
      return newRoom;
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, fetchRooms, toast]);
  
  // Create a direct chat with another user
  const createDirectChat = useCallback(async (userId: number): Promise<ChatRoom | null> => {
    if (!user) return null;
    
    try {
      const response = await apiRequest('POST', '/api/chat/direct', {
        userId
      });
      
      const newRoom = await response.json();
      
      // Refresh the rooms list
      fetchRooms();
      
      return newRoom;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create direct chat',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, fetchRooms, toast]);
  
  // Leave the current active chat room
  const leaveRoom = useCallback(() => {
    if (!activeRoom || !socket || !isConnected) return;
    
    // Leave the room channel
    socket.emit('leave_room', { roomId: activeRoom.id });
    
    // Clear the active room and messages
    setActiveRoom(null);
    setMessages([]);
    setTypingUsers(new Map());
  }, [activeRoom, socket, isConnected]);
  
  // Fetch potential chat users (people to chat with)
  const fetchPotentialChatUsers = useCallback(async (): Promise<PotentialChatUser[]> => {
    if (!user) return [];
    
    try {
      const response = await apiRequest('GET', '/api/chat/users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching potential chat users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch potential chat users',
        variant: 'destructive',
      });
      return [];
    }
  }, [user, toast]);
  
  // Socket.IO event handling
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Handle new messages
    const handleNewMessage = (message: ChatMessage) => {
      if (activeRoom && message.roomId === activeRoom.id) {
        // Add message to the current room
        setMessages(prevMessages => [message, ...prevMessages]);
        
        // Mark messages as read if we're in the room
        markAsRead(message.roomId);
      }
      
      // Refresh room list to update last message time
      fetchRooms();
    };
    
    // Handle typing status updates
    const handleTypingStatus = (data: TypingUser & { roomId: number; isTyping: boolean }) => {
      if (!activeRoom || data.roomId !== activeRoom.id) return;
      
      setTypingUsers(prevTypingUsers => {
        const newTypingUsers = new Map(prevTypingUsers);
        
        if (data.isTyping) {
          // Add or update typing user
          newTypingUsers.set(data.userId, {
            userId: data.userId,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            timestamp: new Date()
          });
        } else {
          // Remove typing user
          newTypingUsers.delete(data.userId);
        }
        
        return newTypingUsers;
      });
    };
    
    // Handle read status updates
    const handleReadStatus = (data: { roomId: number; userId: number; timestamp: Date }) => {
      // If the current room's messages were read by someone, refresh messages
      if (activeRoom && data.roomId === activeRoom.id) {
        // We could update the message status here for optimization
        // but for simplicity, just refresh messages
        fetchMessages(data.roomId);
      }
    };
    
    // Handle user status updates (online/offline)
    const handleUserStatus = (data: { roomId: number; userId: number; isOnline: boolean; timestamp: Date }) => {
      setUserStatuses(prevStatuses => {
        const newStatuses = new Map(prevStatuses);
        
        newStatuses.set(data.userId, {
          userId: data.userId,
          isOnline: data.isOnline,
          timestamp: new Date(data.timestamp)
        });
        
        return newStatuses;
      });
    };
    
    // Set up event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('typing_status', handleTypingStatus);
    socket.on('read_status', handleReadStatus);
    socket.on('user_status', handleUserStatus);
    
    // Clean up event listeners on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_status', handleTypingStatus);
      socket.off('read_status', handleReadStatus);
      socket.off('user_status', handleUserStatus);
    };
  }, [socket, isConnected, activeRoom, fetchRooms, fetchMessages, markAsRead]);
  
  // Automatically join active room channel on reconnection
  useEffect(() => {
    if (socket && isConnected && activeRoom) {
      socket.emit('join_room', { roomId: activeRoom.id });
    }
  }, [socket, isConnected, activeRoom]);
  
  // Clear typing users when socket is disconnected
  useEffect(() => {
    if (!isConnected) {
      setTypingUsers(new Map());
    }
  }, [isConnected]);
  
  // Fetch chat rooms when user or connection status changes
  useEffect(() => {
    if (user && isConnected) {
      fetchRooms();
    }
  }, [user, isConnected, fetchRooms]);
  
  // Remove typing users after a timeout
  useEffect(() => {
    const typingTimeout = 10000; // 10 seconds
    
    const interval = setInterval(() => {
      const now = new Date();
      
      setTypingUsers(prevTypingUsers => {
        if (prevTypingUsers.size === 0) return prevTypingUsers;
        
        const newTypingUsers = new Map(prevTypingUsers);
        let hasChanged = false;
        
        newTypingUsers.forEach((user, userId) => {
          // If typing indicator is older than the timeout, remove it
          if (now.getTime() - new Date(user.timestamp).getTime() > typingTimeout) {
            newTypingUsers.delete(userId);
            hasChanged = true;
          }
        });
        
        return hasChanged ? newTypingUsers : prevTypingUsers;
      });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <SocketIOChatContext.Provider
      value={{
        rooms,
        activeRoom,
        messages,
        typingUsers,
        userStatuses,
        totalUnreadCount,
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
    </SocketIOChatContext.Provider>
  );
}

export function useSocketIOChat() {
  const context = useContext(SocketIOChatContext);
  if (!context) {
    throw new Error('useSocketIOChat must be used within a SocketIOChatProvider');
  }
  return context;
}