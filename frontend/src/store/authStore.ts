import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
  setSession: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clearSession: () =>
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
  setHydrated: (value) => set({ isHydrated: value }),
}));
