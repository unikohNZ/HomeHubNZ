import api from "./api";
import { queryKeys } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const joinRequestService = {
  async create(propertyId: number, message?: string) {
    const { data } = await api.post("/join-requests", { property_id: propertyId, message });
    return data;
  },
  async mine() {
    const { data } = await api.get("/join-requests/mine");
    return data;
  },
  async review(requestId: number, status: "approved" | "rejected") {
    const { data } = await api.patch(`/join-requests/${requestId}`, { status });
    return data;
  },
};

export function useMyJoinRequests() {
  return useQuery({
    queryKey: queryKeys.joinRequests.mine,
    queryFn: () => joinRequestService.mine(),
    placeholderData: (prev) => prev,
  });
}

export function useCreateJoinRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, message }: { propertyId: number; message?: string }) =>
      joinRequestService.create(propertyId, message),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.joinRequests.mine }),
  });
}
