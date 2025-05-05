import React, { createContext, useContext, ReactNode } from 'react';

// Define the same interface for compatibility
type WebSocketContextType = {
  connected: boolean;
  reconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * Provides a mock WebSocket context that doesn't actually connect to any WebSockets.
 * This replaces the previous implementation that used actual WebSockets, which have been
 * disabled on the server as requested.
 */
export function WebSocketProvider({ children }: { children: ReactNode }) {
  // We'll just provide a dummy context value with no actual WebSocket functionality
  const contextValue: WebSocketContextType = {
    connected: false,  // Always report as disconnected since we're not using WebSockets
    reconnect: () => { 
      console.log('WebSocket reconnect attempted, but WebSockets are disabled');
    }
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to access the WebSocket context
 * Now just provides a dummy implementation with no actual WebSocket functionality
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}