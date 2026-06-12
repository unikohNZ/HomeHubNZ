import api from "./api";
import { ChatMessage, ChatRoom } from "@/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHAT_ROOMS } from "@/data/mockData";

const USE_MOCK = true;
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const messageService = {
  async rooms(): Promise<ChatRoom[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_CHAT_ROOMS;
    }
    const { data } = await api.get("/chat/rooms");
    return data;
  },

  async messages(roomId: number): Promise<ChatMessage[]> {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_CHAT_MESSAGES[roomId] ?? [];
    }
    const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
    return data;
  },

  async send(roomId: number, content: string): Promise<ChatMessage> {
    if (USE_MOCK) {
      await delay(150);
      return {
        id: Date.now(),
        room_id: roomId,
        sender_id: 1,
        sender_name: "You",
        content,
        created_at: new Date().toISOString(),
        is_mine: true,
      };
    }
    const { data } = await api.post(`/chat/rooms/${roomId}/messages`, {
      content,
    });
    return data;
  },
};
