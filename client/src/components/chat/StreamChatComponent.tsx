import { useEffect, useState } from 'react';
import { Channel, StreamChat } from 'stream-chat';
import {
  Chat,
  Channel as StreamChannel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  ChannelList,
} from 'stream-chat-react';
import { useStreamChat } from '@/hooks/use-stream-chat';
import { Loader2, MessageSquare, AlertTriangle, Users } from 'lucide-react';

// Import Stream Chat CSS
import 'stream-chat-css/dist/css/index.css';
import './stream-chat-custom.css';

interface StreamChatComponentProps {
  activeChannelId?: string;
  onChannelSelect?: (channel: Channel) => void;
}

export const StreamChatComponent = ({
  activeChannelId,
  onChannelSelect,
}: StreamChatComponentProps) => {
  const { client, isConnecting, userChannels, error, isInitialized } = useStreamChat();
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>(undefined);

  // Set the active channel when the activeChannelId prop changes
  useEffect(() => {
    if (client && isInitialized && activeChannelId) {
      try {
        const channel = userChannels.find(c => c.id === activeChannelId);
        setActiveChannel(channel);
      } catch (err) {
        console.error('Error setting active channel:', err);
        setActiveChannel(undefined);
      }
    }
  }, [client, isInitialized, activeChannelId, userChannels]);

  // If not connected, show loading
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-space">Connecting to chat...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl font-semibold font-space text-destructive">Connection Error</p>
        <p className="text-sm mt-2 max-w-md text-destructive/80">{error.message}</p>
        <p className="text-xs mt-4 text-muted-foreground">Try refreshing the page or check your internet connection</p>
      </div>
    );
  }

  // If not initialized or no client, show message
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-space">Chat service not available</p>
        <p className="text-xs mt-2 text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  const handleChannelSelect = (channel: Channel) => {
    setActiveChannel(channel);
    if (onChannelSelect) {
      onChannelSelect(channel);
    }
  };

  const filters = { type: 'messaging', members: { $in: [client.userID || ''] } };
  // Use 'as any' to bypass typing issue with the Stream Chat API
  const sort = { last_message_at: -1 } as any;

  return (
    <div className="h-full flex overflow-hidden">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="flex h-full">
          <div className="w-64 border-r border-border">
            <ChannelList
              filters={filters}
              sort={sort}
              Preview={(props) => {
                const { channel } = props;
                
                // Safe access to channel data
                const handleClick = () => {
                  try {
                    handleChannelSelect(channel);
                  } catch (err) {
                    console.error('Error selecting channel:', err);
                  }
                };
                
                // Safe message access
                let lastMessage = 'No messages yet';
                let lastMessageTime = '';
                try {
                  if (channel.state?.messages && channel.state.messages.length > 0) {
                    const message = channel.state.messages[channel.state.messages.length - 1];
                    lastMessage = message?.text || 'No message content';
                    
                    // Format date nicely
                    if (message?.created_at) {
                      const date = new Date(message.created_at);
                      const now = new Date();
                      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                      
                      if (diffHours < 24) {
                        lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } else if (diffHours < 48) {
                        lastMessageTime = 'Yesterday';
                      } else {
                        lastMessageTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      }
                    }
                  }
                } catch (err) {
                  console.error('Error accessing channel messages:', err);
                  lastMessage = 'Error loading messages';
                }
                
                // Get other member's data for direct channels
                let otherUser = 'User';
                let isOnline = false;
                try {
                  if (channel.data?.name === 'Direct Message' && client) {
                    const members = Object.values(channel.state?.members || {});
                    const otherMember = members.find(m => m.user?.id !== client.userID);
                    if (otherMember?.user) {
                      otherUser = otherMember.user.name || otherMember.user.id;
                      isOnline = otherMember.user.online || false;
                    }
                  }
                } catch (err) {
                  console.error('Error accessing channel members:', err);
                }
                
                const isActive = activeChannel?.id === channel.id;
                
                return (
                  <div
                    className={`greenupp-channel-preview ${isActive ? 'active' : ''}`}
                    onClick={handleClick}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="greenupp-channel-preview-title">
                        <div className="flex items-center">
                          {channel.data?.name === 'Direct Message' ? (
                            <div className="relative">
                              <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-muted-foreground">
                                <Users size={14} />
                              </div>
                              {isOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></div>
                              )}
                            </div>
                          ) : (
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                              <MessageSquare size={14} />
                            </div>
                          )}
                        </div>
                        <span className="ml-2 truncate">{channel.data?.name === 'Direct Message' ? otherUser : channel.data?.name || 'Channel'}</span>
                      </div>
                      {lastMessageTime && (
                        <div className="text-xs text-muted-foreground">
                          {lastMessageTime}
                        </div>
                      )}
                    </div>
                    <div className="greenupp-channel-preview-message pl-9">
                      {lastMessage}
                    </div>
                  </div>
                );
              }}
            />
          </div>
          <div className="flex-1">
            {activeChannel ? (
              <StreamChannel channel={activeChannel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </StreamChannel>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Chat>
    </div>
  );
};

export default StreamChatComponent;