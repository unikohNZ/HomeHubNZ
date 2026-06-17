export type MessageCategory = "landlord" | "flatmate" | "contractor";

export interface Conversation {
  id: string;
  name: string;
  role: string;
  category: MessageCategory;
  avatar_color: string;
  property_name?: string;
  last_message: string;
  last_time: string;
  unread_count: number;
  online: boolean;
  typing?: boolean;
}

export type ChatMessageType = "text" | "image" | "document";

export interface ReadReceipt {
  user_id: number;
  read_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id?: number;
  sender_name: string;
  sender_avatar_url?: string;
  content: string;
  created_at: string;
  is_mine: boolean;
  type?: ChatMessageType;
  /** image_uri is populated for type === "image" */
  image_uri?: string;
  /** file_url is the storage URL for images and documents */
  file_url?: string;
  /** attachment metadata for documents */
  attachment_name?: string;
  attachment_size?: number;
  read_by?: ReadReceipt[];
}

export interface TypingUser {
  user_id: number;
  /** ISO timestamp when typing started — used to auto-clear after a timeout */
  since: string;
}

export interface PresenceState {
  online_user_ids: number[];
}
