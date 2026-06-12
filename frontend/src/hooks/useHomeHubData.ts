import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  maintenanceService,
  NewMaintenanceInput,
} from "@/services/maintenanceService";
import {
  NewPropertyInput,
  propertyService,
} from "@/services/propertyService";
import { NewPaymentInput, rentService } from "@/services/rentService";
import { messageService } from "@/services/messageService";
import {
  MaintenanceRequest,
  Property,
  RentPayment,
} from "@/types";

export const queryKeys = {
  properties: ["properties"] as const,
  property: (id: number) => ["properties", id] as const,
  rent: ["rent"] as const,
  maintenance: ["maintenance"] as const,
  rooms: ["chat-rooms"] as const,
  messages: (id: number) => ["chat-messages", id] as const,
};

export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: propertyService.list,
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: () => propertyService.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPropertyInput) => propertyService.create(input),
    onSuccess: (created) => {
      qc.setQueryData<Property[]>(queryKeys.properties, (prev = []) => [
        ...prev,
        created,
      ]);
    },
  });
}

export function useRentPayments() {
  return useQuery({ queryKey: queryKeys.rent, queryFn: rentService.list });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPaymentInput) => rentService.create(input),
    onSuccess: (created) => {
      qc.setQueryData<RentPayment[]>(queryKeys.rent, (prev = []) => [
        created,
        ...prev,
      ]);
    },
  });
}

export function useMaintenance() {
  return useQuery({
    queryKey: queryKeys.maintenance,
    queryFn: maintenanceService.list,
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewMaintenanceInput) =>
      maintenanceService.create(input),
    onSuccess: (created) => {
      qc.setQueryData<MaintenanceRequest[]>(
        queryKeys.maintenance,
        (prev = []) => [created, ...prev],
      );
    },
  });
}

export function useChatRooms() {
  return useQuery({ queryKey: queryKeys.rooms, queryFn: messageService.rooms });
}

export function useChatMessages(roomId: number) {
  return useQuery({
    queryKey: queryKeys.messages(roomId),
    queryFn: () => messageService.messages(roomId),
    enabled: Number.isFinite(roomId),
  });
}
