import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaintenanceRequest } from "../../types/flat";
import { queryKeys } from "../lib/queryClient";
import { maintenanceService, NewMaintenanceInput } from "../services/maintenanceService";

export function useMaintenance(propertyId: number | null, enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["maintenance", propertyId] as const,
    enabled: enabled && !!propertyId,
    queryFn: async () => {
      const key = ["maintenance", propertyId] as const;
      const cached = queryClient.getQueryData<{ data: MaintenanceRequest[] }>(key);
      return maintenanceService.list(propertyId!, cached?.data);
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewMaintenanceInput) => maintenanceService.create(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", variables.property_id] });
    },
  });
}
