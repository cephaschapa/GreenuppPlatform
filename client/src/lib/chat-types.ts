import { ChatRoom as BaseChatRoom, ChatMessage as BaseChatMessage } from '@shared/schema';

// Extended SocketIO chat types

// Create a new interface instead of extending to avoid type conflicts
export interface ExtendedChatRoom {
  id: number;
  name: string | null;
  type: "direct" | "group";
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  lastMessageAt: Date | null;
  isActive: boolean;
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

export interface ExtendedChatMessage extends BaseChatMessage {
  senderUsername?: string;
  senderFirstName?: string | null;
  senderLastName?: string | null;
  senderProfileImage?: string | null;
}

export interface TypingUser {
  userId: number;
  roomId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

// For casting in the component
export function asExtendedChatRoom(room: BaseChatRoom): ExtendedChatRoom {
  return {
    ...room,
    lastMessageAt: room.lastMessageAt || null
  } as ExtendedChatRoom;
}