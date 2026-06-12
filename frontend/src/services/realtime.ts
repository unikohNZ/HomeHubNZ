import { API_BASE_URL } from "./api";
import { ChatMessage } from "@/types";

/**
 * Lightweight WebSocket client scaffold for HomeHub NZ chat.
 *
 * The backend exposes ws://host/ws/chat/{room_id}. This wrapper is wired
 * for that contract so the Messages screen can move from mock data to live
 * realtime by calling connect() instead of polling. Not yet activated.
 */

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ?? API_BASE_URL.replace(/^http/, "ws");

type MessageHandler = (message: ChatMessage) => void;

export class ChatSocket {
  private socket: WebSocket | null = null;
  private roomId: number;
  private onMessage: MessageHandler;

  constructor(roomId: number, onMessage: MessageHandler) {
    this.roomId = roomId;
    this.onMessage = onMessage;
  }

  connect(token?: string) {
    const url = `${WS_BASE_URL}/ws/chat/${this.roomId}${
      token ? `?token=${token}` : ""
    }`;
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ChatMessage;
        this.onMessage(data);
      } catch {
        // ignore malformed frames
      }
    };
  }

  send(content: string) {
    this.socket?.send(JSON.stringify({ content }));
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
