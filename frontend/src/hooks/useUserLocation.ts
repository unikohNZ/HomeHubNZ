import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserLocation,
  saveUserLocation,
  UserLocation,
} from "../services/locationService";
import { isMockMode } from "../utils/dataSource";

export const locationQueryKey = ["user", "location"] as const;

export function useUserLocation() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: locationQueryKey,
    queryFn: fetchUserLocation,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: saveUserLocation,
    onSuccess: (data) => {
      queryClient.setQueryData(locationQueryKey, data);
    },
  });

  const location = query.data;
  const hasLocation = Boolean(location?.preferred_location_name);

  return {
    location,
    hasLocation,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    saveLocation: mutation.mutateAsync,
    refetch: query.refetch,
    isMock: isMockMode(),
  };
}

export function formatLocationLabel(loc?: UserLocation | null): string | null {
  return loc?.preferred_location_name?.trim() || null;
}
