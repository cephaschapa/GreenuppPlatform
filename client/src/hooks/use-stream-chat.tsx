import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StreamChat, Channel, ChannelFilters, ChannelOptions, ChannelSort, DefaultGenerics, ConnectAPIResponse } from 'stream-chat';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StreamChatContextType {
  client: StreamChat | null;
  isConnecting: boolean;
  isInitialized: boolean;
  userChannels: Channel[];
  createDirectChannel: (userId: number, username: string) => Promise<Channel | null>;
  createGroupChannel: (name: string, memberIds: number[]) => Promise<Channel | null>;
  error: Error | null;
}

const StreamChatContext = createContext<StreamChatContextType | null>(null);

// Add placeholder values for types that might not be exported
type StreamChatProviderProps = {
  children: ReactNode;
  apiKey: string;
};

export function StreamChatProvider({ children, apiKey }: StreamChatProviderProps) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userChannels, setUserChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Initialize Stream Chat
  useEffect(() => {
    // Check if we already have an authenticated user from the auth hook
    const auth = localStorage.getItem('auth_session');
    if (!auth) {
      setError(new Error('You must be logged in to use chat'));
      return;
    }

    // Create a new client instance
    const chatClient = StreamChat.getInstance(apiKey);
    setClient(chatClient);

    // Initialize connection
    const initChat = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Include credentials to ensure the cookie is sent
        const response = await apiRequest('POST', '/api/stream-chat/init', undefined, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // If we get an unauthorized response, try to refresh the auth session
          if (response.status === 401) {
            // Show a more user-friendly error message
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.token || !data.user) {
          throw new Error('Failed to initialize chat: Invalid response from server');
        }

        // Connect user to Stream Chat
        await chatClient.connectUser(
          {
            id: data.user.id,
            name: data.user.name,
            image: data.user.image || '',
          },
          data.token
        );

        // Fetch user channels
        const channelsResponse = await apiRequest('GET', '/api/stream-chat/channels');
        const channelsData = await channelsResponse.json();

        if (channelsData.channels && Array.isArray(channelsData.channels)) {
          const channels = channelsData.channels.map((channelData: any) => {
            return chatClient.channel(channelData.type, channelData.id);
          });
          setUserChannels(channels);
        }

        setIsInitialized(true);
        console.log('Stream Chat initialized successfully');
      } catch (err) {
        console.error('Error initializing Stream Chat:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize chat'));
        toast({
          title: 'Chat Error',
          description: 'Failed to initialize chat. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsConnecting(false);
      }
    };

    // Only initialize if we have a client
    if (chatClient) {
      initChat();
    }

    // Cleanup
    return () => {
      if (chatClient) {
        chatClient.disconnectUser().then(() => {
          console.log('Stream Chat disconnected');
        });
      }
    };
  }, [apiKey, toast]);

  // Create a direct channel with another user
  const createDirectChannel = async (userId: number, username: string): Promise<Channel | null> => {
    if (!client || !isInitialized) {
      toast({
        title: 'Chat Error',
        description: 'Chat not initialized. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Create channel through our API
      const response = await apiRequest('POST', '/api/stream-chat/direct', { userId });
      const data = await response.json();

      if (!data.channel) {
        throw new Error('Failed to create direct channel');
      }

      // Get the channel from Stream Chat
      const channel = client.channel(data.channel.type, data.channel.id);
      
      // Watch the channel for real-time updates
      await channel.watch();
      
      // Add to user channels
      setUserChannels((prevChannels) => [...prevChannels, channel]);
      
      return channel;
    } catch (err) {
      console.error('Error creating direct channel:', err);
      toast({
        title: 'Chat Error',
        description: 'Failed to create chat. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create a group channel
  const createGroupChannel = async (name: string, memberIds: number[]): Promise<Channel | null> => {
    if (!client || !isInitialized) {
      toast({
        title: 'Chat Error',
        description: 'Chat not initialized. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Create channel through our API
      const response = await apiRequest('POST', '/api/stream-chat/group', { name, members: memberIds });
      const data = await response.json();

      if (!data.channel) {
        throw new Error('Failed to create group channel');
      }

      // Get the channel from Stream Chat
      const channel = client.channel(data.channel.type, data.channel.id);
      
      // Watch the channel for real-time updates
      await channel.watch();
      
      // Add to user channels
      setUserChannels((prevChannels) => [...prevChannels, channel]);
      
      return channel;
    } catch (err) {
      console.error('Error creating group channel:', err);
      toast({
        title: 'Chat Error',
        description: 'Failed to create group chat. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return (
    <StreamChatContext.Provider
      value={{
        client,
        isConnecting,
        isInitialized,
        userChannels,
        createDirectChannel,
        createGroupChannel,
        error,
      }}
    >
      {children}
    </StreamChatContext.Provider>
  );
}

export function useStreamChat() {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  return context;
}