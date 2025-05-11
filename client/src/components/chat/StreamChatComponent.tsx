import { useEffect, useState, useRef } from "react";
import { Channel, StreamChat } from "stream-chat";
import {
  Chat,
  Channel as StreamChannel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  ChannelList,
  useChannelStateContext,
  Avatar,
} from "stream-chat-react";
import { useStreamChat } from "@/hooks/use-stream-chat";
import { 
  Loader2, 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  ChevronLeft,
  Menu,
  UserCircle2,
  Send,
  Image as ImageIcon,
  Paperclip,
  Smile,
} from "lucide-react";

// Simple media query hook implementation inline to avoid module import issues
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return matches;
}

// Import Stream Chat CSS
import "stream-chat-css/dist/css/index.css";
import "./stream-chat-custom.css";

// Custom Message Input UI component
const CustomMessageInput = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { channel } = useChannelStateContext();
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const text = inputRef.current?.value.trim();
      
      if (text && channel) {
        try {
          channel.sendMessage({
            text,
          });
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        } catch (err) {
          console.error('Error sending message:', err);
        }
      }
    }
  };
  
  return (
    <div className="custom-message-input p-3 border-t flex items-end gap-2">
      <div className="input-actions flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-accent transition-colors" title="Attach file">
          <Paperclip size={20} className="text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-accent transition-colors" title="Add image">
          <ImageIcon size={20} className="text-muted-foreground" />
        </button>
      </div>
      <div className="relative flex-1">
        <textarea
          ref={inputRef}
          placeholder="Type your message..."
          className="resize-none w-full rounded-lg border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={1}
          onKeyDown={handleKeyDown}
        />
        <button className="absolute right-2 bottom-2 p-1 rounded-full hover:bg-accent transition-colors" title="Add emoji">
          <Smile size={18} className="text-muted-foreground" />
        </button>
      </div>
      <button 
        className="p-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:shadow-md"
        onClick={() => {
          const text = inputRef.current?.value.trim();
          if (text && channel) {
            try {
              channel.sendMessage({ text });
              if (inputRef.current) {
                inputRef.current.value = '';
              }
            } catch (err) {
              console.error('Error sending message:', err);
            }
          }
        }}
        title="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
};

