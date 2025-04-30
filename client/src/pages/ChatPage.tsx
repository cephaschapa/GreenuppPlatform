import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat, ChatMessage, ChatRoom, PotentialChatUser } from '@/hooks/use-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  Edit, 
  Send, 
  Users, 
  Plus, 
  Check, 
  Clock, 
  Loader2,
  MoreVertical,
  Menu as MenuIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { user } = useAuth();
  const { 
    rooms, 
    activeRoom, 
    messages, 
    typingUsers, 
    totalUnreadCount, 
    wsStatus,
    fetchRooms, 
    setActiveRoom, 
    sendMessage, 
    leaveRoom, 
    setTyping,
    createRoom,
    createDirectChat,
    fetchPotentialChatUsers
  } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [potentialUsers, setPotentialUsers] = useState<PotentialChatUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // No need to call fetchRooms on component mount anymore
  // The ChatProvider handles polling with adaptive frequency based on WebSocket status
  
  // Fetch potential chat users (users you follow)
  const loadPotentialChatUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await fetchPotentialChatUsers();
      setPotentialUsers(users);
    } catch (error) {
      console.error('Error loading potential chat users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Scroll to latest messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle typing indications
  const debouncedTypingTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator (with debounce)
    if (debouncedTypingTimeout.current) {
      clearTimeout(debouncedTypingTimeout.current);
    }
    
    setTyping(true);
    
    debouncedTypingTimeout.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput.trim());
    setMessageInput('');
    
    // Clear typing indicator
    if (debouncedTypingTimeout.current) {
      clearTimeout(debouncedTypingTimeout.current);
    }
    setTyping(false);
  };
  
  // Format time for messages
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      // Today, show time only
      if (date.toDateString() === now.toDateString()) {
        return format(date, 'HH:mm');
      }
      // Yesterday, show "Yesterday"
      else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${format(date, 'HH:mm')}`;
      }
      // This week, show day name
      else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return format(date, 'EEEE HH:mm');
      }
      // Older, show date
      else {
        return format(date, 'dd MMM yyyy');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get user display name
  const getUserDisplayName = (message: ChatMessage) => {
    if (message.senderFirstName && message.senderLastName) {
      return `${message.senderFirstName} ${message.senderLastName}`;
    } else if (message.senderFirstName) {
      return message.senderFirstName;
    } else {
      return message.senderUsername || 'Unknown User';
    }
  };

  // Connection status indicator has been removed as requested

  // Sidebar with chat rooms list
  const renderChatSidebar = () => (
    <div className="w-full md:w-80 border-r border-border">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="create-chat-dialog">
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Who would you like to chat with?
              </p>
              {/* Trigger loading of potential chat users when dialog opens */}
              <DialogTrigger asChild className="hidden">
                <div 
                  ref={(el) => {
                    if (el) loadPotentialChatUsers();
                  }}
                />
              </DialogTrigger>
              
              {isLoadingUsers ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : potentialUsers.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {potentialUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback>
                            {user.firstName 
                              ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`
                              : user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.relationship === 'following' ? 'You follow this user' : 'Suggested'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={async () => {
                          const room = await createDirectChat(user.id);
                          if (room) {
                            setActiveRoom(room.id);
                            const dialogClose = document.querySelector('.create-chat-dialog-close');
                            if (dialogClose && 'click' in dialogClose) {
                              // @ts-ignore
                              dialogClose.click();
                            }
                          }
                        }}
                      >
                        Chat
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-3">Follow users in GreenSocials to chat with them</p>
                  <Button className="w-full" onClick={() => createDirectChat(2)}>
                    Chat with Demo User
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Connection status indicator has been removed */}
      
      {rooms.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">No conversations yet</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" /> New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Who would you like to chat with?
                </p>
                {/* Trigger loading of potential chat users when dialog opens */}
                <DialogTrigger asChild className="hidden">
                  <div 
                    ref={(el) => {
                      if (el) loadPotentialChatUsers();
                    }}
                  />
                </DialogTrigger>
                
                {isLoadingUsers ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : potentialUsers.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-auto pr-1">
                    {potentialUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback>
                              {user.firstName 
                                ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`
                                : user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.relationship === 'following' ? 'You follow this user' : 'Suggested'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={async () => {
                            const room = await createDirectChat(user.id);
                            if (room) {
                              setActiveRoom(room.id);
                              const dialogClose = document.querySelector('.create-chat-dialog-close');
                              if (dialogClose && 'click' in dialogClose) {
                                // @ts-ignore
                                dialogClose.click();
                              }
                            }
                          }}
                        >
                          Chat
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-3">Follow users in GreenSocials to chat with them</p>
                    <Button className="w-full" onClick={() => createDirectChat(2)}>
                      Chat with Demo User
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-11rem)]">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-start gap-3 border-l-2 border-transparent",
                activeRoom?.id === room.id && "bg-accent text-accent-foreground border-l-2 border-primary"
              )}
              onClick={() => {
                setActiveRoom(room.id);
                setMobileMenuOpen(false);
              }}
            >
              <Avatar>
                {room.type === 'direct' ? (
                  <>
                    <AvatarImage src={getRoomAvatar(room)} />
                    <AvatarFallback>{getRoomInitials(room)}</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarFallback>
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{getRoomName(room)}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {room.lastMessageAt ? formatMessageTime(room.lastMessageAt) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate w-40">
                    {/* Here you would show last message preview */}
                    {room.type === 'direct' ? 'Direct message' : 'Group chat'}
                  </p>
                  {room.unreadCount && room.unreadCount > 0 ? (
                    <Badge className="ml-2">{room.unreadCount}</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
  
  // Get avatar for a room (for direct chats, show the other user's avatar)
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'direct' && room.members) {
      const otherMember = room.members.find(m => m.userId !== user?.id);
      return otherMember?.profileImage || '';
    }
    return '';
  };
  
  // Get initials for a room avatar
  const getRoomInitials = (room: ChatRoom) => {
    if (room.type === 'direct' && room.members) {
      const otherMember = room.members.find(m => m.userId !== user?.id);
      if (otherMember?.firstName && otherMember?.lastName) {
        return `${otherMember.firstName[0]}${otherMember.lastName[0]}`;
      } else if (otherMember?.username) {
        return otherMember.username[0].toUpperCase();
      }
    }
    return room.name ? room.name[0].toUpperCase() : '?';
  };
  
  // Get name for a room
  const getRoomName = (room: ChatRoom) => {
    if (room.type === 'direct' && room.members) {
      const otherMember = room.members.find(m => m.userId !== user?.id);
      if (otherMember?.firstName && otherMember?.lastName) {
        return `${otherMember.firstName} ${otherMember.lastName}`;
      } else if (otherMember?.username) {
        return otherMember.username;
      }
    }
    return room.name || 'Unnamed Chat';
  };
  
  // Render the main chat area with messages
  const renderChatArea = () => (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {activeRoom ? (
          <>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2"
                onClick={() => leaveRoom()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Avatar>
                {activeRoom.type === 'direct' ? (
                  <>
                    <AvatarImage src={getRoomAvatar(activeRoom)} />
                    <AvatarFallback>{getRoomInitials(activeRoom)}</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarFallback>
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div>
                <h2 className="font-medium">{getRoomName(activeRoom)}</h2>
                <p className="text-xs text-muted-foreground">
                  {activeRoom.type === 'direct' 
                    ? 'Direct Message' 
                    : `${activeRoom.members?.length || 0} members`}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Leave Chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <h2 className="font-medium">Select a conversation</h2>
          </div>
        )}
      </div>
      
      {/* Messages area */}
      {activeRoom ? (
        <>
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">No messages yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to start this conversation
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user?.id;
                  const showSender = index === 0 || 
                    messages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {!isOwn && showSender && (
                          <div className="flex items-center mb-1 gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.senderProfileImage} />
                              <AvatarFallback>
                                {message.senderUsername ? message.senderUsername[0].toUpperCase() : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {getUserDisplayName(message)}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "px-4 py-2 rounded-xl break-words",
                          isOwn 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted rounded-tl-none"
                        )}>
                          {message.content}
                          <div className={cn(
                            "text-xs mt-1 flex items-center justify-end gap-1",
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            <span>{formatMessageTime(message.sentAt)}</span>
                            {isOwn && (
                              message.status === 'read' 
                                ? <Check className="h-3 w-3" /> 
                                : <Clock className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing indicators */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-muted px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Array.from(typingUsers.values()).map(user => 
                        user.firstName || user.username || 'Someone'
                      ).join(', ')} is typing...
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>
          
          {/* Message input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Type your message..."
                value={messageInput}
                onChange={handleMessageInputChange}
              />
              <Button type="submit" disabled={!messageInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your Conversations</h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Select a conversation from the sidebar to start chatting
          </p>
          <Button className="mt-2">
            <Plus className="h-4 w-4 mr-2" /> New Conversation
          </Button>
        </div>
      )}
    </div>
  );
  
  // Mobile view
  const renderMobileView = () => (
    <>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          {renderChatSidebar()}
        </SheetContent>
      </Sheet>
    
      {renderChatArea()}
    </>
  );
  
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {renderChatSidebar()}
      </div>
      
      {/* Mobile view uses a drawer for the sidebar */}
      <div className="flex-1 md:hidden">
        {renderMobileView()}
      </div>
      
      {/* Desktop chat area */}
      <div className="hidden md:flex flex-1">
        {renderChatArea()}
      </div>
    </div>
  );
}