import api, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, getApiErrorMessage } from "./api";
import { storage } from "./storage";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { AuthTokens, User, UserRole } from "@/types";
import { MOCK_USER } from "@/data/mockData";
import { validateDemoLogin } from "../../data/demoAccounts";
import { FLATMATE_USER, LANDLORD_USER } from "../../data/mockUsers";
import type { User as LegacyUser } from "../../types/user";

/**
 * Production auth service.
 * Set EXPO_PUBLIC_USE_MOCK=false to use FastAPI JWT auth.
 * Demo accounts still work when mock mode is on.
 */

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== "false";
const MOCK_USER_KEY = "homehub_mock_user";
const REMEMBER_ME_KEY = "homehub_remember_me";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

function mapApiUser(data: {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: string;
}): User {
  return {
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone ?? undefined,
    avatar_url: data.avatar_url ?? undefined,
    role: (data.role === "landlord" ? "landlord" : "tenant") as UserRole,
  };
}

function mapDemoUser(demo: LegacyUser): User {
  return {
    id: Number(demo.id.replace(/\D/g, "")) || 1,
    email: demo.email,
    first_name: demo.name.split(" ")[0] ?? demo.name,
    last_name: demo.name.split(" ").slice(1).join(" ") || "User",
    phone: undefined,
    avatar_url: undefined,
    role: demo.role,
  };
}

async function persistTokens(tokens: AuthTokens) {
  await storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  await storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  useAuthStore.getState().setSession(
    useAuthStore.getState().user!,
    tokens.access_token,
    tokens.refresh_token,
  );
}

export const authService = {
  isMockMode: () => USE_MOCK,

  async login(email: string, password: string, rememberMe = true): Promise<User> {
    if (USE_MOCK) {
      const demoUser = validateDemoLogin(email, password);
      if (!demoUser) throw new Error("Invalid email or password. Try the demo accounts.");
      const user = mapDemoUser(demoUser);
      await storage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      if (rememberMe) await storage.setItem(REMEMBER_ME_KEY, "true");
      useAuthStore.getState().setSession(user, "demo-token", "demo-refresh");
      return user;
    }

    try {
      const { data } = await api.post<AuthTokens>("/auth/login", { email, password });
      await storage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      const me = await api.get("/auth/me");
      const user = mapApiUser(me.data);
      useAuthStore.getState().setSession(user, data.access_token, data.refresh_token);
      if (rememberMe) await storage.setItem(REMEMBER_ME_KEY, "true");
      useAppStore.getState().markSynced();
      return user;
    } catch (error) {
      useAppStore.getState().setOffline(true);
      throw new Error(getApiErrorMessage(error));
    }
  },

  async register(payload: RegisterPayload): Promise<User> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700));
      const user: User = {
        ...MOCK_USER,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
        role: payload.role ?? "tenant",
      };
      await storage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      useAuthStore.getState().setSession(user, "demo-token", "demo-refresh");
      return user;
    }

    const { data } = await api.post("/auth/register", payload);
    const user = mapApiUser(data);
    useAuthStore.getState().setUser(user);
    return user;
  },

  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await api.post("/auth/forgot-password", { email });
  },

  async refreshTokens(): Promise<boolean> {
    const refresh = await storage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh || USE_MOCK) return false;
    try {
      const { data } = await api.post<AuthTokens>("/auth/refresh", { refresh_token: refresh });
      await persistTokens(data);
      useAppStore.getState().markSynced();
      return true;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    if (!USE_MOCK) {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore
      }
    }
    await storage.removeItem(MOCK_USER_KEY);
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    useAuthStore.getState().clearSession();
  },

  async restoreSession(): Promise<User | null> {
    if (USE_MOCK) {
      const stored = await storage.getItem(MOCK_USER_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored) as User;
      useAuthStore.getState().setSession(user, "demo-token", "demo-refresh");
      return user;
    }

    const token = await storage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    try {
      const { data } = await api.get("/auth/me");
      const user = mapApiUser(data);
      const refresh = (await storage.getItem(REFRESH_TOKEN_KEY)) ?? "";
      useAuthStore.getState().setSession(user, token, refresh);
      useAppStore.getState().markSynced();
      return user;
    } catch {
      const refreshed = await authService.refreshTokens();
      if (refreshed) return useAuthStore.getState().user;
      useAppStore.getState().setOffline(true);
      return null;
    }
  },

  /** Demo role switch — mock mode only */
  getDemoUserForRole(role: "flatmate" | "landlord"): User {
    const legacy = role === "landlord" ? LANDLORD_USER : FLATMATE_USER;
    return mapDemoUser(legacy);
  },
};
