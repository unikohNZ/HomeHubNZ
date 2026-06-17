import { ChatMessage, ChatMessageType, Conversation, ReadReceipt } from "../../types/message";

const AVATAR_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#4F8CFF", "#ef4444"];

export function avatarColorFor(name: string, id?: number | string): string {
  const seed = id !== undefined ? String(id) : name;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export interface ApiReadReceipt {
  user_id: number;
  read_at: string;
}

export interface ApiChatRoom {
  id: number;
  name?: string | null;
  room_type: string;
  property_id?: number | null;
  last_message?: ApiChatMessage | null;
  unread_count: number;
}

export interface ApiChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  sender_name?: string | null;
  sender_avatar_url?: string | null;
  content: string;
  message_type: string;
  file_url?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  is_read: boolean;
  created_at: string;
  read_by?: ApiReadReceipt[];
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

export function mapApiRoomToConversation(room: ApiChatRoom, _currentUserId?: number): Conversation {
  const name = room.name ?? "Chat";
  const last = room.last_message;
  let lastMessage = "No messages yet";
  if (last) {
    if (last.message_type === "image") lastMessage = "📷 Photo";
    else if (last.message_type === "document") lastMessage = `📎 ${last.attachment_name ?? "Document"}`;
    else lastMessage = last.content;
  }
  const category =
    room.room_type === "landlord" ? "landlord" : room.room_type === "contractor" ? "contractor" : "flatmate";

  return {
    id: String(room.id),
    name,
    role: room.room_type,
    category,
    avatar_color: avatarColorFor(name, room.id),
    last_message: lastMessage,
    last_time: last ? formatRelativeTime(last.created_at) : "",
    unread_count: room.unread_count,
    online: false,
  };
}

export function mapApiMessageToChat(msg: ApiChatMessage, currentUserId?: number): ChatMessage {
  const isMine = currentUserId ? msg.sender_id === currentUserId : msg.sender_name === "You";
  const msgType = (msg.message_type === "image" || msg.message_type === "document"
    ? msg.message_type
    : "text") as ChatMessageType;

  const readBy: ReadReceipt[] = (msg.read_by ?? []).map((r) => ({
    user_id: r.user_id,
    read_at: r.read_at,
  }));

  return {
    id: String(msg.id),
    conversation_id: String(msg.room_id),
    sender_id: msg.sender_id,
    sender_name: msg.sender_name ?? (isMine ? "You" : "User"),
    sender_avatar_url: msg.sender_avatar_url ?? undefined,
    content: msg.content,
    created_at: msg.created_at,
    is_mine: isMine,
    type: msgType,
    image_uri: msgType === "image" ? msg.file_url ?? undefined : undefined,
    file_url: msg.file_url ?? undefined,
    attachment_name: msg.attachment_name ?? undefined,
    attachment_size: msg.attachment_size ?? undefined,
    read_by: readBy,
  };
}

/** Map a raw WebSocket message.new payload → ChatMessage */
export function mapWsMessageToChat(
  payload: ApiChatMessage,
  currentUserId?: number,
): ChatMessage {
  return mapApiMessageToChat(payload, currentUserId);
}
