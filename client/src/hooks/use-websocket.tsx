import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type WebSocketContextType = {
  connected: boolean;
  reconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create and set up WebSocket connection
  const setupWebSocket = () => {
    // Close existing socket if it exists
    if (socket) {
      socket.close();
    }

    // Determine WebSocket URL based on current protocol and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create new WebSocket connection
    const newSocket = new WebSocket(wsUrl);

    // Set up event handlers
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      
      // Send authentication message once connected
      if (user) {
        newSocket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
      
      // Try to reconnect after delay 
      setTimeout(setupWebSocket, 5000);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log('WebSocket authentication successful');
        } 
        else if (data.type === 'notification') {
          // Handle real-time notification
          const notification = data.data;
          
          // Show a toast notification
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'default',
            action: notification.actionUrl ? (
              <a href={notification.actionUrl} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                View
              </a>
            ) : undefined
          });

          // Refresh notification data using React Query's cache
          const queryClient = window.__TANSTACK_QUERY_CLIENT__;
          if (queryClient) {
            queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
            queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
          }
          
          // Dispatch a custom event that other components can listen for
          const notificationEvent = new CustomEvent('new-notification', { 
            detail: notification 
          });
          window.dispatchEvent(notificationEvent);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    setSocket(newSocket);
  };

  // Set up WebSocket when user changes
  useEffect(() => {
    if (user) {
      setupWebSocket();

      // Clean up on unmount or user change
      return () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }
  }, [user?.id]);

  // Provide connection status and reconnect function
  const contextValue: WebSocketContextType = {
    connected,
    reconnect: setupWebSocket
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}