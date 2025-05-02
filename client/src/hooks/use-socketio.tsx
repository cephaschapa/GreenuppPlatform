import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SocketIOContextType {
  socket: Socket | null;
  status: SocketStatus;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const SocketIOContext = createContext<SocketIOContextType | null>(null);

export function SocketIOProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds
  
  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttempts.current;
    // Exponential backoff with a maximum of 30 seconds
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000);
  }, []);
  
  // Clean up any existing timers
  const cleanupTimers = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);
  
  // Connect to the Socket.IO server
  const connect = useCallback(() => {
    if (!user || socket) return;
    
    try {
      cleanupTimers();
      setStatus('connecting');
      
      // Create new Socket.IO connection
      const newSocket = io('', {
        path: '/socket.io',
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });
      
      // Set up event handlers
      newSocket.on('connect', () => {
        console.log('Socket.IO connected');
        setStatus('connected');
        reconnectAttempts.current = 0;
        
        // Authenticate with user ID
        newSocket.emit('auth', { userId: user.id });
      });
      
      newSocket.on('auth_success', (data) => {
        console.log('Socket.IO authenticated:', data);
      });
      
      newSocket.on('error', (error) => {
        console.error('Socket.IO error:', error);
        setStatus('error');
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the chat server',
          variant: 'destructive',
        });
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connect error:', error);
        setStatus('error');
      });
      
      newSocket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setStatus('disconnected');
        
        // Handle reconnect if needed
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          // The disconnection was initiated by the server or the client, so don't reconnect
          return;
        }
        
        // Manual reconnect with backoff if Socket.IO's auto-reconnect fails
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = getReconnectDelay();
          console.log(`Will attempt to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimer.current = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts.current})`);
            newSocket.connect();
          }, delay);
        } else {
          console.log('Max reconnect attempts reached, giving up');
          toast({
            title: 'Connection Lost',
            description: 'Could not reconnect to the server after multiple attempts',
            variant: 'destructive',
          });
        }
      });
      
      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing Socket.IO:', error);
      setStatus('error');
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize chat connection',
        variant: 'destructive',
      });
    }
  }, [user, socket, cleanupTimers, getReconnectDelay, toast]);
  
  // Disconnect from the Socket.IO server
  const disconnect = useCallback(() => {
    if (!socket) return;
    
    cleanupTimers();
    socket.disconnect();
    setSocket(null);
    setStatus('disconnected');
    console.log('Socket.IO disconnected by user action');
  }, [socket, cleanupTimers]);
  
  // Connect when user is authenticated
  useEffect(() => {
    if (user && !socket && status !== 'connecting') {
      connect();
    } else if (!user && socket) {
      disconnect();
    }
    
    // Clean up on unmount
    return () => {
      cleanupTimers();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, socket, status, connect, disconnect, cleanupTimers]);
  
  return (
    <SocketIOContext.Provider
      value={{
        socket,
        status,
        connect,
        disconnect,
        isConnected: status === 'connected',
      }}
    >
      {children}
    </SocketIOContext.Provider>
  );
}

export function useSocketIO() {
  const context = useContext(SocketIOContext);
  if (!context) {
    throw new Error('useSocketIO must be used within a SocketIOProvider');
  }
  return context;
}