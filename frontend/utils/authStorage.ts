import { User } from "../types/user";
import { storage } from "../storage/storage";

const USER_SESSION_KEY = "homehub_user_session";
const REMEMBER_ME_KEY = "homehub_remember_me";

export const authStorage = {
  async saveSession(user: User, token: string, rememberMe: boolean): Promise<void> {
    await storage.saveToken(token);
    if (rememberMe) {
      await storage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      await storage.setItem(REMEMBER_ME_KEY, "true");
    } else {
      await storage.removeItem(USER_SESSION_KEY);
      await storage.setItem(REMEMBER_ME_KEY, "false");
    }
  },

  async getSession(): Promise<{ user: User; token: string } | null> {
    const remember = await storage.getItem(REMEMBER_ME_KEY);
    const token = await storage.getToken();
    const raw = await storage.getItem(USER_SESSION_KEY);
    if (!token) return null;
    if (remember === "false" || !raw) return null;
    try {
      return { user: JSON.parse(raw) as User, token };
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await storage.multiRemove([USER_SESSION_KEY, REMEMBER_ME_KEY]);
    await storage.removeToken();
  },

  async setRememberMe(value: boolean): Promise<void> {
    await storage.setItem(REMEMBER_ME_KEY, value ? "true" : "false");
  },
};