// Custom Channel Header
const CustomChannelHeader = ({ onBackClick }: { onBackClick?: () => void }) => {
  const { channel } = useChannelStateContext();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Extract the other user's information
  let otherUser: any = null;
  let channelName = channel?.data?.name || "Chat";
  let isOnline = false;
  
  try {
    if (channel) {
      if (channel.data?.name === "Direct Message") {
        const members = Object.values(channel.state?.members || {});
        // Access the client using _client instead of client
        const otherMember = members.find(m => m.user?.id !== channel._client?.userID);
        if (otherMember?.user) {
          otherUser = otherMember.user;
          channelName = otherMember.user.name || otherMember.user.id;
          isOnline = otherMember.user.online || false;
        }
      } else if (channel.data?.name && channel.data.name.includes('and')) {
        // Handle "user1 and user2" format
        const currentUserId = channel._client?.userID;
        const parts = channel.data.name.split(' and ');
        const otherUserName = parts.find(part => !part.includes(currentUserId?.toString() || ''));
        if (otherUserName) {
          channelName = otherUserName.trim();
        }
      }
    }
  } catch (err) {
    console.error("Error extracting channel info:", err);
  }
  
  return (
    <div className="custom-channel-header px-4 py-3 border-b flex items-center gap-3">
      {isMobile && onBackClick && (
        <button 
          onClick={onBackClick}
          className="p-1 rounded-full hover:bg-accent transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      <div className="relative">
        {otherUser?.image ? (
          // Use the avatar component without size prop
          <div className="w-10 h-10 overflow-hidden rounded-full">
            <Avatar image={otherUser.image} name={channelName} />
          </div>
        ) : (
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <UserCircle2 size={24} />
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-base">{channelName}</h3>
        <p className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
      
      <button className="p-2 rounded-full hover:bg-accent transition-colors">
        <Menu size={18} className="text-muted-foreground" />
      </button>
    </div>
  );
};

interface StreamChatComponentProps {
  activeChannelId?: string;
  onChannelSelect?: (channel: Channel) => void;
}

export const StreamChatComponent = ({
  activeChannelId,
  onChannelSelect,
}: StreamChatComponentProps) => {
  const { client, isConnecting, userChannels, error, isInitialized } =
    useStreamChat();
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>(
    undefined,
  );
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showChannelList, setShowChannelList] = useState(!isMobile);

  // Set the active channel when the activeChannelId prop changes
  useEffect(() => {
    if (client && isInitialized && activeChannelId) {
      try {
        const channel = userChannels.find((c) => c.id === activeChannelId);
        setActiveChannel(channel);
        if (isMobile) {
          setShowChannelList(false);
        }
      } catch (err) {
        console.error("Error setting active channel:", err);
        setActiveChannel(undefined);
      }
    }
  }, [client, isInitialized, activeChannelId, userChannels, isMobile]);

  // Update showChannelList when screen size changes
  useEffect(() => {
    if (isMobile && activeChannel) {
      setShowChannelList(false);
    } else if (!isMobile) {
      setShowChannelList(true);
    }
  }, [isMobile, activeChannel]);

  // If not connected, show loading
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-space">
          Connecting to chat...
        </p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl font-semibold font-space text-destructive">
          Connection Error
        </p>
        <p className="text-sm mt-2 max-w-md text-destructive/80">
          {error.message}
        </p>
        <p className="text-xs mt-4 text-muted-foreground">
          Try refreshing the page or check your internet connection
        </p>
      </div>
    );
  }

  // If not initialized or no client, show message
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-space">
          Chat service not available
        </p>
        <p className="text-xs mt-2 text-muted-foreground">
          Please try again later
        </p>
      </div>
    );
  }

  const handleChannelSelect = (channel: Channel) => {
    setActiveChannel(channel);
    if (isMobile) {
      setShowChannelList(false);
    }
    if (onChannelSelect) {
      onChannelSelect(channel);
    }
  };

  const handleBackToList = () => {
    setShowChannelList(true);
  };

  const filters = {
    type: "messaging",
    members: { $in: [client.userID || ""] },
  };
  // Use 'as any' to bypass typing issue with the Stream Chat API
  const sort = { last_message_at: -1 } as any;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="flex h-full w-full flex-1">
          {(showChannelList || !isMobile) && (
            <div className={`${isMobile ? 'w-full' : 'w-auto'} border-r overflow-hidden`}>
              <div className="channel-list-header py-3 px-4 border-b">
                <h2 className="text-lg font-semibold font-space">Messages</h2>
                <p className="text-xs text-muted-foreground">
                  {userChannels.length} conversations
                </p>
              </div>
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
                      console.error("Error selecting channel:", err);
                    }
                  };

                  // Safe message access
                  let lastMessage = "No messages yet";
                  let lastMessageTime = "";
                  let chatUserName = "";
                  try {
                    if (
                      channel.state?.messages &&
                      channel.state.messages.length > 0
                    ) {
                      const message =
                        channel.state.messages[channel.state.messages.length - 1];
                      lastMessage = message?.text || "No message content";
                      
                      if (channel.data?.name && channel.data.name.includes('and')) {
                        const currentUserId = client.userID;
                        const parts = channel.data.name.split(' and ');
                        chatUserName = parts.find(part => !part.includes(currentUserId?.toString() || ''))?.trim() || '';
                      }
                      
                      // Format date nicely
                      if (message?.created_at) {
                        const date = new Date(message.created_at);
                        const now = new Date();
                        const diffHours = Math.floor(
                          (now.getTime() - date.getTime()) / (1000 * 60 * 60),
                        );

                        if (diffHours < 24) {
                          lastMessageTime = date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        } else if (diffHours < 48) {
                          lastMessageTime = "Yesterday";
                        } else {
                          lastMessageTime = date.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          });
                        }
                      }
                    }
                  } catch (err) {
                    console.error("Error accessing channel messages:", err);
                    lastMessage = "Error loading messages";
                  }

                  // Get other member's data for direct channels
                  let otherUser = "User";
                  let isOnline = false;
                  let userImage = "";
                  
                  try {
                    if ((channel.data?.name === "Direct Message" || channel.data?.name?.includes('and')) && client) {
                      const members = Object.values(channel.state?.members || {});
                      const otherMember = members.find(
                        (m) => m.user?.id !== client.userID,
                      );
                      if (otherMember?.user) {
                        otherUser = otherMember.user.name || otherMember.user.id;
                        isOnline = otherMember.user.online || false;
                        userImage = otherMember.user.image || "";
                      }
                    }
                  } catch (err) {
                    console.error("Error accessing channel members:", err);
                  }

                  const isActive = activeChannel?.id === channel.id;
                  
                  return (
                    <div
                      className={`greenupp-channel-preview ${isActive ? "active" : ""}`}
                      onClick={handleClick}
                    >
                      <div className="flex justify-between items-center">
                        <div className="greenupp-channel-preview-title">
                          <div className="relative">
                            {userImage ? (
                              <img 
                                src={userImage} 
                                alt={otherUser}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <UserCircle2 size={22} />
                              </div>
                            )}
                            
                            {isOnline && (
                              <div className="online-indicator"></div>
                            )}
                          </div>
                          <div className="flex flex-col ml-2">
                            <span className="truncate font-medium">
                              {channel.data?.name === "Direct Message"
                                ? otherUser
                                : chatUserName || "Channel"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate mt-0.5">
                              {lastMessage}
                            </span>
                          </div>
                        </div>
                        {lastMessageTime && (
                          <div className="text-xs text-muted-foreground whitespace-nowrap pl-2">
                            {lastMessageTime}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}
          
          {/* Chat window - only show if we're on desktop, or on mobile when a channel is selected */}
          {(!isMobile || (isMobile && !showChannelList)) && (
            <div className="flex-1 w-full">
              {activeChannel ? (
                <StreamChannel channel={activeChannel}>
                  <Window>
                    <CustomChannelHeader onBackClick={isMobile ? handleBackToList : undefined} />
                    <div className="str-chat__scrollable-container">
                      <MessageList />
                    </div>
                    <CustomMessageInput />
                  </Window>
                  <Thread />
                </StreamChannel>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="text-lg font-medium">No conversation selected</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Select a conversation from the list or start a new chat to begin messaging
                  </p>
                  {isMobile && (
                    <button 
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2"
                      onClick={handleBackToList}
                    >
                      <ChevronLeft size={16} />
                      Back to Messages
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Chat>
    </div>
  );
};

export default StreamChatComponent;
