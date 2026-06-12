import api, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./api";
import { storage } from "./storage";
import { AuthTokens, User, UserRole } from "@/types";
import { MOCK_USER } from "@/data/mockData";

/**
 * Auth service. Currently runs in mock mode so the app is fully usable
 * without a backend. Flip USE_MOCK to false once the FastAPI /auth routes
 * are live to switch to real JWT authentication.
 */

const USE_MOCK = true;
const MOCK_USER_KEY = "homehub_mock_user";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

async function persistTokens(tokens: AuthTokens) {
  await storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  await storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700));
      const user: User = { ...MOCK_USER, email };
      await storage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      return user;
    }
    const { data } = await api.post("/auth/login", { email, password });
    await persistTokens(data);
    const me = await api.get("/auth/me");
    return me.data;
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
      return user;
    }
    const { data } = await api.post("/auth/register", payload);
    await persistTokens(data.tokens);
    return data.user;
  },

  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700));
      return;
    }
    await api.post("/auth/forgot-password", { email });
  },

  async logout(): Promise<void> {
    if (!USE_MOCK) {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore network errors on logout
      }
    }
    await storage.removeItem(MOCK_USER_KEY);
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
  },

  async restoreSession(): Promise<User | null> {
    if (USE_MOCK) {
      const stored = await storage.getItem(MOCK_USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    }
    const token = await storage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch {
      return null;
    }
  },
};
