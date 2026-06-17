import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "../../storage/storage";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getToken,
  removeToken,
  saveToken,
} from "./tokenStorage";

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./tokenStorage";

/**
 * Central Axios instance for HomeHub NZ.
 *
 * Default base URL targets the local FastAPI backend:
 * - iOS simulator / web: http://127.0.0.1:8000
 * - Android emulator: http://10.0.2.2:8000 (uncomment ANDROID line below)
 *
 * Override with EXPO_PUBLIC_API_URL for staging / production.
 */

function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Android emulator — uncomment to reach host machine localhost:
  // if (Platform.OS === "android") return "http://10.0.2.2:8000";

  // iOS simulator, web preview, and default dev
  return "http://127.0.0.1:8000";
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_V1_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_V1_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          await saveToken(data.access_token, data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          await removeToken();
        }
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "Request timed out";
    if (!error.response) return "Cannot reach the backend server";
    const detail = error.response.data as { detail?: string | { msg: string }[] };
    if (typeof detail?.detail === "string") return detail.detail;
    if (Array.isArray(detail?.detail)) return detail.detail[0]?.msg ?? "Request failed";
    return `Request failed (${error.response.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default api;
