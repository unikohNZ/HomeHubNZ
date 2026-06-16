import { QueryClient } from "@tanstack/react-query";
import { useAppStore } from "../store/appStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      networkMode: "offlineFirst",
      throwOnError: false,
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === "updated" && event.query.state.fetchStatus === "idle") {
    if (event.query.state.status === "success") {
      useAppStore.getState().markSynced();
    }
    if (event.query.state.status === "error") {
      useAppStore.getState().setOffline(true);
    }
  }
});

export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    search: (params: Record<string, unknown>) =>
      ["properties", "search", params] as const,
    detail: (id: string | number) => ["properties", id] as const,
  },
  property: (id: string | number) => ["properties", id] as const,
  houseRules: {
    all: ["houseRules"] as const,
    property: (id: number) => ["house-rules", id] as const,
  },
  rentPayments: ["rentPayments"] as const,
  rent: {
    payments: ["rent", "payments"] as const,
    summary: ["rent", "summary"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },
  messages: {
    all: ["messages"] as const,
    rooms: ["messages", "rooms"] as const,
    room: (id: number) => ["messages", "room", id] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
  joinRequests: {
    mine: ["join-requests", "mine"] as const,
    property: (id: number) => ["join-requests", "property", id] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
  },
} as const;
