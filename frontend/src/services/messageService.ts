import { Conversation, ChatMessage } from "../../types/message";
import { MOCK_CHAT_MESSAGES, MOCK_CONVERSATIONS } from "../../data/mockMessages";
import {
  ApiChatMessage,
  ApiChatRoom,
  mapApiMessageToChat,
  mapApiRoomToConversation,
} from "../utils/chatMapper";
import { DataResult, isMockMode, resolveOfflineData } from "../utils/dataSource";
import api, { getApiErrorMessage } from "./api";
import { tokenStorage } from "./tokenStorage";

let usingApi = false;

export function isMessagesUsingLiveApi(): boolean {
  return usingApi;
}

export const messageService = {
  async getConversations(cached?: Conversation[]): Promise<DataResult<Conversation[]>> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 200));
      return { data: MOCK_CONVERSATIONS, source: "mock" };
    }

    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const { data } = await api.get<ApiChatRoom[]>("/chat/rooms");
      usingApi = true;
      return {
        data: (data ?? []).map((r) => mapApiRoomToConversation(r)),
        source: "api",
      };
    } catch (error) {
      usingApi = false;
      return resolveOfflineData(cached, MOCK_CONVERSATIONS, getApiErrorMessage(error));
    }
  },

  async getMessages(
    roomId: string,
    cached?: ChatMessage[],
    currentUserId?: number,
  ): Promise<DataResult<ChatMessage[]>> {
    const mockKey = roomId in MOCK_CHAT_MESSAGES ? roomId : Object.keys(MOCK_CHAT_MESSAGES)[0];
    const mockMessages = MOCK_CHAT_MESSAGES[mockKey] ?? MOCK_CHAT_MESSAGES[roomId] ?? [];

    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 150));
      return { data: mockMessages, source: "mock" };
    }

    const numericId = parseInt(roomId, 10);
    if (Number.isNaN(numericId)) {
      return resolveOfflineData(cached, mockMessages);
    }

    try {
      const { data } = await api.get<ApiChatMessage[]>(`/chat/rooms/${numericId}/messages`);
      usingApi = true;
      return {
        data: (data ?? []).map((m) => mapApiMessageToChat(m, currentUserId)),
        source: "api",
      };
    } catch (error) {
      usingApi = false;
      return resolveOfflineData(cached, mockMessages, getApiErrorMessage(error));
    }
  },

  async sendText(
    roomId: string,
    content: string,
    currentUserId?: number,
  ): Promise<DataResult<ChatMessage>> {
    if (isMockMode()) {
      const msg: ChatMessage = {
        id: String(Date.now()),
        conversation_id: roomId,
        sender_name: "You",
        content,
        created_at: new Date().toISOString(),
        is_mine: true,
        type: "text",
      };
      return { data: msg, source: "mock" };
    }

    const numericId = parseInt(roomId, 10);
    const { data } = await api.post<ApiChatMessage>(`/chat/rooms/${numericId}/messages`, {
      content,
      message_type: "text",
    });
    usingApi = true;
    return {
      data: mapApiMessageToChat(data, currentUserId),
      source: "api",
    };
  },

  async sendImage(
    roomId: string,
    file: { uri: string; name: string; type: string },
    currentUserId?: number,
  ): Promise<DataResult<ChatMessage>> {
    if (isMockMode()) {
      const msg: ChatMessage = {
        id: String(Date.now()),
        conversation_id: roomId,
        sender_name: "You",
        content: "",
        created_at: new Date().toISOString(),
        is_mine: true,
        type: "image",
        image_uri: file.uri,
      };
      return { data: msg, source: "mock" };
    }

    const numericId = parseInt(roomId, 10);
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const { data } = await api.post<ApiChatMessage>(
      `/chat/rooms/${numericId}/messages/image`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    usingApi = true;
    return {
      data: mapApiMessageToChat(data, currentUserId),
      source: "api",
    };
  },
};
