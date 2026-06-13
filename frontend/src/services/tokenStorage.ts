import { Platform } from "react-native";

const ACCESS_KEY = "homehub_access_token";
const REFRESH_KEY = "homehub_refresh_token";

const isWeb = Platform.OS === "web";

let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;

function webGet(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (private mode)
  }
}

function webRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    if (memoryAccess) return memoryAccess;
    if (isWeb) return webGet(ACCESS_KEY);
    return memoryAccess;
  },

  async getRefreshToken(): Promise<string | null> {
    if (memoryRefresh) return memoryRefresh;
    if (isWeb) return webGet(REFRESH_KEY);
    return memoryRefresh;
  },

  async setTokens(access: string, refresh: string): Promise<void> {
    memoryAccess = access;
    memoryRefresh = refresh;
    if (isWeb) {
      webSet(ACCESS_KEY, access);
      webSet(REFRESH_KEY, refresh);
    }
  },

  async clearTokens(): Promise<void> {
    memoryAccess = null;
    memoryRefresh = null;
    if (isWeb) {
      webRemove(ACCESS_KEY);
      webRemove(REFRESH_KEY);
    }
  },
};
