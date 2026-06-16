import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RentPayment } from "../../types/rent";
import { TenantPayment } from "../../types/tenantPayment";
import { queryKeys } from "../lib/queryClient";
import { rentPaymentService } from "../services/rentPaymentService";

export function useRentPayments(enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.rent.payments,
    enabled,
    queryFn: async () => {
      const cached = queryClient.getQueryData<{ data: RentPayment[] }>(queryKeys.rent.payments);
      return rentPaymentService.listRentPayments(cached?.data);
    },
    placeholderData: (prev) => prev,
  });
}

export function useTenantPayments(enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.rentPayments,
    enabled,
    queryFn: async () => {
      const cached = queryClient.getQueryData<{ data: TenantPayment[] }>(queryKeys.rentPayments);
      return rentPaymentService.listTenantPayments(cached?.data);
    },
    placeholderData: (prev) => prev,
  });
}

export function useMarkTenantPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentDate }: { id: string; paymentDate: string }) =>
      rentPaymentService.markPaid(id, paymentDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentPayments });
      queryClient.invalidateQueries({ queryKey: queryKeys.rent.payments });
    },
  });
}

export function useCreateRentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rentPaymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rent.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentPayments });
    },
  });
}
