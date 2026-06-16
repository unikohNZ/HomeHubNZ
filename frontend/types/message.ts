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

export type ChatMessageType = "text" | "image";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_mine: boolean;
  type?: ChatMessageType;
  image_uri?: string;
}
