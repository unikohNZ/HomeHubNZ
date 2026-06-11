import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          await SecureStore.setItemAsync("access_token", data.access_token);
          await SecureStore.setItemAsync("refresh_token", data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: Record<string, string>) => api.post("/auth/register", data),
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, new_password: string) =>
    api.post("/auth/reset-password", { token, new_password }),
};

// Properties
export const propertiesApi = {
  list: () => api.get("/properties"),
  get: (id: number) => api.get(`/properties/${id}`),
  create: (data: Record<string, unknown>) => api.post("/properties", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/properties/${id}`, data),
  delete: (id: number) => api.delete(`/properties/${id}`),
};

// Rent
export const rentApi = {
  ledger: (leaseId: number) => api.get("/rent/ledger", { params: { lease_id: leaseId } }),
  analytics: (leaseIds: number[]) =>
    api.get("/rent/analytics", { params: { lease_ids: leaseIds.join(",") } }),
  submitPayment: (id: number, data: Record<string, unknown>) =>
    api.put(`/rent/payments/${id}/submit`, data),
  outstanding: (leaseIds: number[]) =>
    api.get("/rent/outstanding", { params: { lease_ids: leaseIds.join(",") } }),
};

// Maintenance
export const maintenanceApi = {
  list: (propertyId: number) => api.get("/maintenance", { params: { property_id: propertyId } }),
  create: (data: Record<string, unknown>) => api.post("/maintenance", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/maintenance/${id}`, data),
};

// Bills
export const billsApi = {
  list: (propertyId: number) => api.get("/bills", { params: { property_id: propertyId } }),
  create: (data: Record<string, unknown>) => api.post("/bills", data),
};

// Chat
export const chatApi = {
  rooms: () => api.get("/chat/rooms"),
  messages: (roomId: number) => api.get(`/chat/rooms/${roomId}/messages`),
  send: (roomId: number, content: string) =>
    api.post(`/chat/rooms/${roomId}/messages`, { content }),
};

// Notifications
export const notificationsApi = {
  list: () => api.get("/notifications"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
  registerDevice: (pushToken: string, platform: string) =>
    api.post("/notifications/register-device", { push_token: pushToken, platform }),
};

// Calendar
export const calendarApi = {
  events: (params?: Record<string, string>) => api.get("/calendar/events", { params }),
};

// AI
export const aiApi = {
  suggestMaintenance: (title: string, description: string) =>
    api.post("/ai/maintenance/suggest", { title, description }),
  chat: (message: string) => api.post("/ai/chat", { message }),
};
