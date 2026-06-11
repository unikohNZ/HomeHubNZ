import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/data/mockData";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: mockApi.getDashboard,
  });
}

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: mockApi.getProperties,
  });
}

export function useRentPayments() {
  return useQuery({
    queryKey: ["rent"],
    queryFn: mockApi.getRentPayments,
  });
}

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: mockApi.getMaintenance,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: mockApi.getNotifications,
  });
}
