import { storage } from "../../storage/storage";

export const ACCESS_TOKEN_KEY = "homehub_access_token";
export const REFRESH_TOKEN_KEY = "homehub_refresh_token";
const USER_KEY = "homehub_user";

let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;

export async function saveToken(access: string, refresh?: string): Promise<void> {
  memoryAccess = access;
  await storage.setItem(ACCESS_TOKEN_KEY, access);
  await storage.saveToken(access);
  if (refresh !== undefined) {
    memoryRefresh = refresh;
    await storage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

export async function getToken(): Promise<string | null> {
  if (memoryAccess) return memoryAccess;
  const stored = await storage.getItem(ACCESS_TOKEN_KEY);
  if (stored) memoryAccess = stored;
  return stored;
}

export async function removeToken(): Promise<void> {
  memoryAccess = null;
  memoryRefresh = null;
  await storage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  await storage.removeToken();
}

export async function saveUser(user: object): Promise<void> {
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser<T = object>(): Promise<T | null> {
  const raw = await storage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function removeUser(): Promise<void> {
  await storage.removeItem(USER_KEY);
}
