import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { queryKeys } from "@/lib/queryClient";
import api from "@/services/api";
import type { User } from "@/types";

async function fetchMe(): Promise<User | null> {
  return authService.restoreSession();
}

export function useAuthSession() {
  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    staleTime: Infinity,
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    isOffline: query.isError,
    refetch: query.refetch,
    logout: logoutMutation.mutateAsync,
  };
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) =>
      authService.login(email, password, rememberMe),
    onSuccess: (user) => {
      client.setQueryData(queryKeys.auth.me, user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: async () => {
      const { data } = await api.get("/profile/me");
      return data;
    },
    enabled: !authService.isMockMode(),
  });
}
