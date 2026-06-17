/**
 * ChatSocket — lightweight WebSocket client for HomeHub NZ real-time chat.
 *
 * Connects to ws(s)://host/ws/chat/{room_id}?token=...
 * Handles auto-reconnect with exponential back-off.
 *
 * Inbound event types:
 *   message.new    → { type, message: ApiChatMessage }
 *   message.read   → { type, message_id, user_id, read_at }
 *   typing.start   → { type, user_id }
 *   typing.stop    → { type, user_id }
 *   presence.online  → { type, user_id, online_users }
 *   presence.offline → { type, user_id, online_users }
 *   error          → { type, message }
 *
 * Outbound event types (call the helper methods):
 *   sendText / sendImage / sendDocument  → message.send
 *   markRead                             → message.read
 *   startTyping / stopTyping             → typing.start / typing.stop
 */

import { API_BASE_URL } from "./api";
import { ApiChatMessage } from "../utils/chatMapper";

export const WS_BASE_URL: string =
  (process.env.EXPO_PUBLIC_WS_URL as string | undefined) ??
  API_BASE_URL.replace(/^https?/, (m) => (m === "https" ? "wss" : "ws"));

// --------------------------------------------------------------------------
// Inbound event union
// --------------------------------------------------------------------------

export interface WsMessageNew {
  type: "message.new";
  message: ApiChatMessage;
}

export interface WsMessageRead {
  type: "message.read";
  message_id: number;
  user_id: number;
  read_at: string;
}

export interface WsTyping {
  type: "typing.start" | "typing.stop";
  user_id: number;
}

export interface WsPresence {
  type: "presence.online" | "presence.offline";
  user_id: number;
  online_users: number[];
}

export interface WsError {
  type: "error";
  message: string;
}

export type WsEvent = WsMessageNew | WsMessageRead | WsTyping | WsPresence | WsError;

// --------------------------------------------------------------------------
// Event handler map
// --------------------------------------------------------------------------

type HandlerMap = {
  "message.new": (e: WsMessageNew) => void;
  "message.read": (e: WsMessageRead) => void;
  "typing.start": (e: WsTyping) => void;
  "typing.stop": (e: WsTyping) => void;
  "presence.online": (e: WsPresence) => void;
  "presence.offline": (e: WsPresence) => void;
  "error": (e: WsError) => void;
  "open": () => void;
  "close": () => void;
};

type Handlers = { [K in keyof HandlerMap]?: HandlerMap[K][] };

// --------------------------------------------------------------------------
// ChatSocket
// --------------------------------------------------------------------------

const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 15000, 30000];

export class ChatSocket {
  private socket: WebSocket | null = null;
  private roomId: number;
  private getToken: () => Promise<string | null>;
  private handlers: Handlers = {};
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(roomId: number, getToken: () => Promise<string | null>) {
    this.roomId = roomId;
    this.getToken = getToken;
  }

  // ---- lifecycle ----------------------------------------------------------

  async connect(): Promise<void> {
    if (this.destroyed) return;
    const token = await this.getToken();
    if (!token) return;

    const url = `${WS_BASE_URL}/ws/chat/${this.roomId}?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this._emit("open");
    };

    this.socket.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data as string) as WsEvent;
        switch (event.type) {
          case "message.new":
            this._emit("message.new", event as WsMessageNew);
            break;
          case "message.read":
            this._emit("message.read", event as WsMessageRead);
            break;
          case "typing.start":
          case "typing.stop":
            this._emit(event.type, event as WsTyping);
            break;
          case "presence.online":
          case "presence.offline":
            this._emit(event.type, event as WsPresence);
            break;
          case "error":
            this._emit("error", event as WsError);
            break;
          default:
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    this.socket.onclose = () => {
      this._emit("close");
      this._scheduleReconnect();
    };

    this.socket.onerror = () => {
      // onclose fires right after — handled there
    };
  }

  disconnect(): void {
    this.destroyed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  // ---- send helpers -------------------------------------------------------

  sendText(content: string): void {
    this._send({ type: "message.send", content, message_type: "text" });
  }

  sendImage(fileUrl: string, attachmentName?: string, attachmentSize?: number): void {
    this._send({
      type: "message.send",
      content: "",
      message_type: "image",
      file_url: fileUrl,
      attachment_name: attachmentName,
      attachment_size: attachmentSize,
    });
  }

  sendDocument(fileUrl: string, attachmentName?: string, attachmentSize?: number): void {
    this._send({
      type: "message.send",
      content: "",
      message_type: "document",
      file_url: fileUrl,
      attachment_name: attachmentName,
      attachment_size: attachmentSize,
    });
  }

  markRead(messageId: number): void {
    this._send({ type: "message.read", message_id: messageId });
  }

  startTyping(): void {
    this._send({ type: "typing.start" });
  }

  stopTyping(): void {
    this._send({ type: "typing.stop" });
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // ---- event subscription -------------------------------------------------

  on<K extends keyof HandlerMap>(event: K, handler: HandlerMap[K]): () => void {
    if (!this.handlers[event]) {
      (this.handlers as Record<string, unknown[]>)[event] = [];
    }
    (this.handlers[event] as HandlerMap[K][]).push(handler);
    // Return an unsubscribe function
    return () => {
      const arr = this.handlers[event] as HandlerMap[K][] | undefined;
      if (!arr) return;
      const idx = arr.indexOf(handler);
      if (idx !== -1) arr.splice(idx, 1);
    };
  }

  // ---- private ------------------------------------------------------------

  private _send(data: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  private _emit<K extends keyof Handlers>(event: K, ...args: Parameters<NonNullable<HandlerMap[K]>>): void {
    const arr = this.handlers[event] as ((...a: Parameters<NonNullable<HandlerMap[K]>>) => void)[] | undefined;
    if (!arr) return;
    for (const h of arr) h(...args);
  }

  private _scheduleReconnect(): void {
    if (this.destroyed) return;
    const delay = RECONNECT_DELAYS_MS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      if (!this.destroyed) void this.connect();
    }, delay);
  }
}
