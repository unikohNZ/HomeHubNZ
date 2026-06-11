type MessageHandler = (data: Record<string, unknown>) => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnects = 5;

  connect(roomId: number, token: string) {
    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:8000";
    this.ws = new WebSocket(`${wsUrl}/ws/chat/${roomId}?token=${token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const type = data.type as string;
      const handlers = this.handlers.get(type) || [];
      handlers.forEach((h) => h(data));
      const allHandlers = this.handlers.get("*") || [];
      allHandlers.forEach((h) => h(data));
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(roomId, token), 2000 * this.reconnectAttempts);
      }
    };
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: MessageHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      this.handlers.set(event, handlers.filter((h) => h !== handler));
    }
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }

  sendMessage(content: string, messageType = "text", fileUrl?: string) {
    this.send("message.send", { content, message_type: messageType, file_url: fileUrl });
  }

  markRead(messageId: number) {
    this.send("message.read", { message_id: messageId });
  }

  startTyping() {
    this.send("typing.start");
  }

  stopTyping() {
    this.send("typing.stop");
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }
}
