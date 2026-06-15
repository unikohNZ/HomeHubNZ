import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "homehub_auth_token";
const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Key may already be absent.
  }
}

/**
 * Cross-platform secure storage.
 * iOS/Android → SecureStore (Keychain / Keystore)
 * Web → AsyncStorage
 */
export const storage = {
  saveToken(token: string): Promise<void> {
    return setItem(TOKEN_KEY, token);
  },

  getToken(): Promise<string | null> {
    return getItem(TOKEN_KEY);
  },

  removeToken(): Promise<void> {
    return removeItem(TOKEN_KEY);
  },

  getItem,
  setItem,
  removeItem,

  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map(removeItem));
  },
};
