import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./api";
import { storage } from "../../storage/storage";

let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    if (memoryAccess) return memoryAccess;
    const stored = await storage.getItem(ACCESS_TOKEN_KEY);
    if (stored) memoryAccess = stored;
    return stored;
  },

  async getRefreshToken(): Promise<string | null> {
    if (memoryRefresh) return memoryRefresh;
    const stored = await storage.getItem(REFRESH_TOKEN_KEY);
    if (stored) memoryRefresh = stored;
    return stored;
  },

  async setTokens(access: string, refresh: string): Promise<void> {
    memoryAccess = access;
    memoryRefresh = refresh;
    await storage.setItem(ACCESS_TOKEN_KEY, access);
    await storage.setItem(REFRESH_TOKEN_KEY, refresh);
    await storage.saveToken(access);
  },

  async clearTokens(): Promise<void> {
    memoryAccess = null;
    memoryRefresh = null;
    await storage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    await storage.removeToken();
  },
};
