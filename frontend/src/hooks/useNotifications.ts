import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppNotification } from "../../types/flat";
import { queryKeys } from "../lib/queryClient";
import { notificationService } from "../services/notificationService";

export function useNotifications(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.notifications.all,
    enabled,
    queryFn: async () => {
      const cached = queryClient.getQueryData<{ data: AppNotification[] }>(
        queryKeys.notifications.all,
      );
      return notificationService.list(cached?.data);
    },
    placeholderData: (prev) => prev,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  return {
    notifications: query.data?.data ?? [],
    source: query.data?.source,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.data?.error,
    refetch: query.refetch,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  };
}
