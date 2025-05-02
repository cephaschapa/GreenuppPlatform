import { ChatRoom, ChatMessage } from '@shared/schema';

// Extended SocketIO chat types

export interface ExtendedChatRoom extends ChatRoom {
  unreadCount?: number;
  members?: ChatRoomMemberWithUser[];
}

export interface ChatRoomMemberWithUser {
  id: number;
  roomId: number;
  userId: number;
  isAdmin: boolean;
  joinedAt: Date;
  lastReadAt: Date | null;
  isMuted: boolean;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  isOnline?: boolean;
}

export interface TypingUser {
  userId: number;
  roomId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}