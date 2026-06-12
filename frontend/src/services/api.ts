import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "./storage";

/**
 * Central Axios instance for HomeHub NZ.
 *
 * Base URL points at the local FastAPI backend by default and can be
 * overridden with EXPO_PUBLIC_API_URL for staging / production (AWS EC2).
 * JWT access tokens are attached automatically and refreshed on 401.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const API_V1_URL = `${API_BASE_URL}/api/v1`;

export const ACCESS_TOKEN_KEY = "homehub_access_token";
export const REFRESH_TOKEN_KEY = "homehub_refresh_token";

const api = axios.create({
  baseURL: API_V1_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getItem(ACCESS_TOKEN_KEY);
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
          await storage.setItem(ACCESS_TOKEN_KEY, data.access_token);
          await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          await storage.removeItem(ACCESS_TOKEN_KEY);
          await storage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
