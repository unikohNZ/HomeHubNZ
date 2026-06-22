import { useQuery } from "@tanstack/react-query";
import {
  buildChatPreview,
  buildRecentActivity,
  EllaActivityItem,
  EllaContext,
  EllaPreviewMessage,
  fetchEllaContext,
  mapApiContextToEllaContext,
} from "../services/ellaService";
import { isMockMode } from "../utils/dataSource";

export function useEllaContext(fallback: EllaContext) {
  const mock = isMockMode();

  const query = useQuery({
    queryKey: ["ella", "context"],
    queryFn: fetchEllaContext,
    enabled: !mock,
    staleTime: 30_000,
  });

  const ctx: EllaContext = mock
    ? fallback
    : query.data
      ? mapApiContextToEllaContext(query.data, fallback)
      : fallback;

  const activityItems: EllaActivityItem[] = mock
    ? buildRecentActivity(fallback)
    : query.data?.activity ?? buildRecentActivity(ctx);

  const previewMessages: EllaPreviewMessage[] = mock
    ? buildChatPreview(fallback)
    : query.data?.chat_preview ?? buildChatPreview(ctx);

  return {
    ctx,
    activityItems,
    previewMessages,
    isLoading: !mock && query.isLoading,
    isError: !mock && query.isError,
    refetch: query.refetch,
    dataSource: mock ? "mock" : (query.data?.data_source ?? "database"),
  };
}
