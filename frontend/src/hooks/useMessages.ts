import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatMessage, Conversation } from "../../types/message";
import { queryKeys } from "../lib/queryClient";
import { messageService } from "../services/messageService";

export interface MessagesQueryResult {
  data: Conversation[];
  source: "api" | "mock" | "cache";
  error?: string;
}

export function useConversations(enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.messages.rooms,
    enabled,
    queryFn: async () => {
      const cached = queryClient.getQueryData<MessagesQueryResult>(queryKeys.messages.rooms);
      return messageService.getConversations(cached?.data);
    },
    placeholderData: (prev) => prev,
  });
}

export function useChatMessages(roomId: string | null, currentUserId?: number) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.messages.room(Number(roomId) || roomId || "none"),
    enabled: !!roomId,
    queryFn: async () => {
      const key = queryKeys.messages.room(Number(roomId) || roomId || "none");
      const cached = queryClient.getQueryData<{ data: ChatMessage[] }>(key);
      return messageService.getMessages(roomId!, cached?.data, currentUserId);
    },
    placeholderData: (prev) => prev,
  });
}

export function useSendMessage(currentUserId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, content }: { roomId: string; content: string }) =>
      messageService.sendText(roomId, content, currentUserId),
    onSuccess: (_result, { roomId }) => {
      const key = queryKeys.messages.room(Number(roomId) || roomId);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.rooms });
    },
  });
}

export function useSendImageMessage(currentUserId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      file,
    }: {
      roomId: string;
      file: { uri: string; name: string; type: string };
    }) => messageService.sendImage(roomId, file, currentUserId),
    onSuccess: (_result, { roomId }) => {
      const key = queryKeys.messages.room(Number(roomId) || roomId);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.rooms });
    },
  });
}

export function useSendDocumentMessage(currentUserId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      file,
    }: {
      roomId: string;
      file: { uri: string; name: string; type: string };
    }) => messageService.sendDocument(roomId, file, currentUserId),
    onSuccess: (_result, { roomId }) => {
      const key = queryKeys.messages.room(Number(roomId) || roomId);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.rooms });
    },
  });
}
