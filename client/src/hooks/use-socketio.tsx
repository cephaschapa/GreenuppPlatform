import { createContext, ReactNode, useContext } from 'react';
import type { Socket } from 'socket.io-client';
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

/**
 * Provides a mock Socket.IO context that doesn't actually connect to any Socket.IO servers.
 * This replaces the previous implementation that used actual Socket.IO, which has been
 * disabled on the server as requested.
 */
export function SocketIOProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Define no-op functions
  const connect = () => {
    console.log('Socket.IO connect attempted, but Socket.IO is disabled');
  };
  
  const disconnect = () => {
    console.log('Socket.IO disconnect called, but Socket.IO is disabled');
  };
  
  // Provide dummy values for compatibility
  const contextValue: SocketIOContextType = {
    socket: null,
    status: 'disconnected',
    connect,
    disconnect,
    isConnected: false,
  };
  
  return (
    <SocketIOContext.Provider value={contextValue}>
      {children}
    </SocketIOContext.Provider>
  );
}

/**
 * Hook to access the Socket.IO context
 * Now just provides a dummy implementation with no actual Socket.IO functionality
 */
export function useSocketIO() {
  const context = useContext(SocketIOContext);
  if (!context) {
    throw new Error('useSocketIO must be used within a SocketIOProvider');
  }
  return context;
}