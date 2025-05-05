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

// Import Stream Chat CSS
import 'stream-chat-css';

interface StreamChatComponentProps {
  activeChannelId?: string;
  onChannelSelect?: (channel: Channel) => void;
}

export const StreamChatComponent = ({
  activeChannelId,
  onChannelSelect,
}: StreamChatComponentProps) => {
  const { client, isConnecting, userChannels, error } = useStreamChat();
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>(undefined);

  // Set the active channel when the activeChannelId prop changes
  useEffect(() => {
    if (client && activeChannelId) {
      const channel = userChannels.find(c => c.id === activeChannelId);
      setActiveChannel(channel);
    }
  }, [client, activeChannelId, userChannels]);

  // If not connected, show loading
  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-red-500">
        <p className="text-lg font-semibold">Error connecting to chat</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  // If not initialized or no client, show message
  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Chat not available</p>
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
                return (
                  <div
                    className={`p-3 cursor-pointer hover:bg-accent ${
                      activeChannel?.id === channel.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleChannelSelect(channel)}
                  >
                    <div className="font-semibold">{channel.data?.name || 'Direct Message'}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {channel.state.messages.length > 0
                        ? channel.state.messages[channel.state.messages.length - 1].text
                        : 'No messages yet'}
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