/**
 * useRealtimeChat
 *
 * Manages a WebSocket connection to a chat room.
 * - Injects new messages into the React Query cache.
 * - Exposes typing users and online presence.
 * - Emits read receipts when messages arrive.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ChatMessage, TypingUser } from "../../types/message";
import { queryKeys } from "../lib/queryClient";
import { getToken } from "../services/tokenStorage";
import { ChatSocket, WsMessageNew, WsMessageRead, WsTyping, WsPresence } from "../services/realtime";
import { mapWsMessageToChat } from "../utils/chatMapper";

const TYPING_TIMEOUT_MS = 4000;

interface UseRealtimeChatOptions {
  roomId: string | null;
  currentUserId?: number;
  /** Called whenever a new message arrives (useful for scroll-to-bottom). */
  onNewMessage?: (msg: ChatMessage) => void;
}

interface UseRealtimeChatResult {
  isConnected: boolean;
  typingUsers: TypingUser[];
  onlineUserIds: number[];
  sendText: (content: string) => void;
  sendImage: (fileUrl: string, name?: string, size?: number) => void;
  sendDocument: (fileUrl: string, name?: string, size?: number) => void;
  markRead: (messageId: number) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

export function useRealtimeChat({
  roomId,
  currentUserId,
  onNewMessage,
}: UseRealtimeChatOptions): UseRealtimeChatResult {
  const queryClient = useQueryClient();
  const socketRef = useRef<ChatSocket | null>(null);
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

  // ------------------------------------------------------------------
  // Helpers to mutate the React Query cache
  // ------------------------------------------------------------------

  const appendMessage = useCallback(
    (msg: ChatMessage) => {
      const key = queryKeys.messages.room(Number(roomId) || roomId || "none");
      queryClient.setQueryData<{ data: ChatMessage[]; source: string }>(key, (old) => ({
        data: [...(old?.data ?? []), msg],
        source: "api",
      }));
      // Invalidate room list to refresh last message / unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.rooms });
      onNewMessage?.(msg);
    },
    [queryClient, roomId, onNewMessage],
  );

  const markReadInCache = useCallback(
    (messageId: number, userId: number, readAt: string) => {
      const key = queryKeys.messages.room(Number(roomId) || roomId || "none");
      queryClient.setQueryData<{ data: ChatMessage[]; source: string }>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((m) => {
            if (String(m.id) !== String(messageId)) return m;
            const already = (m.read_by ?? []).some((r) => r.user_id === userId);
            if (already) return m;
            return {
              ...m,
              read_by: [...(m.read_by ?? []), { user_id: userId, read_at: readAt }],
            };
          }),
        };
      });
    },
    [queryClient, roomId],
  );

  // ------------------------------------------------------------------
  // Typing helpers
  // ------------------------------------------------------------------

  const addTypingUser = useCallback((userId: number) => {
    setTypingUsers((prev) => {
      const exists = prev.some((u) => u.user_id === userId);
      if (exists) return prev;
      return [...prev, { user_id: userId, since: new Date().toISOString() }];
    });

    // Auto-clear after timeout
    if (typingTimersRef.current[userId]) clearTimeout(typingTimersRef.current[userId]);
    typingTimersRef.current[userId] = setTimeout(() => {
      removeTypingUser(userId);
    }, TYPING_TIMEOUT_MS);
  }, []);

  const removeTypingUser = useCallback((userId: number) => {
    if (typingTimersRef.current[userId]) {
      clearTimeout(typingTimersRef.current[userId]);
      delete typingTimersRef.current[userId];
    }
    setTypingUsers((prev) => prev.filter((u) => u.user_id !== userId));
  }, []);

  // ------------------------------------------------------------------
  // WebSocket lifecycle
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!roomId) return;

    const socket = new ChatSocket(Number(roomId), getToken);
    socketRef.current = socket;

    const offOpen = socket.on("open", () => setIsConnected(true));
    const offClose = socket.on("close", () => setIsConnected(false));

    const offNewMsg = socket.on("message.new", (e: WsMessageNew) => {
      const msg = mapWsMessageToChat(e.message, currentUserId);
      appendMessage(msg);
      // Auto-mark as read if it's not from us
      if (msg.sender_id !== currentUserId) {
        socket.markRead(e.message.id);
      }
    });

    const offRead = socket.on("message.read", (e: WsMessageRead) => {
      markReadInCache(e.message_id, e.user_id, e.read_at);
    });

    const offTypingStart = socket.on("typing.start", (e: WsTyping) => {
      if (e.user_id !== currentUserId) addTypingUser(e.user_id);
    });

    const offTypingStop = socket.on("typing.stop", (e: WsTyping) => {
      removeTypingUser(e.user_id);
    });

    const offOnline = socket.on("presence.online", (e: WsPresence) => {
      setOnlineUserIds(e.online_users);
    });

    const offOffline = socket.on("presence.offline", (e: WsPresence) => {
      setOnlineUserIds(e.online_users);
    });

    void socket.connect();

    return () => {
      offOpen();
      offClose();
      offNewMsg();
      offRead();
      offTypingStart();
      offTypingStop();
      offOnline();
      offOffline();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setTypingUsers([]);
    };
  }, [roomId, currentUserId, appendMessage, markReadInCache, addTypingUser, removeTypingUser]);

  // ------------------------------------------------------------------
  // Exposed helpers that delegate to the socket
  // ------------------------------------------------------------------

  const sendText = useCallback((content: string) => {
    socketRef.current?.sendText(content);
  }, []);

  const sendImage = useCallback((fileUrl: string, name?: string, size?: number) => {
    socketRef.current?.sendImage(fileUrl, name, size);
  }, []);

  const sendDocument = useCallback((fileUrl: string, name?: string, size?: number) => {
    socketRef.current?.sendDocument(fileUrl, name, size);
  }, []);

  const markRead = useCallback((messageId: number) => {
    socketRef.current?.markRead(messageId);
  }, []);

  const startTyping = useCallback(() => {
    socketRef.current?.startTyping();
  }, []);

  const stopTyping = useCallback(() => {
    socketRef.current?.stopTyping();
  }, []);

  return {
    isConnected,
    typingUsers,
    onlineUserIds,
    sendText,
    sendImage,
    sendDocument,
    markRead,
    startTyping,
    stopTyping,
  };
}
