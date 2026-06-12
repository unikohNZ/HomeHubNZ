import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Cross-platform key/value storage.
 *
 * Uses expo-secure-store on iOS/Android (encrypted keychain) and falls back
 * to localStorage on web, where SecureStore is not available. This keeps the
 * auth/session layer working identically across iPhone, Android and web.
 */

const isWeb = Platform.OS === "web";

function webGet(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return webGet(key);
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // storage may be unavailable (private mode) — ignore
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
